from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import uuid
import base64
from google.generativeai import configure, GenerativeModel
import os
import json
import time

# --- CONFIGURATION ---
app = Flask(__name__,
            static_folder='static',
            template_folder='templates')
CORS(app)

# --- IN-MEMORY DATABASE ---
pending_patients = []
processed_queue = []

# ==============================================================================
# --- FRONTEND SERVING ROUTES ---
# ==============================================================================

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    return render_template("triage_app.html")

# ==============================================================================
# --- API ENDPOINTS ---
# ==============================================================================

@app.route('/api/submit-patient', methods=['POST'])
def submit_patient():
    data = request.json
    patient = { 'id': str(uuid.uuid4()), 'vitals': data.get('vitals', 'N/A'), 'symptoms': data.get('symptoms', 'N/A'), 'photo': data.get('photo') }
    pending_patients.append(patient)
    return jsonify({'success': True, 'id': patient['id']})

@app.route('/api/get-pending', methods=['GET'])
def get_pending():
    return jsonify(pending_patients)

@app.route('/api/process-patient', methods=['POST'])
def process_patient():
    try:
        data = request.json
        api_key = data.get('api_key')
        patient_id = data.get('id')
        
        if not api_key:
            return jsonify({'error': 'API Key is missing from request'}), 400

        patient = next((p for p in pending_patients if p['id'] == patient_id), None)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404

        prompt = f"""Analyze patient data. Respond ONLY with a valid JSON object in the format: {{"priority": <1-10>, "doctor": "<specialist>", "report": "<summary>"}}. Data -> Vitals: {patient['vitals']}, Symptoms: {patient['symptoms']}"""
        content = [{'text': prompt}]
        if patient.get('photo'):
            content.append({'inline_data': {'mime_type': 'image/jpeg', 'data': patient['photo'].split(',')[1]}})

        configure(api_key=api_key)
        # --- THE UPGRADE: SWITCHING TO THE FASTER MODEL ---
        model = GenerativeModel('gemini-2.5-flash-preview-05-20')
        
        response = model.generate_content(content)
        
        cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
        ai_result = json.loads(cleaned_text)
        
        return jsonify(ai_result)

    except Exception as e:
        # Provide a more detailed error back to the frontend for debugging
        import traceback
        traceback.print_exc()
        return jsonify({'error': f"An internal error occurred in the AI processor: {str(e)}"}), 500

@app.route('/api/finalize-patient', methods=['POST'])
def finalize_patient():
    data = request.json
    patient_id = data.get('id')
    patient = next((p for p in pending_patients if p['id'] == patient_id), None)
    if patient:
        pending_patients.remove(patient)
        patient.update({'priority': data.get('priority', 1), 'doctor': data.get('doctor', 'General'), 'report': data.get('report', 'N/A')})
        processed_queue.append(patient)
        processed_queue.sort(key=lambda p: int(p['priority']), reverse=True)
        alert_sent = processed_queue and processed_queue[0]['id'] == patient_id
        return jsonify({'success': True, 'alert_sent': alert_sent, 'queue': processed_queue})
    return jsonify({'error': 'Patient not found'}), 404

@app.route('/api/get-queue', methods=['GET'])
def get_queue():
    return jsonify(processed_queue)

if __name__ == '__main__':
    # Run with debug=False for the final demo video for max stability
    app.run(host='0.0.0.0', port=5000, debug=False)

