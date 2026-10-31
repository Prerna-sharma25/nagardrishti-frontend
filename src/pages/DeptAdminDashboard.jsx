import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Clock, CheckCircle, AlertCircle, UserPlus, X } from 'lucide-react';

const DeptAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the assignment modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [fieldTeam, setFieldTeam] = useState([]);
  const [assigning, setAssigning] = useState(false);

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

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Open Modal and fetch Field Team
  const handleOpenAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const response = await api.get('/admin/field-team');
      setFieldTeam(response.data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  // Assign worker
  const handleAssign = async (workerId) => {
    setAssigning(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/assign`, { teamId: workerId });
      setSelectedComplaint(null); // close modal
      fetchComplaints(); // refresh list
    } catch (error) {
      console.error('Error assigning:', error);
    } finally {
      setAssigning(false);
    }
  };

  // Close complaint
  const handleClose = async (id) => {
    try {
      await api.put(`/admin/complaints/${id}/close`, { adminNote: "Verified and closed by admin." });
      fetchComplaints(); // refresh list
    } catch (error) {
      console.error('Error closing complaint:', error);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading department data...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 capitalize">{user?.department} Department</h1>
          <p className="text-gray-500 mt-1">Manage active complaints</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
          Total Active: {complaints.length}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Issue</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Priority</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={c.imageUrl} alt="issue" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">{c.aiAnalysis.category.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{c.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{c.address}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${c.status === 'verified' ? 'bg-blue-100 text-blue-700' : ''}
                    ${c.status === 'assigned' ? 'bg-orange-100 text-orange-700' : ''}
                    ${c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-bold ${c.priority >= 4 ? 'text-red-600' : 'text-gray-600'}`}>
                    {c.priority}/5
                  </span>
                </td>
                <td className="p-4 text-right">
                  {c.status === 'verified' && (
                    <button 
                      onClick={() => handleOpenAssignModal(c)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ml-auto"
                    >
                      <UserPlus size={16} /> Assign
                    </button>
                  )}
                  {c.status === 'resolved' && (
                    <button 
                      onClick={() => handleClose(c._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ml-auto"
                    >
                      <CheckCircle size={16} /> Approve & Close
                    </button>
                  )}
                  {(c.status === 'assigned' || c.status === 'in_progress') && (
                    <span className="text-sm text-gray-400 flex items-center justify-end gap-1">
                      <Clock size={14} /> Waiting
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No active complaints right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Assign Field Team</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a worker for: <span className="font-semibold capitalize">{selectedComplaint.aiAnalysis.category.replace('_', ' ')}</span>
              </p>
              <div className="space-y-3">
                {fieldTeam.map((worker) => (
                  <div key={worker._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">{worker.name}</p>
                      <p className="text-xs text-gray-500">{worker.zone}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(worker._id)}
                      disabled={assigning}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
                {fieldTeam.length === 0 && (
                  <p className="text-center text-red-500 text-sm">No field workers found for your department.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptAdminDashboard;