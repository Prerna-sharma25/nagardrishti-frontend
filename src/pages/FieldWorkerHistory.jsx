import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  MapPin, CheckCircle, Eye, X, Search, FilterX, 
  Calendar, ShieldCheck, Clock
} from 'lucide-react';

const FieldWorkerHistory = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/complaints'); 
        const allComplaints = Array.isArray(response.data.data) ? response.data.data : [];

        const myHistory = allComplaints.filter(c => {
          const isMyTask = c.assignedTo?._id === user?._id || c.assignedTo === user?._id;
          const isCompleted = ['resolved', 'closed'].includes(c.status);
          return isMyTask && isCompleted;
        });
        
        myHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setTasks(myHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const filteredTasks = tasks.filter(t => {
    const searchStr = searchTerm.toLowerCase().replace('#', '');
    const idMatch = t._id.toLowerCase().includes(searchStr);
    const addressMatch = t.address?.toLowerCase().includes(searchStr);
    const categoryMatch = t.aiAnalysis?.category?.toLowerCase().includes(searchStr);
    return idMatch || addressMatch || categoryMatch;
  });

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading task history...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Task History</h1>
          <p className="text-sm text-stone-500 mt-1">Review the tasks you have successfully resolved or closed.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-3 w-full mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" placeholder="Search history by ID, location, or category..." 
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm !== '' ? (
          <button onClick={() => setSearchTerm('')} className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2 flex-shrink-0">
            <FilterX size={16} /> Clear Search
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
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-500">No task history found.</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-stone-700 font-mono whitespace-nowrap">#{task._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={task.imageUrl} alt="issue" className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                        <span className="font-bold text-stone-800 capitalize">{task.aiAnalysis?.category?.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      <div className="flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 text-stone-400 shrink-0" /><span className="line-clamp-1 max-w-[150px]">{task.address}</span></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Calendar size={14} className="text-stone-400 shrink-0" />{new Date(task.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {task.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
                          <Clock size={12} /> Needs Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider bg-green-50 text-green-700 border-green-200">
                          <CheckCircle size={12} /> Closed
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedTask(task)} className="flex items-center gap-2 px-4 py-2 bg-stone-50 text-stone-700 hover:bg-stone-100 rounded-lg text-sm font-semibold border border-stone-200 transition-colors ml-auto">
                        <Eye size={16} /> View Proof
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-stone-200">
            
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="text-xl font-bold text-stone-800">Resolution Proof</h2>
              <button onClick={() => setSelectedTask(null)} className="bg-[#0f766e] text-white hover:bg-[#115e59] p-2 rounded-full transition-colors shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase mb-2">Before Image</p>
                  <img src={selectedTask.beforeImage || selectedTask.imageUrl} alt="Before" className="w-full h-40 object-cover rounded-xl border border-stone-200" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase mb-2">After Image</p>
                  {selectedTask.afterImage ? (
                    <img src={selectedTask.afterImage} alt="After" className="w-full h-40 object-cover rounded-xl border border-green-500 shadow-sm" />
                  ) : (
                    <div className="w-full h-40 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center text-xs text-stone-400">No Image Uploaded</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h3 className="text-[10px] font-bold text-stone-500 uppercase mb-0.5">Location</h3>
                  <p className="text-sm font-semibold text-stone-800">{selectedTask.address}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h3 className="text-[10px] font-bold text-stone-500 uppercase mb-0.5">Resolved On</h3>
                  <p className="text-sm font-semibold text-stone-800">
                    {selectedTask.resolvedAt ? new Date(selectedTask.resolvedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                <h3 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2"><ShieldCheck size={16}/> Work Note:</h3>
                <p className="text-sm text-green-700">{selectedTask.workNote || 'Task completed successfully.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldWorkerHistory;