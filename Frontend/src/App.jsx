// App.jsx: Router for landing, nurse, admin. Added persistent header for "TRIAGE".
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing.jsx'
import NurseForm from './components/NurseForm.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md py-4 px-6 fixed w-full top-0 z-10">
          <h1 className="text-3xl font-bold text-center text-blue-600 tracking-wider">TRIAGE</h1>
        </header>
        <div className="pt-20 flex flex-col items-center justify-center p-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/nurse" element={<NurseForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App