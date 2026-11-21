import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Download, Users, CheckCircle, Clock, AlertTriangle, 
  Calendar, ChevronDown, FileText 
} from 'lucide-react';
import * as XLSX from 'xlsx'; 

const SuperAdminReports = () => {
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [deptFilter, setDeptFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Report Data State
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/complaints');
        const data = response.data.data || [];
        setAllComplaints(data);
        // Default report generate 
        generateReport(data, 'all', 'all', 'all');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Report Generate function
  const generateReport = (data = allComplaints, dept = deptFilter, cat = categoryFilter, status = statusFilter) => {
    let filtered = [...data];

    // 1. Filter by Department
    if (dept !== 'all') {
      filtered = filtered.filter(c => c.department === dept);
    }

    // 2. Filter by Category
    if (cat !== 'all') {
      filtered = filtered.filter(c => c.aiAnalysis?.category === cat);
    }

    // 3. Filter by Status
    if (status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(c => ['pending', 'verified'].includes(c.status));
      } else {
        filtered = filtered.filter(c => c.status === status);
      }
    }

    // Calculate KPIs
    const total = filtered.length;
    const resolved = filtered.filter(c => ['resolved', 'closed'].includes(c.status)).length;
    const pending = filtered.filter(c => ['pending', 'verified', 'assigned', 'in_progress'].includes(c.status)).length;
    const highPriority = filtered.filter(c => c.aiAnalysis?.severity === 'high').length;

    setReportData({
      complaints: filtered,
      total,
      resolved,
      pending,
      highPriority
    });
  };

  const handleGenerateClick = () => {
    generateReport();
  };

  // Excel Export Function
  const handleExport = () => {
    if (!reportData || reportData.complaints.length === 0) {
      alert("No data to export for this report.");
      return;
    }

    const exportData = reportData.complaints.map(c => ({
      "Complaint ID": c._id.slice(-6).toUpperCase(),
      "Category": c.aiAnalysis?.category?.replace('_', ' ') || 'Unknown',
      "Department": c.department || 'Unassigned',
      "Status": c.status?.replace('_', ' ') || 'Unknown',
      "Severity": c.aiAnalysis?.severity || 'N/A',
      "Address": c.address || 'N/A',
      "Date": new Date(c.reportedAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    
    // Auto column width
    worksheet["!cols"] = [ { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 15 } ];
    
    XLSX.writeFile(workbook, `NagarDrishti_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading reports...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Reports</h1>
        <p className="text-sm text-stone-500 mt-1">Generate and download city complaint reports</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        
        {/* Date Filter */}
        <div className="relative">
          <select className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Calendar size={16} />
          </div>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="roads">Roads</option>
            <option value="sanitation">Sanitation</option>
            <option value="water">Water</option>
            <option value="other">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="other">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending / Active</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="duplicate">Duplicate</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerateClick}
          className="w-full lg:col-span-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Report Summary Section */}
      {reportData && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-stone-800">Report Summary</h2>
              <p className="text-xs text-stone-500 mt-1">
                Based on selected filters • {reportData.total} complaints found
              </p>
            </div>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-lg border border-stone-200 transition-colors"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Complaints */}
            <div className="group bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <p className="text-xs font-bold text-blue-800/70 uppercase tracking-wider">Total Complaints</p>
              </div>
              <span className="text-3xl font-extrabold text-blue-700">{reportData.total}</span>
            </div>

            {/* Resolved */}
            <div className="group bg-green-50 border border-green-100 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle size={20} />
                </div>
                <p className="text-xs font-bold text-green-800/70 uppercase tracking-wider">Resolved</p>
              </div>
              <span className="text-3xl font-extrabold text-green-700">{reportData.resolved}</span>
            </div>

            {/* Pending */}
            <div className="group bg-amber-50 border border-amber-100 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock size={20} />
                </div>
                <p className="text-xs font-bold text-amber-800/70 uppercase tracking-wider">Pending</p>
              </div>
              <span className="text-3xl font-extrabold text-amber-700">{reportData.pending}</span>
            </div>

            {/* High Priority */}
            <div className="group bg-red-50 border border-red-100 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm group-hover:scale-110 transition-transform">
                  <AlertTriangle size={20} />
                </div>
                <p className="text-xs font-bold text-red-800/70 uppercase tracking-wider">High Priority</p>
              </div>
              <span className="text-3xl font-extrabold text-red-700">{reportData.highPriority}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminReports;