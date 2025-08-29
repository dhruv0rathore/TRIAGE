// Landing.jsx: Entry with nurse/admin buttons. Minimalist buttons.
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-8">AI Hospital Triage</h1>
      <button
        onClick={() => navigate('/nurse')}
        className="bg-blue-500 text-white px-6 py-3 rounded-md mr-4 hover:bg-blue-600"
      >
        Nurse Mode
      </button>
      <button
        onClick={() => navigate('/admin')}
        className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
      >
        Admin (Head Nurse)
      </button>
    </div>
  )
}

export default Landing