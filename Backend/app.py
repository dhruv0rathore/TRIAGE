from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import base64
from google.generativeai import configure, GenerativeModel
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend dev

# In-memory queues: pending (unprocessed), queue (sorted processed)
pending_patients = []
processed_queue = []  # Sorted by priority descending

# Configure Gemini once, but key set per request (passed from frontend)
def get_gemini_model(api_key):
    configure(api_key=api_key)
    return GenerativeModel('gemini-1.5-pro')  # Use Pro for multimodal

# Route: Nurse submits patient data
@app.route('/submit-patient', methods=['POST'])
def submit_patient():
    data = request.json
    patient = {
        'id': str(uuid.uuid4()),
        'vitals': data['vitals'],
        'symptoms': data['symptoms'],
        'photo': data.get('photo')  # Base64 string or None
    }
    pending_patients.append(patient)
    return jsonify({'success': True, 'id': patient['id']})

# Route: Admin gets pending patients
@app.route('/get-pending', methods=['GET'])
def get_pending():
    return jsonify(pending_patients)

# Route: Admin processes patient with AI
@app.route('/process-patient', methods=['POST'])
def process_patient():
    data = request.json
    patient_id = data['id']
    api_key = data['api_key']  # Passed from frontend

    # Find patient
    patient = next((p for p in pending_patients if p['id'] == patient_id), None)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    # Build Gemini prompt
    prompt = f"Analyze symptoms: {patient['symptoms']}, vitals: {patient['vitals']}. Assign priority (1-10, 10=critical), suggested doctor (e.g., cardiologist), and generate short report."
    content = [{'text': prompt}]

    if patient['photo']:
        # Add image if present
        content.append({
            'inline_data': {
                'mime_type': 'image/jpeg',  # Assume JPEG; adjust if needed
                'data': patient['photo'].split(',')[1]  # Strip base64 prefix
            }
        })

    # Call Gemini
    model = get_gemini_model(api_key)
    response = model.generate_content(content)

    # Parse response (assume structured text; parse simply)
    text = response.text
    priority = 5  # Default
    doctor = 'General'
    report = text
    try:
        lines = text.split('\n')
        priority = int(lines[0].split(':')[-1].strip()) if 'priority' in lines[0].lower() else priority
        doctor = lines[1].split(':')[-1].strip() if 'doctor' in lines[1].lower() else doctor
        report = '\n'.join(lines[2:])
    except:
        pass  # Fallback to raw

    # Return for head nurse to confirm/override
    return jsonify({
        'priority': priority,
        'doctor': doctor,
        'report': report
    })

# Route: Admin finalizes patient (overrides, adds to queue, fakes alert if top)
@app.route('/finalize-patient', methods=['POST'])
def finalize_patient():
    data = request.json
    patient_id = data['id']
    priority = data['priority']
    doctor = data['doctor']
    report = data['report']

    # Move from pending to processed
    patient = next((p for p in pending_patients if p['id'] == patient_id), None)
    if patient:
        pending_patients.remove(patient)
        patient.update({'priority': priority, 'doctor': doctor, 'report': report})
        processed_queue.append(patient)
        # Sort queue descending by priority
        processed_queue.sort(key=lambda p: p['priority'], reverse=True)

    # Fake alert if this is now top (next patient)
    alert_sent = False
    if processed_queue and processed_queue[0]['id'] == patient_id:
        alert_sent = True  # In real: send email/Twilio

    return jsonify({'success': True, 'alert_sent': alert_sent, 'queue': processed_queue})

# Route: Get current queue
@app.route('/get-queue', methods=['GET'])
def get_queue():
    return jsonify(processed_queue)

if __name__ == '__main__':
    app.run(debug=True, port=5000)