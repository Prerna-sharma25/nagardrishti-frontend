import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, Eye, X, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

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
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/complaints');
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldTeam = async () => {
    try {
      const response = await api.get('/admin/field-team');
      setFieldTeam(response.data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchFieldTeam();
  }, []);

  const handleAssign = async (workerId) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/assign`, { teamId: workerId });
      setIsAssignModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      alert('Error assigning complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (id) => {
    if(!window.confirm("Are you sure you want to verify and close this complaint?")) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/complaints/${id}/close`, { adminNote: "Verified by Dept Admin" });
      setIsDetailsModalOpen(false);
      fetchComplaints();
    } catch (error) {
      alert('Error closing complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter reason for rejection:");
    if(!reason) return;
    
    setActionLoading(true);
    try {
      await api.put(`/admin/complaints/${id}/reject`, { reason });
      setIsDetailsModalOpen(false);
      fetchComplaints();
    } catch (error) {
      alert('Error rejecting complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 capitalize">{user?.department} Department</h1>
        <p className="text-slate-500 mt-1">Manage and track civic issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
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
                    <img src={c.imageUrl} alt="issue" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-800 capitalize">{c.aiAnalysis.category.replace('_', ' ')}</p>
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
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-lg font-bold ${c.priority >= 4 ? 'text-red-600' : 'text-slate-700'}`}>
                    {c.priority}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { setSelectedComplaint(c); setIsDetailsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500">
                  <p className="text-lg">No complaints found matching your filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- DETAILS MODAL --- */}
      {isDetailsModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                  {selectedComplaint.aiAnalysis.category.replace('_', ' ')} Issue
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
                  <img src={selectedComplaint.imageUrl} alt="Reported" className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-sm" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Citizen Details</h3>
                  <p className="text-sm"><span className="text-slate-500">Name:</span> {selectedComplaint.citizenName}</p>
                  <p className="text-sm"><span className="text-slate-500">Phone:</span> {selectedComplaint.citizenPhone}</p>
                  <p className="text-sm"><span className="text-slate-500">Address:</span> {selectedComplaint.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">AI Analysis & Work Note</h3>
                  <div className="flex gap-4 mb-2">
                    <div className="bg-blue-50 p-3 rounded-lg flex-1 text-center border border-blue-100">
                      <p className="text-xs text-blue-600">Severity</p>
                      <p className="font-bold text-blue-800 capitalize">{selectedComplaint.aiAnalysis.severity}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg flex-1 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Priority</p>
                      <p className="font-bold text-slate-700">{selectedComplaint.priority}/5</p>
                    </div>
                  </div>
                  
                  {selectedComplaint.workNote && (
                    <div className="mt-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-semibold">Field Team Note:</p>
                      <p className="text-sm text-green-800">{selectedComplaint.workNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              {selectedComplaint.status === 'verified' && (
                <>
                  <button onClick={() => handleReject(selectedComplaint._id)} disabled={actionLoading} className="bg-red-100 text-red-700 px-6 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                    Reject
                  </button>
                  <button onClick={() => { setIsDetailsModalOpen(false); setIsAssignModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <UserPlus size={18} /> Assign to Team
                  </button>
                </>
              )}
              {selectedComplaint.status === 'resolved' && (
                <button onClick={() => handleClose(selectedComplaint._id)} disabled={actionLoading} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                  <CheckCircle size={18} /> Approve & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ASSIGN MODAL --- */}
      {isAssignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Field Team</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {fieldTeam.length === 0 ? (
                <div className="text-center p-4 bg-orange-50 text-orange-700 rounded-lg">
                  <AlertTriangle className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">No Field Workers found</p>
                </div>
              ) : (
                fieldTeam.map((worker) => (
                  <div key={worker._id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all">
                    <div>
                      <p className="font-bold text-slate-800">{worker.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> {worker.zone}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(worker._id)}
                      disabled={actionLoading}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      {actionLoading ? '...' : 'Assign'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptAdminDashboard;