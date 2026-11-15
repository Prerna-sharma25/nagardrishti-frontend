import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Map, BarChart2, CheckCircle, AlertTriangle, Clock, 
  ChevronDown, Sparkles, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';

const SuperAdminAnalytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(response.data.data || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading analytics...</div>;

  // --- DATA PROCESSING LOGIC ---

  // 1. Department Performance (Assigned vs Resolved)
  const deptMap = {};
  complaints.forEach(c => {
    const dept = c.department || 'Other';
    if (!deptMap[dept]) deptMap[dept] = { name: dept, Assigned: 0, Resolved: 0 };
    
    if (['assigned', 'in_progress'].includes(c.status)) deptMap[dept].Assigned += 1;
    if (['resolved', 'closed'].includes(c.status)) deptMap[dept].Resolved += 1;
  });
  const deptData = Object.values(deptMap).sort((a, b) => b.Assigned - a.Assigned);

  // 2. AI Verification Summary
  const aiVerified = complaints.filter(c => c.status === 'verified').length;
  const aiRejected = complaints.filter(c => c.status === 'rejected').length;
  const needsReview = complaints.filter(c => c.status === 'pending' || c.status === 'duplicate').length;

  // 3. Other Category Queue
  const otherComplaints = complaints.filter(c => c.aiAnalysis?.category === 'other' && c.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Analytics & AI Insights</h1>
          <p className="text-sm text-stone-500 mt-1">City performance, complaint hotspots and AI insights</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select className="w-full sm:w-auto appearance-none bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* City Heatmap */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Map size={18} className="text-teal-600" />
            <h2 className="text-lg font-bold text-stone-800">City Heatmap</h2>
          </div>
          <p className="text-xs text-stone-500 mb-4">Complaint density across the city</p>
          
          <div className="flex-1 relative bg-stone-100 rounded-xl overflow-hidden min-h-[250px] border border-stone-200">
            {/* Fake Map Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#78716c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Heatmap Spots */}
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-red-500/40 rounded-full blur-2xl"></div>
            <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-red-600/60 rounded-full blur-xl"></div>
            
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-amber-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-amber-600/50 rounded-full blur-xl"></div>
            
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-teal-500/30 rounded-full blur-2xl"></div>

            {/* Labels */}
            <span className="absolute top-[20%] left-[30%] text-xs font-bold text-stone-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">Rohini</span>
            <span className="absolute bottom-[20%] right-[40%] text-xs font-bold text-stone-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">Saket</span>
            <span className="absolute top-[60%] left-[10%] text-xs font-bold text-stone-700 bg-white/80 px-2 py-0.5 rounded shadow-sm">Paschim Vihar</span>
            
            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-sm text-[10px] space-y-1 z-10">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Density</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Low</div>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-teal-600" />
            <h2 className="text-lg font-bold text-stone-800">Department Performance</h2>
          </div>
          <p className="text-xs text-stone-500 mb-6">Assigned vs Resolved Complaints</p>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{fill: '#78716c', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#78716c', fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Assigned" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Resolved" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Other Category Queue */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-stone-800">Other Category Queue</h2>
          </div>
          <p className="text-xs text-stone-500 mb-6">Uncategorized complaints pending review</p>
          
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl p-6 text-center bg-stone-50/50">
             <span className="text-4xl font-extrabold text-amber-500 mb-2">{otherComplaints.length}</span>
             <p className="text-sm font-medium text-stone-600 mb-4">Pending Complaints</p>
             <button className="bg-[#0f766e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#115e59] transition-colors shadow-sm w-full">
               Review Queue
             </button>
          </div>
        </div>

        {/* AI Verification Summary */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-teal-600" />
            <h2 className="text-lg font-bold text-stone-800">AI Verification Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* AI Verified */}
            <div className="group bg-green-50 border border-green-100 rounded-xl p-5 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-white rounded-full text-green-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <span className="text-2xl font-extrabold text-green-700">{aiVerified}</span>
              <p className="text-xs font-bold text-green-800/70 uppercase tracking-wider mt-1">AI Verified</p>
            </div>

            {/* AI Rejected */}
            <div className="group bg-red-50 border border-red-100 rounded-xl p-5 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-white rounded-full text-red-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <span className="text-2xl font-extrabold text-red-700">{aiRejected}</span>
              <p className="text-xs font-bold text-red-800/70 uppercase tracking-wider mt-1">Rejected</p>
            </div>

            {/* Needs Review */}
            <div className="group bg-amber-50 border border-amber-100 rounded-xl p-5 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-white rounded-full text-amber-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <span className="text-2xl font-extrabold text-amber-700">{needsReview}</span>
              <p className="text-xs font-bold text-amber-800/70 uppercase tracking-wider mt-1">Needs Review</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminAnalytics;