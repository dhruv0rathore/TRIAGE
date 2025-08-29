// App.jsx: Router for landing, nurse, admin.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing.jsx'
import NurseForm from './components/NurseForm.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/nurse" element={<NurseForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App