import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, Eye, X, UserPlus, CheckCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ IMPORT ADD KIYA

const DeptAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [complaints, setComplaints] = useState([]);
  const [fieldTeam, setFieldTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/complaints');
      setComplaints(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldTeam = async () => {
    try {
      const response = await api.get('/admin/field-team');
      setFieldTeam(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchFieldTeam();
  }, []);

  const handleAssign = async (workerId) => {
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/assign`, { teamId: workerId });
      setIsAssignModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      alert('Error assigning complaint');
    }
  };

  const handleClose = async (id) => {
    if(!window.confirm("Are you sure you want to verify and close this complaint?")) return;
    try {
      await api.put(`/admin/complaints/${id}/close`, { adminNote: "Verified by Dept Admin" });
      setIsDetailsModalOpen(false);
      fetchComplaints();
    } catch (error) {
      alert('Error closing complaint');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter reason for rejection:");
    if(!reason) return;
    try {
      await api.put(`/admin/complaints/${id}/reject`, { reason });
      setIsDetailsModalOpen(false);
      fetchComplaints();
    } catch (error) {
      alert('Error rejecting complaint');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const searchStr = searchTerm.toLowerCase();
    const addressMatch = c.address ? c.address.toLowerCase().includes(searchStr) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchStr) : false;
    const matchesSearch = addressMatch || descMatch;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getWorkerName = (assignedTo) => {
    if (!assignedTo) return 'Not Assigned Yet';
    if (typeof assignedTo === 'object' && assignedTo.name) {
      return `${assignedTo.name} (${assignedTo.zone || 'Zone'})`;
    }
    if (typeof assignedTo === 'string') {
      const worker = fieldTeam.find(w => w._id === assignedTo);
      return worker ? `${worker.name} (${worker.zone})` : `ID: ${assignedTo}`;
    }
    return 'Not Assigned Yet';
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header with View Field Team Button */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">{user?.department || 'Department'} Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage and track civic issues</p>
        </div>
        <Link to="/dept-admin/field-team" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
          <Users size={16} /> View Field Team
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Active</p>
          <h3 className="text-2xl font-bold text-slate-800">{complaints.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-orange-500">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Needs Assignment</p>
          <h3 className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'verified').length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-500">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Work In Progress</p>
          <h3 className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Needs Approval</p>
          <h3 className="text-2xl font-bold text-slate-800">{complaints.filter(c => c.status === 'resolved').length}</h3>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-t-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search address or description..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            className="border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="verified">Needs Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Needs Approval</option>
            <option value="closed">Closed (History)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-semibold">Issue Details</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Priority</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={c.imageUrl || 'https://via.placeholder.com/100'} alt="issue" className="w-12 h-12 rounded-lg object-cover border border-slate-200" onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                    <div>
                      <p className="font-bold text-slate-800 capitalize">{c.aiAnalysis?.category?.replace('_', ' ') || 'Issue'}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-start gap-1 text-sm text-slate-600">
                    <MapPin size={16} className="mt-0.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status)} capitalize`}>
                    {c.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-lg font-bold ${c.priority >= 4 ? 'text-red-600' : 'text-slate-700'}`}>
                    {c.priority || 0}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => { setSelectedComplaint(c); setIsDetailsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                  {c.status === 'resolved' && (
                    <button onClick={() => handleClose(c._id)} className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors">
                      <CheckCircle size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {isDetailsModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                  {selectedComplaint.aiAnalysis?.category?.replace('_', ' ') || 'Issue'} Details
                </h2>
                <p className="text-sm text-slate-500">ID: {selectedComplaint._id}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2">Visual Proof</h3>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Citizen Reported Image</p>
                  <img src={selectedComplaint.imageUrl || 'https://via.placeholder.com/400'} alt="Reported" className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm" onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Field Before</p>
                    {selectedComplaint.beforeImage ? (
                      <img src={selectedComplaint.beforeImage} alt="Before" className="w-full h-24 object-cover rounded-lg border border-slate-200" onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center text-xs text-slate-500">No Image</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Field After</p>
                    {selectedComplaint.afterImage ? (
                      <img src={selectedComplaint.afterImage} alt="After" className="w-full h-24 object-cover rounded-lg border border-green-500 shadow-sm" onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center text-xs text-slate-500">No Image</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Citizen Details</h3>
                  <p className="text-sm"><span className="text-slate-500">Name:</span> {selectedComplaint.citizenName || 'N/A'}</p>
                  <p className="text-sm"><span className="text-slate-500">Phone:</span> {selectedComplaint.citizenPhone || 'N/A'}</p>
                  <p className="text-sm"><span className="text-slate-500">Address:</span> {selectedComplaint.address || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">AI Analysis & Work Note</h3>
                  <div className="flex gap-4 mb-2">
                    <div className="bg-blue-50 p-3 rounded-lg flex-1 text-center border border-blue-100">
                      <p className="text-xs text-blue-600">Severity</p>
                      <p className="font-bold text-blue-800 capitalize">{selectedComplaint.aiAnalysis?.severity || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg flex-1 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Priority</p>
                      <p className="font-bold text-slate-700">{selectedComplaint.priority || 0}/5</p>
                    </div>
                  </div>
                  {selectedComplaint.workNote && (
                    <div className="mt-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-semibold">Field Team Note:</p>
                      <p className="text-sm text-green-800">{selectedComplaint.workNote}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Assignment Details</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <p className="text-sm">
                      <span className="text-slate-500 font-medium">Department:</span>{' '}
                      <span className="font-bold text-slate-800 capitalize">{selectedComplaint.department || 'Unassigned'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-500 font-medium">Assigned Worker:</span>{' '}
                      <span className="font-bold text-slate-800">
                        {getWorkerName(selectedComplaint.assignedTo)}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Timeline</h3>
                  <div className="space-y-3">
                    {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 ? (
                      selectedComplaint.statusHistory.map((history, idx) => (
                        <div key={idx} className="relative flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 capitalize">{history.status?.replace('_', ' ') || 'Update'}</p>
                            <p className="text-xs text-slate-500">{history.timestamp ? new Date(history.timestamp).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No timeline history available.</p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              {selectedComplaint.status === 'verified' && (
                <>
                  <button onClick={() => handleReject(selectedComplaint._id)} className="bg-red-100 text-red-700 px-6 py-2 rounded-lg font-semibold hover:bg-red-200">Reject</button>
                  <button onClick={() => { setIsDetailsModalOpen(false); setIsAssignModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                    <UserPlus size={18} /> Assign
                  </button>
                </>
              )}
              {selectedComplaint.status === 'resolved' && (
                <button onClick={() => handleClose(selectedComplaint._id)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle size={18} /> Approve & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {isAssignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Field Team</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-3">
              {fieldTeam && fieldTeam.length > 0 ? (
                fieldTeam.map((worker) => (
                  <div key={worker._id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.zone}</p>
                    </div>
                    <button onClick={() => handleAssign(worker._id)} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg text-sm font-bold">
                      Assign
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">No field workers available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptAdminDashboard;