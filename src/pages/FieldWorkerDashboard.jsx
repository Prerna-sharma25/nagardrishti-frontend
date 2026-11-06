import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, CheckCircle, Upload, Play, Image as ImageIcon } from 'lucide-react';

const FieldWorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedTask, setSelectedTask] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  
  // Form States
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [workNote, setWorkNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/field/my-tasks');
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStartWork = async (e) => {
    e.preventDefault();
    if (!beforeImage) return alert('Please upload a Before photo');
    
    setActionLoading(true);
    const formData = new FormData();
    formData.append('beforeImage', beforeImage);

    try {
      await api.put(`/field/complaints/${selectedTask._id}/start`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsStartModalOpen(false);
      setBeforeImage(null);
      setSelectedTask(null);
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Error starting work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!afterImage || !workNote) return alert('Please upload After photo and add a note');
    
    setActionLoading(true);
    const formData = new FormData();
    formData.append('afterImage', afterImage);
    formData.append('workNote', workNote);

    try {
      await api.put(`/field/complaints/${selectedTask._id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsResolveModalOpen(false);
      setAfterImage(null);
      setWorkNote('');
      setSelectedTask(null);
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Error resolving work');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'assigned') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'resolved') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-500 mt-1">Hello {user?.name}, here are your assigned tasks.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">You're all caught up!</h2>
          <p className="text-slate-500 mt-2">No tasks are currently assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              <div className="flex items-start gap-4">
                <img src={task.imageUrl} alt="issue" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">ID: {task._id.slice(-6)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${getStatusColor(task.status)}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg capitalize">{task.aiAnalysis?.category?.replace('_', ' ')}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                    <MapPin size={14} /> <span className="line-clamp-1">{task.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                {task.status === 'assigned' && (
                  <button 
                    onClick={() => { setSelectedTask(task); setIsStartModalOpen(true); }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play size={16} /> Start Work
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button 
                    onClick={() => { setSelectedTask(task); setIsResolveModalOpen(true); }}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={16} /> Resolve
                  </button>
                )}
                {task.status === 'resolved' && (
                  <div className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-lg flex items-center gap-2 border border-green-200">
                    <CheckCircle size={16} /> Waiting for Admin Approval
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- START WORK MODAL --- */}
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Start Work</h2>
              <p className="text-sm text-slate-500 mt-1">Upload a photo of the issue before you start.</p>
            </div>
            <form onSubmit={handleStartWork} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setBeforeImage(e.target.files[0])} />
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">{beforeImage ? beforeImage.name : 'Click to upload Before Photo'}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsStartModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">{actionLoading ? 'Uploading...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESOLVE WORK MODAL --- */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Resolve Task</h2>
              <p className="text-sm text-slate-500 mt-1">Upload proof of completion.</p>
            </div>
            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setAfterImage(e.target.files[0])} />
                <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">{afterImage ? afterImage.name : 'Click to upload After Photo'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Work Note</label>
                <textarea required rows="3" className="w-full border p-2 rounded-lg" placeholder="e.g. Pothole filled with asphalt..." value={workNote} onChange={(e) => setWorkNote(e.target.value)}></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsResolveModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">{actionLoading ? 'Submitting...' : 'Submit Proof'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldWorkerDashboard;