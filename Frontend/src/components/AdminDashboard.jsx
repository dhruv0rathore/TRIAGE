import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Color mapping for priority levels in the UI
const priorityColor = (priority) => {
  if (priority >= 8) return 'bg-red-500/20 text-red-300 border-red-500';
  if (priority >= 5) return 'bg-orange-500/20 text-orange-300 border-orange-500';
  return 'bg-green-500/20 text-green-300 border-green-500';
};

const AdminDashboard = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiKey') || '');
  const [pending, setPending] = useState([]);
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [priority, setPriority] = useState(5);
  const [doctor, setDoctor] = useState('General');
  const [report, setReport] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Prompt for API key on first load if not found in local storage
    if (!apiKey) {
      const key = prompt('Enter Gemini API Key:');
      if (key) {
        setApiKey(key);
        localStorage.setItem('geminiKey', key);
      } else {
        navigate('/'); // If they cancel, send them back to the landing page
      }
    }
    // Fetch initial data immediately
    fetchPending();
    fetchQueue();
    // Set up an interval to poll for new data every 5 seconds
    const interval = setInterval(() => {
      fetchPending();
      fetchQueue();
    }, 5000);
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [apiKey, navigate]);

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/get-pending');
      setPending(res.data);
    } catch {
      // Silently fail, don't spam the user with errors on a poll
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await axios.get('/api/get-queue');
      setQueue(res.data);
    } catch {
      // Silently fail
    }
  };

  const handleProcess = async (patient) => {
    try {
      toast.info("Analyzing with Cortex AI...");
      const res = await axios.post('/api/process-patient', { id: patient.id, api_key: apiKey });
      setProcessing(patient);
      setPriority(res.data.priority);
      setDoctor(res.data.doctor);
      setReport(res.data.report);
      toast.dismiss(); // Dismiss the loading toast
      toast.success("AI analysis complete. Please review.");
    } catch {
      toast.error('AI analysis failed. Check API key or backend server.');
    }
  };

  const handleFinalize = async () => {
    if (!processing) return;
    try {
      const res = await axios.post('/api/finalize-patient', {
        id: processing.id,
        priority,
        doctor,
        report
      });
      // Give a more impactful alert for critical cases
      if (res.data.alert_sent) {
        toast.warn(`CRITICAL ALERT SENT TO ${doctor.toUpperCase()} FOR PATIENT ${processing.id.slice(0,8)}!`, { autoClose: 5000 });
      } else {
        toast.success("Patient added to queue.");
      }
      setProcessing(null);
      // Immediately fetch new data instead of waiting for the next poll
      fetchPending();
      fetchQueue();
    } catch {
      toast.error('Finalize failed. Check backend server.');
    }
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Review Column */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Pending Review ({pending.length})</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {pending.length > 0 ? pending.map(p => (
              <div key={p.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 font-mono">{p.id.slice(0, 8)}</p>
                <p className="mt-2 text-gray-300"><span className="font-semibold text-gray-100">Vitals:</span> {p.vitals}</p>
                <p className="mt-1 text-gray-300"><span className="font-semibold text-gray-100">Symptoms:</span> {p.symptoms}</p>
                <button onClick={() => handleProcess(p)} className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">
                  Run AI Analysis
                </button>
              </div>
            )) : <p className="text-gray-500 text-center py-8">No patients waiting for review.</p>}
          </div>
        </div>

        {/* Processing & Live Queue Column */}
        <div className="space-y-8">
          {processing && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/50 rounded-2xl p-6 shadow-2xl ring-2 ring-blue-500">
              <h2 className="text-2xl font-bold mb-4">AI Review for <span className="text-blue-400 font-mono">{processing.id.slice(0,8)}</span></h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Priority (1-10)</label>
                    <input type="number" value={priority} onChange={e => setPriority(parseInt(e.target.value))} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-lg"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Assign to</label>
                    <input value={doctor} onChange={e => setDoctor(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-lg"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">AI Generated Report</label>
                  <textarea value={report} onChange={e => setReport(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-lg" rows="4"/>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setProcessing(null)} className="w-1/2 bg-gray-700 text-gray-200 font-semibold py-2 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                  <button onClick={handleFinalize} className="w-1/2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition">Finalize & Add to Queue</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Live Queue ({queue.length})</h2>
            <div className="space-y-2">
              {queue.length > 0 ? queue.map((p, idx) => (
                <div key={p.id} className={`p-3 rounded-lg flex justify-between items-center border ${idx === 0 ? 'bg-blue-600/30 border-blue-500' : 'bg-gray-900 border-gray-700'}`}>
                  <div>
                    <p className="font-bold font-mono text-gray-200">{idx + 1}. {p.id.slice(0,8)}</p>
                    <p className="text-sm text-gray-400">Assigned to: {p.doctor}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full border ${priorityColor(p.priority)}`}>
                    PRIORITY: {p.priority}
                  </span>
                </div>
              )) : <p className="text-gray-500 text-center py-8">Queue is empty.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;