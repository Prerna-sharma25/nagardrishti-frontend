import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeptAdminAllComplaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/admin/complaints');
        setComplaints(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading all complaints...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">{user?.department} - All Complaints</h1>
          <p className="text-slate-500 mt-1">Complete history of your department</p>
        </div>
        <Link to="/dept-admin" className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>

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

      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-semibold">Issue Details</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Priority</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeptAdminAllComplaints;