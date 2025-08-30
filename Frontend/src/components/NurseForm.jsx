// NurseForm.jsx: Structured vitals inputs, modern form styling.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const NurseForm = () => {
  const [temperature, setTemperature] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [oxygenSaturation, setOxygenSaturation] = useState('')
  const [painScore, setPainScore] = useState('')
  const [bloodSugar, setBloodSugar] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [photo, setPhoto] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const vitals = `Temp: ${temperature}, BP: ${bloodPressure}, HR: ${heartRate}, RR: ${respiratoryRate}, O2: ${oxygenSaturation}, Pain: ${painScore}, Glucose: ${bloodSugar}`
    let photoBase64 = null
    if (photo) {
      const reader = new FileReader()
      reader.readAsDataURL(photo)
      reader.onloadend = async () => {
        photoBase64 = reader.result
        await submitData(vitals, photoBase64)
      }
    } else {
      await submitData(vitals, null)
    }
  }

  const submitData = async (vitals, photoBase64) => {
    try {
      await axios.post('/api/submit-patient', { vitals, symptoms, photo: photoBase64 })
      toast.success('Patient submitted successfully!')
      // Reset fields
      setTemperature(''); setBloodPressure(''); setHeartRate(''); setRespiratoryRate('');
      setOxygenSaturation(''); setPainScore(''); setBloodSugar(''); setSymptoms(''); setPhoto(null);
    } catch (err) {
      toast.error('Submission failed - check console')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter Patient Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Temperature (e.g., 98.6°F)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Blood Pressure (e.g., 120/80)"
          value={bloodPressure}
          onChange={(e) => setBloodPressure(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Heart Rate (e.g., 72 bpm)"
          value={heartRate}
          onChange={(e) => setHeartRate(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Respiratory Rate (e.g., 16 breaths/min)"
          value={respiratoryRate}
          onChange={(e) => setRespiratoryRate(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Oxygen Saturation (e.g., 98%)"
          value={oxygenSaturation}
          onChange={(e) => setOxygenSaturation(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Pain Score (1-10)"
          value={painScore}
          onChange={(e) => setPainScore(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Blood Sugar (e.g., 100 mg/dL)"
          value={bloodSugar}
          onChange={(e) => setBloodSugar(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <textarea
        placeholder="Symptoms Description"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
        className="mb-6 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="flex justify-between">
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition">
          Submit
        </button>
        <button onClick={() => navigate('/')} className="text-gray-600 px-6 py-3 rounded-md hover:underline">
          Back
        </button>
      </div>
    </form>
  )
}

export default NurseForm