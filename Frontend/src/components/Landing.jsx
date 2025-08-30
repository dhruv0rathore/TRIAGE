// Landing.jsx: Entry with nurse/admin buttons. Title moved to header, so simplified.
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="text-center mt-10">
      <button
        onClick={() => navigate('/nurse')}
        className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-blue-700 transition mr-4"
      >
        Nurse Mode
      </button>
      <button
        onClick={() => navigate('/admin')}
        className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition"
      >
        Admin (Head Nurse)
      </button>
    </div>
  )
}

export default Landing