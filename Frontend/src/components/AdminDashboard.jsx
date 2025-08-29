// AdminDashboard.jsx: Queue view, pending list, AI process, finalize. Prompts for Gemini key on load.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const AdminDashboard = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiKey') || '')
  const [pending, setPending] = useState([])
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(null)  // Current patient being processed
  const [priority, setPriority] = useState(5)
  const [doctor, setDoctor] = useState('General')
  const [report, setReport] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!apiKey) {
      const key = prompt('Enter Gemini API Key:')
      if (key) {
        setApiKey(key)
        localStorage.setItem('geminiKey', key)
      } else {
        navigate('/')
      }
    }
    fetchPending()
    fetchQueue()
    const interval = setInterval(() => { fetchPending(); fetchQueue() }, 5000)  // Poll
    return () => clearInterval(interval)
  }, [apiKey])

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/get-pending')
      setPending(res.data)
    } catch {}
  }

  const fetchQueue = async () => {
    try {
      const res = await axios.get('/api/get-queue')
      setQueue(res.data)
    } catch {}
  }

  const handleProcess = async (patient) => {
    try {
      const res = await axios.post('/api/process-patient', { id: patient.id, api_key: apiKey })
      setProcessing(patient)
      setPriority(res.data.priority)
      setDoctor(res.data.doctor)
      setReport(res.data.report)
    } catch {
      toast.error('AI analysis failed')
    }
  }

  const handleFinalize = async () => {
    try {
      const res = await axios.post('/api/finalize-patient', {
        id: processing.id,
        priority,
        doctor,
        report
      })
      if (res.data.alert_sent) {
        toast.success(`Alert sent to ${doctor}! Report: ${report}`)
      }
      setProcessing(null)
      fetchPending()
      fetchQueue()
    } catch {
      toast.error('Finalize failed')
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Head Nurse Dashboard</h2>
      <div className="mb-8">
        <h3 className="text-xl mb-2">Pending Patients</h3>
        {pending.map(p => (
          <div key={p.id} className="p-2 border mb-2 rounded flex justify-between">
            <div>
              <p>ID: {p.id}</p>
              <p>Vitals: {p.vitals}</p>
              <p>Symptoms: {p.symptoms}</p>
            </div>
            <button onClick={() => handleProcess(p)} className="bg-green-500 text-white px-2 py-1 rounded">
              Analyze
            </button>
          </div>
        ))}
      </div>
      {processing && (
        <div className="mb-8">
          <h3 className="text-xl mb-2">Processing Patient {processing.id}</h3>
          <input
            type="number"
            value={priority}
            onChange={e => setPriority(parseInt(e.target.value))}
            className="p-2 border rounded mb-2"
            placeholder="Priority (1-10)"
          />
          <input
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            className="p-2 border rounded mb-2"
            placeholder="Doctor"
          />
          <textarea
            value={report}
            onChange={e => setReport(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Report"
          />
          <button onClick={handleFinalize} className="bg-blue-500 text-white px-4 py-2 rounded">
            Finalize
          </button>
        </div>
      )}
      <div>
        <h3 className="text-xl mb-2">Current Queue (High Priority First)</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Doctor</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((p, idx) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.priority}</td>
                <td className="p-2">{p.doctor}</td>
                <td className="p-2">{idx === 0 ? 'Next - Alert Sent' : 'Waiting'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => navigate('/')} className="mt-4 text-gray-500">
        Logout
      </button>
    </div>
  )
}

export default AdminDashboard