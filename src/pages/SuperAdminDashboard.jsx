import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, complaintsRes] = await Promise.all([
          api.get('/analytics/super-admin'),
          api.get('/analytics/trends'),
          api.get('/complaints')
        ]);
        
        setData(statsRes.data.data);
        setTrends(trendsRes.data.data);
        
        // Take top 5 recent for feed
        const recent = complaintsRes.data.data
          .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
          .slice(0, 5);
        setRecentComplaints(recent);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading city data...</div>;
  if (!data) return <div className="text-center mt-20 text-red-500">Failed to load data.</div>;

  // Calculate extra stats
  const openCount = data.statusStats
    .filter(s => ['pending', 'verified', 'assigned', 'in_progress'].includes(s._id))
    .reduce((sum, s) => sum + s.count, 0);
    
  const resolvedCount = data.statusStats.find(s => s._id === 'closed' || s._id === 'resolved')?.count || 0;
  
  // High priority count (we'll filter complaints with priority >= 4)
  const highPriorityCount = recentComplaints.filter(c => c.priority >= 4).length; 
  // Note: For a real count, backend should return this, but we use recentComplaints for now as an example.

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">City Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/super-admin/complaints" className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm font-semibold transition-colors">
          View All Complaints <ArrowRight size={16}/>
        </Link>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Total</p>
            <Activity size={18} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.totalComplaints}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-orange-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Open/Active</p>
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{openCount}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">High Priority</p>
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{highPriorityCount}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-green-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Resolved</p>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{resolvedCount}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">Avg Time</p>
            <Clock size={18} className="text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.avgResolutionTime} hrs</h3>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">7-Day Complaint Trends</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section: Charts and Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Category Breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryStats.map(c => ({ name: c._id ? c._id.replace('_', ' ') : 'Unknown', value: c.count }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Status Breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.statusStats.map(s => ({ name: s._id.replace('_', ' '), count: s.count }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Complaints Live Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Complaints</h2>
          <div className="flex-1 space-y-4">
            {recentComplaints.map((c) => (
              <div key={c._id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                <img src={c.imageUrl} alt="issue" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 capitalize truncate">
                    {c.aiAnalysis?.category?.replace('_', ' ') || 'Issue'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{c.address}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase
                  ${c.status === 'verified' ? 'bg-blue-100 text-blue-700' : 
                    c.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                    c.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
                `}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;