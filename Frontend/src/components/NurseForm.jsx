// NurseForm.jsx: Form for vitals, symptoms, photo. Submits to backend.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const NurseForm = () => {
  const [vitals, setVitals] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [photo, setPhoto] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    let photoBase64 = null
    if (photo) {
      const reader = new FileReader()
      reader.readAsDataURL(photo)
      reader.onloadend = async () => {
        photoBase64 = reader.result
        await submitData(photoBase64)
      }
    } else {
      await submitData(null)
    }
  }

  const submitData = async (photoBase64) => {
    try {
      await axios.post('/api/submit-patient', { vitals, symptoms, photo: photoBase64 })
      toast.success('Patient submitted!')
      setVitals('')
      setSymptoms('')
      setPhoto(null)
    } catch (err) {
      toast.error('Submission failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Enter Patient Details</h2>
      <textarea
        placeholder="Vitals (e.g., BP: 120/80, Temp: 98.6)"
        value={vitals}
        onChange={(e) => setVitals(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <textarea
        placeholder="Symptoms"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
        className="mb-4"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Submit
      </button>
      <button onClick={() => navigate('/')} className="ml-4 text-gray-500">
        Back
      </button>
    </form>
  )
}

export default NurseForm