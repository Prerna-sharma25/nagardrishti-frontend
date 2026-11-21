import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  MapPin, Play, CheckCircle, Eye, X, Search, FilterX,ChevronDown, 
  Calendar, User, Phone, Camera, Upload, ShieldCheck 
} from 'lucide-react';

const FieldWorkerTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal & Upload State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showUploadStep, setShowUploadStep] = useState(false);
  const [uploadType, setUploadType] = useState('before'); // 'before' or 'after'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [workNote, setWorkNote] = useState('');

  const fetchTasks = async () => {
    try {
      // API Endpoint
      const response = await api.get('/field/my-tasks'); 
      const myTasks = Array.isArray(response.data.data) ? response.data.data : [];
      
      // Filter only active tasks
      const activeTasks = myTasks.filter(c => ['assigned', 'in_progress'].includes(c.status));
      
      // Sort latest first
      activeTasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setTasks(activeTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleActionSubmit = async () => {
    if (!imageFile) return alert(`Please upload a ${uploadType === 'before' ? 'Before' : 'After'} image.`);
    if (uploadType === 'after' && !workNote.trim()) return alert("Please provide a short work note.");

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append(uploadType === 'before' ? 'beforeImage' : 'afterImage', imageFile);
      if(uploadType === 'after') {
        formData.append('workNote', workNote);
      }

      // API Endpoints for Start & Resolve
      if (uploadType === 'before') {
        await api.put(`/field/complaints/${selectedTask._id}/start`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.put(`/field/complaints/${selectedTask._id}/resolve`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      fetchTasks(); // Refresh list to reflect status
      closeModal();
    } catch (error) {
      console.error("API Error:", error);
      alert(error.response?.data?.message || "Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (task, showUpload = false, type = 'before') => {
    setSelectedTask(task);
    setShowUploadStep(showUpload);
    setUploadType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowUploadStep(false);
    setImageFile(null);
    setImagePreview(null);
    setWorkNote('');
  };

  const filteredTasks = tasks.filter(t => {
    const searchStr = searchTerm.toLowerCase().replace('#', '');
    const idMatch = t._id.toLowerCase().includes(searchStr);
    const addressMatch = t.address?.toLowerCase().includes(searchStr);
    const categoryMatch = t.aiAnalysis?.category?.toLowerCase().includes(searchStr);
    const matchesSearch = idMatch || addressMatch || categoryMatch;
    const matchesPriority = priorityFilter === 'all' || t.aiAnalysis?.severity === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getStatusColor = (status) => {
    if (status === 'assigned') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (status === 'in_progress') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-stone-100 text-stone-600 border-stone-200';
  };

  const getPriorityColor = (severity) => {
    if (severity === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (severity === 'medium') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading active tasks...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">My Tasks</h1>
          <p className="text-sm text-stone-500 mt-1">Hello {user?.name}, here are your active tasks.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-3 w-full mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" placeholder="Search by ID, location, or category..." 
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-48 flex-shrink-0">
          <select 
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
            value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {searchTerm !== '' || priorityFilter !== 'all' ? (
          <button onClick={() => { setSearchTerm(''); setPriorityFilter('all'); }} className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2 flex-shrink-0">
            <FilterX size={16} /> Clear Filters
          </button>
        ) : (
          <div className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl border border-stone-200 text-center flex-shrink-0 whitespace-nowrap">
            Showing: {filteredTasks.length}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Task ID</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-stone-500">No active tasks. You're all caught up!</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-stone-700 font-mono whitespace-nowrap">#{task._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={task.imageUrl || 'https://via.placeholder.com/100'} alt="issue" className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                        <span className="font-bold text-stone-800 capitalize">{task.aiAnalysis?.category?.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      <div className="flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 text-stone-400 shrink-0" /><span className="line-clamp-1 max-w-[150px]">{task.address}</span></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Calendar size={14} className="text-stone-400 shrink-0" />{new Date(task.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                    </td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getPriorityColor(task.aiAnalysis?.severity)}`}>{task.aiAnalysis?.severity || 'Low'}</span></td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getStatusColor(task.status)}`}>{task.status.replace('_', ' ')}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(task, false)} className="p-2 text-stone-400 hover:text-teal-600 bg-white hover:bg-teal-50 border border-transparent hover:border-teal-100 rounded-lg transition-all"><Eye size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-stone-200">
            
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Task Details</h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">ID: {selectedTask._id}</p>
              </div>
              <button onClick={closeModal} className="bg-[#0f766e] text-white hover:bg-[#115e59] p-2 rounded-full transition-colors shadow-sm"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto bg-stone-50/30 flex-1">
              {showUploadStep ? (
                /* Upload Form */
                <div className="max-w-md mx-auto py-6 text-center animate-in fade-in duration-300">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border bg-teal-50 border-teal-100 text-[#0f766e]">
                    {uploadType === 'before' ? <Camera size={32} /> : <CheckCircle size={32} />}
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">Upload "{uploadType === 'before' ? 'Before' : 'After'}" Image</h3>
                  
                  <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 bg-white mb-4 hover:border-teal-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-stone-200" />
                        <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-red-500 hover:bg-red-50"><X size={16}/></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-3 py-4">
                        <div className="p-3 bg-teal-50 rounded-full text-[#0f766e]"><Upload size={24} /></div>
                        <div><span className="text-sm font-bold text-teal-600 hover:text-teal-700 block mb-1">Click to open Camera</span></div>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  {uploadType === 'after' && (
                    <div className="mb-6 text-left">
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Work Note (Required)</label>
                      <textarea 
                        rows="2" placeholder="e.g. Pothole filled and cleaned." 
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={workNote} onChange={(e) => setWorkNote(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-4 flex gap-3 justify-center">
                    <button onClick={() => setShowUploadStep(false)} className="px-6 py-2.5 rounded-xl font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 shadow-sm">Back</button>
                    <button onClick={handleActionSubmit} disabled={!imageFile || isUpdating} className="px-6 py-2.5 rounded-xl font-bold text-white shadow-sm disabled:opacity-50 flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] transition-colors">
                      {isUpdating ? 'Processing...' : (uploadType === 'before' ? <><Play size={18}/> Confirm & Start</> : <><CheckCircle size={18}/> Submit & Resolve</>)}
                    </button>
                  </div>
                </div>
              ) : (
                /* Details View */
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
                      <img src={selectedTask.imageUrl || 'https://via.placeholder.com/400'} alt="Issue" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold text-stone-800 mb-2">Description</h3>
                      <p className="text-sm text-stone-600 mb-4">{selectedTask.description}</p>
                      <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><MapPin size={16} /> Location</h3>
                      <p className="text-sm text-stone-600 font-medium">{selectedTask.address}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Citizen Details</h3>
                      <div className="space-y-3 text-sm">
                        <p className="flex justify-between"><span className="text-stone-500 flex items-center gap-2"><User size={14}/> Name:</span> <span className="font-semibold text-stone-800">{selectedTask.citizenName || 'N/A'}</span></p>
                        <p className="flex justify-between"><span className="text-stone-500 flex items-center gap-2"><Phone size={14}/> Phone:</span> <span className="font-semibold text-stone-800">{selectedTask.citizenPhone || 'N/A'}</span></p>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 border-b border-stone-100 pb-2"><ShieldCheck size={18} className="text-teal-600"/> AI Analysis</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center"><span className="text-stone-500">Category</span><span className="font-semibold text-stone-800 capitalize">{selectedTask.aiAnalysis?.category?.replace('_', ' ')}</span></div>
                        <div className="flex justify-between items-center"><span className="text-stone-500">Severity</span><span className={`px-2 py-0.5 rounded text-xs font-bold capitalize border ${getPriorityColor(selectedTask.aiAnalysis?.severity)}`}>{selectedTask.aiAnalysis?.severity}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!showUploadStep && (
              <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                {selectedTask.status === 'assigned' && (
                  <button onClick={() => { setUploadType('before'); setShowUploadStep(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#0f766e] text-white hover:bg-[#115e59] rounded-xl text-sm font-bold shadow-sm"><Camera size={16} /> Start Work</button>
                )}
                {selectedTask.status === 'in_progress' && (
                  <button onClick={() => { setUploadType('after'); setShowUploadStep(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#0f766e] text-white hover:bg-[#115e59] rounded-xl text-sm font-bold shadow-sm"><CheckCircle size={16} /> Mark Resolved</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldWorkerTasks;