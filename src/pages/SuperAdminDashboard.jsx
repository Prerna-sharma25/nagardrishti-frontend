import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#0f766e', '#f59e0b', '#ef4444', '#64748b', '#14b8a6'];

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [allComplaints, setAllComplaints] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complaintsRes = await api.get('/complaints');
        setAllComplaints(complaintsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // on loading data get fetched

    // fetch the data again every 15 seconds (15,000 ms).
    const interval = setInterval(() => {
      fetchData();
    }, 15000); 

    // Cleanup: If the user leaves the page, the timer should stop
    return () => clearInterval(interval);
  }, []);

  const getDropdownLabel = (val) => {
    const labels = {
      today: 'Today',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      month: 'This Month',
      year: 'This Year'
    };
    return labels[val] || 'Select Range';
  };

  // 1. DATE LOGIC 
  const { currentComplaints, previousComplaints } = useMemo(() => {
    if (!allComplaints.length) return { currentComplaints: [], previousComplaints: [] };
    
    const now = new Date();
    let currentStart = new Date();
    let currentEnd = new Date(now);
    let prevStart = new Date();
    let prevEnd = new Date();

    // Set Current Range
    if (timeRange === 'today') {
      currentStart.setHours(0, 0, 0, 0);
    } else if (timeRange === '7d') {
      currentStart.setDate(now.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);
    } else if (timeRange === '30d') {
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);
    } else if (timeRange === 'month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === 'year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
    }

    // Set Previous Range 
    if (timeRange === 'today') {
      prevStart.setDate(now.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (timeRange === '7d') {
      prevStart.setDate(now.getDate() - 14);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 7);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (timeRange === '30d') {
      prevStart.setDate(now.getDate() - 60);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 30);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (timeRange === 'year') {
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    }

    const current = allComplaints.filter(c => {
      const d = new Date(c.reportedAt);
      return d >= currentStart && d <= currentEnd;
    });

    const previous = allComplaints.filter(c => {
      const d = new Date(c.reportedAt);
      return d >= prevStart && d <= prevEnd;
    });

    return { currentComplaints: current, previousComplaints: previous };
  }, [allComplaints, timeRange]);


  // 2. CALCULATE STATS & TRENDS
  const totalCount = currentComplaints.length;
  const openCount = currentComplaints.filter(c => ['pending', 'verified', 'assigned', 'in_progress'].includes(c.status)).length;
  const resolvedCount = currentComplaints.filter(c => ['closed', 'resolved'].includes(c.status)).length;

  // Helper to calculate trend percentage
  const calcTrend = (current, previous) => {
    if (previous === 0 && current === 0) return { label: '0%', isUp: true };
    if (previous === 0 && current > 0) return { label: 'New', isUp: true };
    const diff = current - previous;
    const percent = Math.round((diff / previous) * 100);
    return {
      label: `${Math.abs(percent)}%`,
      isUp: percent >= 0
    };
  };

  // Trends
  const prevTotal = previousComplaints.length;
  const prevOpen = previousComplaints.filter(c => ['pending', 'verified', 'assigned', 'in_progress'].includes(c.status)).length;
  const prevResolved = previousComplaints.filter(c => ['closed', 'resolved'].includes(c.status)).length;

  const totalTrend = calcTrend(totalCount, prevTotal);
  const openTrend = calcTrend(openCount, prevOpen);
  const resolvedTrend = calcTrend(resolvedCount, prevResolved);

  // Avg Time Calculation 
  const calcAvgTime = (complaints) => {
    const resolved = complaints.filter(c => ['closed', 'resolved'].includes(c.status));
    if (!resolved.length) return 0;
    
    let totalHours = 0;
    let validCount = 0;

    resolved.forEach(c => {
      const start = new Date(c.reportedAt);
      let end = c.resolvedAt ? new Date(c.resolvedAt) : null;
      
      if (!end && c.statusHistory) {
        const resEvent = c.statusHistory.find(h => ['resolved', 'closed'].includes(h.status));
        if (resEvent) end = new Date(resEvent.timestamp);
      }
      
      if (!end) end = new Date(c.updatedAt);

      const diff = (end - start) / (1000 * 60 * 60); 
      
      if (diff > 0) {
        totalHours += diff;
        validCount++;
      }
    });
    
    return validCount > 0 ? (totalHours / validCount).toFixed(1) : 0;
  };

  const avgTime = calcAvgTime(currentComplaints);
  const prevAvgTime = calcAvgTime(previousComplaints);
  
  // Avg Time Trend 
  let avgTimeTrendLabel = "0%";
  let avgTimeIsUp = false; 
  if (prevAvgTime > 0 && avgTime > 0) {
    const diff = avgTime - prevAvgTime;
    const percent = Math.round((Math.abs(diff) / prevAvgTime) * 100);
    avgTimeTrendLabel = `${percent}%`;
    avgTimeIsUp = diff > 0; 
  }

  // 3. PREPARE CHART DATA
  const categoryCounts = currentComplaints.reduce((acc, curr) => {
    const cat = curr.aiAnalysis?.category?.replace('_', ' ') || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map((key, i) => {
    const value = categoryCounts[key];
    // Percentage calculation
    const percentage = totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
    
    return {
      name: key,
      value: value,
      percentage: percentage, 
      fill: COLORS[i % COLORS.length]
    };
  }).sort((a, b) => b.value - a.value); 

  const trendData = useMemo(() => {
    const days = [];
    let totalDays = 7;

    if (timeRange === 'today') totalDays = 1;
    else if (timeRange === '30d') totalDays = 30;
    else if (timeRange === 'month') totalDays = new Date().getDate();
    else if (timeRange === 'year') totalDays = 12; 

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      if (timeRange === 'year') {
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toLocaleString('default', { month: 'short' });
        const count = currentComplaints.filter(c => {
          const cDate = new Date(c.reportedAt);
          return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
        }).length;
        days.push({ date: monthStr, complaints: count });
      } else {
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = currentComplaints.filter(c => c.reportedAt.startsWith(dateStr)).length;
        days.push({ 
          date: timeRange === 'today' ? 'Today' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 
          complaints: count 
        });
      }
    }
    return days;
  }, [currentComplaints, timeRange]);

  if (loading) return <div className="text-center mt-20 text-stone-500">Loading city data...</div>;

  return (
    <div className="pb-0">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">City Overview</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Custom Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between min-w-[140px] bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-lg px-4 py-2 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            >
              {getDropdownLabel(timeRange)}
              <svg className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {[
                  { label: 'Today', value: 'today' },
                  { label: 'Last 7 Days', value: '7d' },
                  { label: 'Last 30 Days', value: '30d' },
                  { label: 'This Month', value: 'month' },
                  { label: 'This Year', value: 'year' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-100 ${
                      timeRange === option.value ? 'bg-teal-50 text-teal-700' : 'text-stone-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/super-admin/complaints" className="bg-white text-teal-700 px-4 py-2 rounded-lg border border-stone-200 shadow-sm hover:bg-stone-50 flex items-center gap-2 text-sm font-semibold transition-colors">
            View All Complaints <ArrowRight size={16}/>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Row  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.8fr_0.8fr_0.8fr_1fr] gap-5 mb-4">
        
        {/* Total Complaints */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600 opacity-100 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-teal-50/80 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${totalTrend.isUp ? 'text-teal-700 bg-teal-50 border-teal-100' : 'text-red-700 bg-red-50 border-red-100'}`}>
              {totalTrend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
              {totalTrend.label}
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-stone-500 font-medium">Total Complaints</p>
            <h3 className="text-3xl font-extrabold text-stone-800 tracking-tight leading-none">{totalCount}</h3>
          </div>
        </div>

        {/* Open / Active */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-100 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-50/80 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${openTrend.isUp ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-green-700 bg-green-50 border-green-100'}`}>
              {openTrend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
              {openTrend.label}
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-stone-500 font-medium">Open / Active</p>
            <h3 className="text-3xl font-extrabold text-stone-800 tracking-tight leading-none">{openCount}</h3>
          </div>
        </div>

        {/* Resolved */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 opacity-100 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-green-50/80 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${resolvedTrend.isUp ? 'text-green-700 bg-green-50 border-green-100' : 'text-red-700 bg-red-50 border-red-100'}`}>
              {resolvedTrend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
              {resolvedTrend.label}
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-stone-500 font-medium">Resolved</p>
            <h3 className="text-3xl font-extrabold text-stone-800 tracking-tight leading-none">{resolvedCount}</h3>
          </div>
        </div>

        {/* Avg Time */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 opacity-100 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-purple-50/80 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
              avgTimeTrendLabel === '-' 
                ? 'text-stone-500 bg-stone-50 border-stone-200' 
                : avgTimeIsUp 
                  ? 'text-red-700 bg-red-50 border-red-100' 
                  : 'text-green-700 bg-green-50 border-green-100'
            }`}>
              {avgTimeTrendLabel !== '-' && (avgTimeIsUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />)} 
              {avgTimeTrendLabel}
            </span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-stone-500 font-medium leading-tight max-w-[60%]">Avg. Resolution Time</p>
            <h3 className="text-3xl font-extrabold text-stone-800 tracking-tight leading-none whitespace-nowrap">
              {avgTime} <span className="text-sm text-stone-400 font-medium ml-0.5">hrs</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4 items-stretch">
        
        {/* Trends Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-stone-800 mb-6">
            {getDropdownLabel(timeRange)} Complaint Trends
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{fill: '#78716c', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: '#78716c', fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="complaints" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown*/}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-stone-800 mb-6">Category Breakdown</h2>
          
          <div className="flex flex-col 2xl:flex-row items-center gap-2 flex-1">
            {/* Left Side: Chart */}
            <div className="w-full 2xl:w-1/2 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value"
                    stroke="none"
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-stone-800">{totalCount}</span>
                <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mt-0.5">Complaints</span>
              </div>
            </div>

            {/* Right Side: Legend List */}
            <div className="w-full 2xl:w-1/2 bg-stone-50/50 rounded-xl p-4 flex flex-col justify-center gap-1">
              {pieData.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.fill }}></span>
                    <span className="capitalize text-stone-700 font-medium">{c.name}</span>
                  </div>
                  <span className="font-bold text-stone-800">{c.percentage}%</span>
                </div>
              ))}
              {pieData.length === 0 && (
                <p className="text-sm text-stone-400 text-center">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Recent Complaints */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:col-span-1 h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-stone-800">Recent Complaints</h2>
            <Link to="/super-admin/complaints" className="text-xs text-teal-600 font-semibold hover:underline">View All</Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {allComplaints.map((c) => (
              <div key={c._id} className="flex items-center gap-3 p-2 hover:bg-stone-50 transition-colors rounded-lg cursor-pointer border-b border-stone-100 last:border-0">
                <img src={c.imageUrl || 'https://via.placeholder.com/150'} alt="issue" className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-800 capitalize truncate">
                    {c.aiAnalysis?.category?.replace('_', ' ') || 'Issue'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{c.address}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap
                  ${c.status === 'verified' ? 'bg-blue-50 text-blue-700' : 
                    c.status === 'resolved' || c.status === 'closed' ? 'bg-green-50 text-green-700' : 
                    c.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-700'}
                `}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:col-span-2 h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              {/* Top Blinking Dot - Red Color */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live System Activity
            </h2>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md">Auto-updating</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {allComplaints.slice(0, 15).map((c, idx, arr) => (
              <div key={idx} className="flex gap-4 relative group">
                
                {/* Timeline Dots */}
                <div className="flex flex-col items-center flex-shrink-0 relative">
                  <div className="w-3 h-3 rounded-full mt-1.5 border-2 border-white shadow-sm z-10 bg-stone-400"></div>
                  {idx !== arr.length - 1 && (
                    <div className="w-0.5 bg-stone-200 absolute top-5 bottom-[-24px] left-[5px]"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="pb-8 flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-stone-800 leading-tight mb-1.5">
                        {c.status === 'resolved' ? `Complaint #${c._id.slice(-4)} resolved successfully.` : 
                         c.status === 'closed' ? `Complaint #${c._id.slice(-4)} closed by Admin.` : 
                         c.status === 'in_progress' ? `Field team started working on ${c.aiAnalysis?.category || 'issue'}.` : 
                         c.status === 'rejected' ? `AI rejected a duplicate report.` :
                         c.status === 'verified' ? `New complaint verified by AI & routed to ${c.department || 'dept'}.` : 
                         `New ${c.aiAnalysis?.category || 'issue'} reported by citizen.`}
                      </p>
                      <p className="text-xs text-stone-500 capitalize flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-medium">
                          {c.aiAnalysis?.category?.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span className="text-stone-600 break-words">{c.address}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-stone-500 font-semibold whitespace-nowrap bg-stone-50 px-2 py-1.5 rounded-md border border-stone-200 flex items-center gap-1.5">
                      <span className="text-stone-400">
                        {new Date(c.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="w-px h-3 bg-stone-300"></span>
                      <span>
                        {new Date(c.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminDashboard;