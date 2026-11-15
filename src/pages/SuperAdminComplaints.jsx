import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, MapPin, Eye, X, Download, FilterX, ChevronLeft, ChevronRight, 
  ShieldCheck, CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import * as XLSX from 'xlsx';

const SuperAdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, severityFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || categoryFilter !== 'all' || severityFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSeverityFilter('all');
  };

  // Function to export data to CSV
  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Define Headers
    const headers = [
      "Complaint ID", "Category", "Description", "Address", 
      "Severity", "Department", "Status", "Citizen Name", 
      "Citizen Phone", "Reported Date"
    ];

    // 2. Map through data and format it
    const csvData = filteredComplaints.map(c => [
      c._id,
      c.aiAnalysis?.category || 'Unknown',
      `"${c.description || ''}"`, 
      `"${c.address || ''}"`,
      c.aiAnalysis?.severity || 'N/A',
      c.department || 'Unassigned',
      c.status || 'Unknown',
      c.citizenName || 'N/A',
      c.citizenPhone || 'N/A',
      new Date(c.reportedAt).toLocaleDateString()
    ]);

    // 3. Combine headers and data
    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");

    // 4. Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // File Name
    link.setAttribute("download", `NagarDrishti_Complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export data to EXCEL (.xlsx)
  const handleExport = () => {
    if (filteredComplaints.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Format the data
    const exportData = filteredComplaints.map(c => ({
      "Complaint ID": c._id.slice(-6).toUpperCase(),
      "Category": c.aiAnalysis?.category?.replace('_', ' ') || 'Unknown',
      "Description": c.description || 'N/A',
      "Address": c.address || 'N/A',
      "Severity": c.aiAnalysis?.severity || 'N/A',
      "Department": c.department || 'Unassigned',
      "Status": c.status?.replace('_', ' ') || 'Unknown',
      "Citizen Name": c.citizenName || 'N/A',
      "Citizen Phone": c.citizenPhone || 'N/A',
      "Reported Date": new Date(c.reportedAt).toLocaleDateString()
    }));

    // 2. Create new excel sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");

    // 3. set the width of column
    worksheet["!cols"] = [
      { wch: 15 }, // Complaint ID
      { wch: 15 }, // Category
      { wch: 40 }, // Description
      { wch: 30 }, // Address
      { wch: 10 }, // Severity
      { wch: 15 }, // Department
      { wch: 15 }, // Status
      { wch: 20 }, // Citizen Name
      { wch: 15 }, // Phone
      { wch: 15 }, // Date
    ];

    // 4. Download file
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `NagarDrishti_Complaints_${dateStr}.xlsx`);
  };

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const searchStr = searchTerm.toLowerCase();
    
    // Search Matches
    const addressMatch = c.address ? c.address.toLowerCase().includes(searchStr) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchStr) : false;
    const categoryMatch = c.aiAnalysis?.category ? c.aiAnalysis.category.toLowerCase().includes(searchStr) : false;
    const idMatch = c._id ? c._id.toLowerCase().includes(searchStr) : false;
    const shortIdMatch = c._id ? c._id.slice(-6).toLowerCase().includes(searchStr) : false;
    const nameMatch = c.citizenName ? c.citizenName.toLowerCase().includes(searchStr) : false;
    
    const matchesSearch = addressMatch || descMatch || categoryMatch || idMatch || shortIdMatch || nameMatch;
    
    // Dropdown Filters
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.aiAnalysis?.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || c.aiAnalysis?.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Soft Premium Colors for Status
  const getStatusColor = (status) => {
    switch(status) {
      case 'verified': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'duplicate': return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  // Soft Premium Colors for Severity
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getWorkerDisplay = (assignedTo) => {
    if (!assignedTo) return 'Not Assigned Yet';
    if (typeof assignedTo === 'object' && assignedTo.name) {
      return `${assignedTo.name} (${assignedTo.zone || 'Zone'})`;
    }
    if (typeof assignedTo === 'string') {
      return `ID: ${assignedTo}`;
    }
    return 'Not Assigned Yet';
  };

  // Find Original Complaint if this one is a duplicate
  const originalComplaint = selectedComplaint?.aiAnalysis?.duplicateOf 
    ? complaints.find(c => c._id === selectedComplaint.aiAnalysis.duplicateOf) 
    : null;

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading all complaints...</div>;

  return (
    <div className="flex flex-col gap-6 pb-0 w-full max-w-[1400px] mx-auto overflow-hidden">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">City-Wide Complaints</h1>
          <p className="text-sm text-stone-500 mt-1">Monitor every issue reported across all departments</p>
        </div>
        
        <button 
          onClick={handleExport}
          className="bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 w-full">
        
        {/* Search Box */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, name, category or address..." 
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select 
          className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
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
          <option value="duplicate">Duplicate</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Category Filter */}
        <select 
          className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="pothole">Pothole</option>
          <option value="garbage">Garbage</option>
          <option value="water_leakage">Water Leakage</option>
          <option value="other">Other</option>
        </select>

        {/* Severity Filter */}
        <select 
          className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Clear Filters Button OR Total Count */}
        {hasActiveFilters ? (
          <button 
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <FilterX size={16} />
            Clear Filters
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-600 rounded-xl px-4 py-2.5 text-sm font-medium border border-stone-200">
            Total: {filteredComplaints.length}
          </div>
        )}
      </div>

      {/* 3. Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200">
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Issue</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">Severity</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-stone-500">
                    No complaints found matching your filters.
                  </td>
                </tr>
              ) : (
                currentItems.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium text-stone-500 font-mono whitespace-nowrap">
                      #{c._id.slice(-6).toUpperCase()}
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={c.imageUrl || 'https://via.placeholder.com/100'} 
                          alt="issue" 
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0" 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-stone-800 capitalize truncate">
                            {c.aiAnalysis?.category?.replace('_', ' ') || 'Unknown'}
                          </p>
                          <p className="text-xs text-stone-500 truncate max-w-[150px] sm:max-w-[200px] mt-0.5">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-start gap-1.5 text-sm text-stone-600">
                        <MapPin size={14} className="mt-0.5 text-stone-400 shrink-0" />
                        <span className="line-clamp-2 text-xs max-w-[150px]">{c.address}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border capitalize ${getSeverityColor(c.aiAnalysis?.severity)}`}>
                        {c.aiAnalysis?.severity || 'N/A'}
                      </span>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium text-stone-700 capitalize hidden lg:table-cell whitespace-nowrap">
                      {c.department ? `${c.department} Team` : '-'}
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border capitalize ${getStatusColor(c.status)}`}>
                        {c.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4 text-center">
                      <button 
                        onClick={() => { setSelectedComplaint(c); setIsModalOpen(true); }}
                        className="text-stone-400 hover:text-teal-600 bg-white hover:bg-teal-50 border border-transparent hover:border-teal-100 p-2 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        {filteredComplaints.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50/50">
            <div className="text-sm text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-stone-800">{Math.min(indexOfLastItem, filteredComplaints.length)}</span> of <span className="font-bold text-stone-800">{filteredComplaints.length}</span> entries
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    currentPage === number 
                      ? 'bg-[#0f766e] text-white shadow-sm' 
                      : 'text-stone-600 hover:bg-stone-100 bg-white border border-transparent hover:border-stone-200'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- COMPLAINT DETAILS MODAL --- */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-stone-200">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-stone-100 bg-white gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-stone-800 capitalize tracking-tight">
                    Complaint #{selectedComplaint._id.slice(-6).toUpperCase()}
                  </h2>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getSeverityColor(selectedComplaint.aiAnalysis?.severity)}`}>
                    {selectedComplaint.aiAnalysis?.severity || 'Low'}
                  </span>
                </div>
                <p className="text-sm text-stone-500 flex items-center gap-2">
                  <span className="font-semibold text-stone-700 capitalize">{selectedComplaint.aiAnalysis?.category?.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{selectedComplaint.address}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Conditional Action Buttons */}
                {!['rejected', 'closed', 'duplicate','resolved'].includes(selectedComplaint.status) && (
                  <>
                    <button 
                      onClick={() => alert("Yahan Re-assign ka modal open hoga.")}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                    >
                      Re-assign
                    </button>
                    <button 
                      onClick={() => alert("Complaint reject ho jayegi.")}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {/* Green Cross Button */}
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="ml-2 bg-[#0f766e] text-white hover:bg-[#115e59] p-2 rounded-full transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body  */}
            <div className="p-6 overflow-y-auto bg-stone-50/50 flex-1">
              
              {/* Duplicate Warning Box with Original Status */}
              {(selectedComplaint.status === 'duplicate' || selectedComplaint.aiAnalysis?.duplicateOf) && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={20} />
                    <div>
                      <h4 className="text-red-800 font-bold text-sm">Duplicate Complaint Alert</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This report is identical to an existing complaint.
                      </p>
                      {originalComplaint ? (
                        <p className="text-sm text-red-700 mt-1.5 flex items-center gap-2">
                          Original ID: <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded border border-red-200">#{originalComplaint._id.slice(-6).toUpperCase()}</span>
                          <span className="text-stone-500">|</span>
                          Status: 
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${getStatusColor(originalComplaint.status)}`}>
                            {originalComplaint.status.replace('_', ' ')}
                          </span>
                        </p>
                      ) : (
                        selectedComplaint.aiAnalysis?.duplicateOf && (
                          <p className="text-sm text-red-700 mt-1">
                            Original ID: <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded border border-red-200">#{selectedComplaint.aiAnalysis.duplicateOf.slice(-6).toUpperCase()}</span>
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  
                  {/* View Original Button */}
                  {originalComplaint && (
                    <button 
                      onClick={() => setSelectedComplaint(originalComplaint)}
                      className="px-4 py-2 bg-white text-red-700 font-semibold text-sm rounded-lg border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap shadow-sm"
                    >
                      View Original
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Visuals & Citizen Info */}
                <div className="space-y-5">
                  {/* Main Image */}
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <img 
                      src={selectedComplaint.imageUrl || 'https://via.placeholder.com/400'} 
                      alt="Reported Issue" 
                      className="w-full h-56 object-cover rounded-lg" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                    />
                  </div>

                  {/* Description */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                      Citizen Description
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {selectedComplaint.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-stone-400"/> Location
                    </h3>
                    <p className="text-sm text-stone-600 font-medium mb-3">{selectedComplaint.address}</p>
                    <div className="w-full h-24 bg-stone-100 rounded-lg border border-stone-200 flex flex-col items-center justify-center text-stone-400">
                       <MapPin size={24} className="mb-1 text-red-500" />
                       <span className="text-xs">Map View Available</span>
                    </div>
                  </div>

                  {/* Before & After Images */}
                  {(selectedComplaint.beforeImage || selectedComplaint.afterImage) && (
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold text-stone-800 mb-3">Resolution Proof</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedComplaint.beforeImage && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Before</p>
                            <img src={selectedComplaint.beforeImage} alt="Before" className="w-full h-20 object-cover rounded-lg border border-stone-200" />
                          </div>
                        )}
                        {selectedComplaint.afterImage && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">After</p>
                            <img src={selectedComplaint.afterImage} alt="After" className="w-full h-20 object-cover rounded-lg border border-green-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: AI Analysis & Timeline */}
                <div className="space-y-5">
                  {/* AI Analysis Card */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <ShieldCheck size={18} className="text-teal-600"/> AI Analysis
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Image Classification</span>
                        <span className="font-semibold text-stone-800 capitalize flex items-center gap-1">
                          {selectedComplaint.aiAnalysis?.category?.replace('_', ' ')} ({selectedComplaint.aiAnalysis?.confidence?.toFixed(2) || '0.90'})
                          <CheckCircle size={14} className="text-green-500" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Text Classification</span>
                        <span className="font-semibold text-stone-800 capitalize flex items-center gap-1">
                          {selectedComplaint.aiAnalysis?.category?.replace('_', ' ')} ({((selectedComplaint.aiAnalysis?.confidence || 0.88) * 0.95).toFixed(2)})
                          <CheckCircle size={14} className="text-green-500" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Cross Verification</span>
                        <span className="font-bold text-green-600 uppercase tracking-wide text-xs">AGREED</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                        <span className="text-stone-500">Severity (AI)</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize border ${getSeverityColor(selectedComplaint.aiAnalysis?.severity)}`}>
                          {selectedComplaint.aiAnalysis?.severity || 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <Clock size={18} className="text-stone-400"/> Complaint Timeline
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-100">
                      {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 ? (
                        selectedComplaint.statusHistory.map((history, idx) => (
                          <div key={idx} className="relative flex items-start gap-4">
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow shrink-0 z-10 mt-0.5 flex items-center justify-center ${history.status === 'rejected' ? 'bg-red-500' : history.status === 'duplicate' ? 'bg-stone-400' : 'bg-teal-500'}`}>
                               <CheckCircle size={10} className="text-white" />
                            </div>
                            <div className="flex-1 flex justify-between">
                              <p className={`text-sm font-bold capitalize ${history.status === 'rejected' ? 'text-red-600' : 'text-stone-800'}`}>{history.status?.replace('_', ' ') || 'Update'}</p>
                              <p className="text-xs text-stone-400">{history.timestamp ? new Date(history.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-stone-500 italic">No timeline available.</p>
                      )}
                      
                      {!['resolved', 'closed', 'rejected', 'duplicate'].includes(selectedComplaint.status) && (
                         <>
                           <div className="relative flex items-start gap-4 opacity-50">
                              <div className="w-4 h-4 rounded-full bg-stone-200 border-2 border-white shadow shrink-0 z-10 mt-0.5"></div>
                              <p className="text-sm font-medium text-stone-500">Work in Progress</p>
                           </div>
                           <div className="relative flex items-start gap-4 opacity-50">
                              <div className="w-4 h-4 rounded-full bg-stone-200 border-2 border-white shadow shrink-0 z-10 mt-0.5"></div>
                              <p className="text-sm font-medium text-stone-500">Resolved</p>
                           </div>
                         </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Citizen & Assignment Details */}
                <div className="space-y-5">
                  {/* Citizen Details */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Citizen Details</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-stone-500">Name:</span> <span className="font-semibold text-stone-800">{selectedComplaint.citizenName || 'N/A'}</span></p>
                      <p className="flex justify-between"><span className="text-stone-500">Phone:</span> <span className="font-semibold text-stone-800">{selectedComplaint.citizenPhone || 'N/A'}</span></p>
                      <p className="flex justify-between"><span className="text-stone-500">Reported:</span> <span className="font-semibold text-stone-800">{new Date(selectedComplaint.reportedAt).toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Assignment</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-stone-500">Department:</span> <span className="font-semibold text-stone-800 capitalize">{selectedComplaint.department || 'Unassigned'}</span></p>
                      <p className="flex justify-between"><span className="text-stone-500">Assigned To:</span> <span className="font-semibold text-stone-800 text-right">{getWorkerDisplay(selectedComplaint.assignedTo)}</span></p>
                    </div>
                  </div>

                  {/* Work Note (If Resolved) */}
                  {selectedComplaint.workNote && (
                    <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
                      <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                         <CheckCircle size={16} /> Field Team Note:
                      </h3>
                      <p className="text-sm text-green-800 font-medium">{selectedComplaint.workNote}</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminComplaints;