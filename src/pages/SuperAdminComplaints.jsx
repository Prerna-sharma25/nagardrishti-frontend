import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, MapPin, Eye, X, FileText, CheckCircle } from 'lucide-react';

const SuperAdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(response.data.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'duplicate': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading all complaints...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">City-Wide Complaints</h1>
        <p className="text-slate-500 mt-1">Monitor every issue reported across all departments</p>
      </div>

      {/* Search & Filter Bar */}
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
          <Filter className="text-slate-400" size={20} />
          <select 
            className="border border-slate-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
            <option value="duplicate">Duplicate</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Issue</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Severity</th>
              <th className="p-4 font-semibold">Department</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                <td className="p-4 text-sm font-mono text-slate-500">
                  {c._id.slice(-6).toUpperCase()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={c.imageUrl} alt="issue" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-800 capitalize text-sm">
                        {c.aiAnalysis?.category?.replace('_', ' ') || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{c.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-start gap-1 text-sm text-slate-600">
                    <MapPin size={14} className="mt-1 text-slate-400 shrink-0" />
                    <span className="line-clamp-2 text-xs max-w-[150px]">{c.address}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize
                    ${c.aiAnalysis?.severity === 'high' ? 'bg-red-100 text-red-700' : 
                      c.aiAnalysis?.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'}
                  `}>
                    {c.aiAnalysis?.severity || 'N/A'}
                  </span>
                </td>
                <td className="p-4 text-sm font-semibold text-slate-700 capitalize">
                  {c.department ? `${c.department} Team` : '-'}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status)} capitalize`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => { setSelectedComplaint(c); setIsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- COMPLAINT DETAILS MODAL --- */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                  {selectedComplaint.aiAnalysis?.category?.replace('_', ' ')} Issue
                </h2>
                <p className="text-sm text-slate-500 font-mono mt-1">ID: {selectedComplaint._id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side - Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2">Visual Proof</h3>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Citizen Reported Image</p>
                  <img src={selectedComplaint.imageUrl} alt="Reported" className="w-full h-56 object-cover rounded-xl border border-slate-200 shadow-sm" />
                </div>

                {selectedComplaint.afterImage && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Field Before</p>
                      <img src={selectedComplaint.beforeImage} alt="Before" className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Field After</p>
                      <img src={selectedComplaint.afterImage} alt="After" className="w-full h-24 object-cover rounded-lg border border-green-500 shadow-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Citizen Details</h3>
                  <p className="text-sm"><span className="text-slate-500">Name:</span> {selectedComplaint.citizenName}</p>
                  <p className="text-sm"><span className="text-slate-500">Phone:</span> {selectedComplaint.citizenPhone}</p>
                  <p className="text-sm"><span className="text-slate-500">Address:</span> {selectedComplaint.address}</p>
                </div>

                                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">AI Analysis</h3>
                  <div className="flex gap-4 mb-2">
                    <div className="bg-blue-50 p-3 rounded-lg flex-1 text-center border border-blue-100">
                      <p className="text-xs text-blue-600">Severity</p>
                      <p className="font-bold text-blue-800 capitalize">{selectedComplaint.aiAnalysis?.severity || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg flex-1 text-center border border-slate-200">
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="font-bold text-slate-700">{selectedComplaint.aiAnalysis?.confidence ? (selectedComplaint.aiAnalysis.confidence * 100).toFixed(0) + '%' : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* NEW: Assignment Details Section */}
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
                        {selectedComplaint.assignedTo ? (
                          <span className="text-blue-600">{selectedComplaint.assignedTo.name} ({selectedComplaint.assignedTo.zone})</span>
                        ) : (
                          <span className="text-orange-500">Not Assigned Yet</span>
                        )}
                      </span>
                    </p>
                  </div>
                  {selectedComplaint.workNote && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-semibold">Field Team Work Note:</p>
                      <p className="text-sm text-green-800">{selectedComplaint.workNote}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 border-b pb-2 mb-3">Timeline</h3>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                    {selectedComplaint.statusHistory?.map((history, idx) => (
                      <div key={idx} className="relative flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow shrink-0 z-10"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 capitalize">{history.status.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-500">{new Date(history.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
               <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition-colors">
                  Close
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminComplaints;