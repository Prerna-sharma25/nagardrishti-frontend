import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Search, MapPin, Eye, X, Download, FilterX, ChevronLeft, ChevronRight, ChevronDown,
  ShieldCheck, CheckCircle, Clock, AlertTriangle, UserPlus, Shield, ArrowLeft, Briefcase, Send, XCircle, Info, User
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

const DeptAdminAllComplaints = () => {
  const { user } = useContext(AuthContext);
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldWorkers, setFieldWorkers] = useState([]);
  
  // Modal States
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionTab, setActionTab] = useState('assign');
  const [selectedWorker, setSelectedWorker] = useState('');
  
  // Loading state for Assign button
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(''); 
  const [isRejecting, setIsRejecting] = useState(false);      
  const [rejectSuccess, setRejectSuccess] = useState(false);  

  const [isClosing, setIsClosing] = useState(false);
  const [closeSuccess, setCloseSuccess] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortOption, setSortOption] = useState('priority_desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. FETCH FUNCTIONS
  
  // Fetch Complaints 
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

  // Fetch Field Team
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/admin/field-team'); 
        const workers = Array.isArray(response.data.data) ? response.data.data : [];
        setFieldWorkers(workers);
      } catch (error) {
        console.error('Error fetching field team:', error);
        setFieldWorkers([]);
      }
    };
    fetchWorkers();
    fetchComplaints();
  }, []);

  // Reset states when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setSelectedWorker('');
      setAssignSuccess(false);
      setRejectionReason(''); 
      setRejectSuccess(false); 
      setIsClosing(false);    
      setCloseSuccess(false);  
    }
  }, [isModalOpen]);

  // Handle Assign Worker API Call
  const handleAssignWorker = async () => {
    if (!selectedWorker) return alert("Please select a field worker first!");
    
    setIsAssigning(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/assign`, { 
        teamId: selectedWorker 
      });
    
      setAssignSuccess(true);
      setIsAssigning(false);

      setTimeout(() => {
        setIsModalOpen(false);
        fetchComplaints(); 
      }, 2000);

    } catch (error) {
      console.error("Error assigning worker:", error);
      alert(error.response?.data?.message || "Failed to assign worker. Please try again.");
      setIsAssigning(false); 
    }
  };

  const handleRejectComplaint = async () => {
    if (!rejectionReason) return alert("Please select a reason for rejection.");
    
    setIsRejecting(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/reject`, { 
        reason: rejectionReason 
      });
      
      setRejectSuccess(true);
      setIsRejecting(false);
      
      setTimeout(() => {
        setIsModalOpen(false);
        fetchComplaints(); 
      }, 2000);

    } catch (error) {
      console.error("Error rejecting complaint:", error);
      alert(error.response?.data?.message || "Failed to reject complaint.");
      setIsRejecting(false);
    }
  };

  const handleCloseComplaint = async () => {
    setIsClosing(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}/close`, { 
        adminNote: "Verified the proof. Good work by the field team." 
      });
      
      setCloseSuccess(true);
      setIsClosing(false);

      setTimeout(() => {
        setIsModalOpen(false);
        fetchComplaints(); 
      }, 2000);

    } catch (error) {
      console.error("Error closing complaint:", error);
      alert(error.response?.data?.message || "Failed to close complaint.");
      setIsClosing(false);
    }
  };
  
  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, severityFilter, sortOption]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || severityFilter !== 'all' || sortOption !== 'priority_desc';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setSortOption('priority_desc');
  };

  // Export to Excel
  const handleExport = () => {
    if (filteredComplaints.length === 0) {
      alert("No data to export!");
      return;
    }

    const exportData = filteredComplaints.map(c => ({
      "Complaint ID": c._id.slice(-6).toUpperCase(),
      "Category": c.aiAnalysis?.category?.replace('_', ' ') || 'Unknown',
      "Description": c.description || 'N/A',
      "Address": c.address || 'N/A',
      "Severity": c.aiAnalysis?.severity || 'N/A',
      "Status": c.status?.replace('_', ' ') || 'Unknown',
      "Assigned To": c.assignedTo?.name || 'Unassigned',
      "Reported Date": new Date(c.reportedAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dept Complaints");
    worksheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    
    XLSX.writeFile(workbook, `Dept_Complaints_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter & Sort Logic
  const filteredComplaints = complaints.filter(c => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = (
      (c._id && c._id.toLowerCase().includes(searchStr)) ||
      (c.address && c.address.toLowerCase().includes(searchStr)) ||
      (c.description && c.description.toLowerCase().includes(searchStr)) ||
      (c.aiAnalysis?.category && c.aiAnalysis.category.toLowerCase().includes(searchStr))
    );
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.aiAnalysis?.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  }).sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    if (sortOption === 'priority_desc') return priorityB - priorityA;
    if (sortOption === 'priority_asc') return priorityA - priorityB;
    if (sortOption === 'newest') return new Date(b.reportedAt) - new Date(a.reportedAt);
    return 0;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // UI Helpers
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-stone-100 text-stone-700 border-stone-300';
      case 'verified': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-stone-100 text-stone-600 border-stone-300';
      default: return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading department complaints...</div>;

  return (
    <div className="flex flex-col gap-6 pb-0 w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 1. Header & KPI Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
              {user?.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : ''} Complaints
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">Verified complaints assigned to your department</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:flex-row gap-3 w-full items-center justify-between">
        <div className="flex flex-col md:flex-row w-full gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, location or keyword..." 
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Needs Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Needs Approval</option>
            <option value="closed">Closed</option>
          </select>

          <select 
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer min-w-[130px]"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select 
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer min-w-[180px]"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="priority_desc">Sort: High to Low</option>
            <option value="priority_asc">Sort: Low to High</option>
            <option value="newest">Sort: Newest First</option>
          </select>
        </div>

        <div className="w-full lg:w-auto flex-shrink-0">
          {hasActiveFilters ? (
            <button 
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <FilterX size={16} /> Clear Filters
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-600 rounded-xl px-4 py-2.5 text-sm font-medium border border-stone-200">
              Total: {filteredComplaints.length}
            </div>
          )}
        </div>
      </div>

      {/* 3. Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200">
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Issue Type</th>
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">Severity</th>
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-500">
                    No complaints found matching your filters.
                  </td>
                </tr>
              ) : (
                currentItems.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-4 py-4 text-sm font-bold text-stone-700 font-mono whitespace-nowrap">
                      #{c._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={c.imageUrl || 'https://via.placeholder.com/100'} 
                          alt="issue" 
                          className="w-8 h-8 rounded-md object-cover bg-stone-100 border border-stone-200 shrink-0" 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                        />
                        <span className="text-sm font-bold text-stone-800 capitalize truncate">
                          {c.aiAnalysis?.category?.replace('_', ' ') || 'Issue'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-start gap-1.5 text-xs text-stone-600">
                        <MapPin size={14} className="mt-0.5 text-stone-400 shrink-0" />
                        <span className="line-clamp-1 max-w-[200px]">{c.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getSeverityColor(c.aiAnalysis?.severity)}`}>
                        {c.aiAnalysis?.severity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(c.status)}`}>
                        {c.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => { setSelectedComplaint(c); setIsModalOpen(true); }}
                        className="text-stone-400 hover:text-teal-600 bg-white hover:bg-teal-50 border border-transparent hover:border-teal-100 p-2 rounded-lg transition-all"
                        title="View & Manage"
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

      {/* --- COMPLAINT DETAILS & ACTIONS MODAL --- */}
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
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-stone-500 flex items-center gap-2">
                  <span className="font-semibold text-stone-700 capitalize">{selectedComplaint.aiAnalysis?.category?.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{selectedComplaint.address}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="bg-[#0f766e] text-white hover:bg-[#115e59] p-2 rounded-full transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-stone-50/50 flex-1">
              
              {/* Duplicate Warning Box */}
              {selectedComplaint.aiAnalysis?.duplicateOf && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={20} />
                    <div>
                      <h4 className="text-red-800 font-bold text-sm">Duplicate Complaint Alert</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This report is identical to an existing complaint.
                      </p>
                      <p className="text-sm text-red-700 mt-1.5 flex items-center gap-2">
                        Original ID: <span className="font-mono font-bold bg-red-100 px-1.5 py-0.5 rounded border border-red-200">#{selectedComplaint.aiAnalysis.duplicateOf.slice(-6).toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Visuals */}
                <div className="space-y-5">
                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <img 
                      src={selectedComplaint.imageUrl || 'https://via.placeholder.com/800x400'} 
                      alt="Reported Issue" 
                      className="w-full h-56 object-cover rounded-lg" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400'; }}
                    />
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">Citizen Description</h3>
                    <p className="text-sm text-stone-600 leading-relaxed mb-4">
                      {selectedComplaint.description || 'No description provided.'}
                    </p>
                    <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><MapPin size={16} /> Location</h3>
                    <p className="text-sm text-stone-600 font-medium">{selectedComplaint.address}</p>
                  </div>

                  {/* Before & After Images */}
                  {['in_progress', 'resolved', 'closed'].includes(selectedComplaint.status) && (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                      <h3 className="font-bold text-stone-800 mb-3 text-sm">Resolution Proof</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedComplaint.beforeImage && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">Before</p>
                            <img src={selectedComplaint.beforeImage} alt="Before" className="w-full h-20 object-cover rounded-lg border border-stone-200" />
                          </div>
                        )}
                        {['resolved', 'closed'].includes(selectedComplaint.status) && selectedComplaint.afterImage && (
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
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <ShieldCheck size={18} className="text-teal-600"/> AI Analysis
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Confidence Score</span>
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {selectedComplaint.aiAnalysis?.confidence ? `${(selectedComplaint.aiAnalysis.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Category</span>
                        <span className="font-semibold text-stone-800 capitalize">{selectedComplaint.aiAnalysis?.category?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Severity (AI)</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize border ${getSeverityColor(selectedComplaint.aiAnalysis?.severity)}`}>
                          {selectedComplaint.aiAnalysis?.severity || 'Low'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Cross Verification</span>
                        <span className="font-bold text-green-600 uppercase tracking-wide text-xs">AGREED</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                        <span className="text-stone-500">Priority Score</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500 text-sm tracking-tighter">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (selectedComplaint.priority || 1) ? 'text-amber-500' : 'text-stone-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-xs border border-stone-200">
                            {selectedComplaint.priority || 1}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                      <Clock size={18} className="text-stone-400"/> Timeline
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-100">
                      {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 ? (
                        selectedComplaint.statusHistory.map((history, idx) => (
                          <div key={idx} className="relative flex items-start gap-4">
                            <div className="w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow shrink-0 z-10 mt-0.5 flex items-center justify-center">
                               <CheckCircle size={10} className="text-white" />
                            </div>
                            <div className="flex-1 flex justify-between">
                              <p className="text-sm font-bold text-stone-800 capitalize">{history.status?.replace('_', ' ') || 'Update'}</p>
                              <p className="text-xs text-stone-400">{new Date(history.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-stone-500 italic">No timeline available.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Details & Actions */}
                <div className="space-y-5">
                  {/* Citizen Details */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Citizen Details</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-stone-500">Name:</span> <span className="font-semibold text-stone-800">{selectedComplaint.citizenName || 'N/A'}</span></p>
                      <p className="flex justify-between"><span className="text-stone-500">Phone:</span> <span className="font-semibold text-stone-800">{selectedComplaint.citizenPhone || 'N/A'}</span></p>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">Assignment</h3>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-stone-500">Department:</span> <span className="font-semibold text-stone-800 capitalize">{selectedComplaint.department || 'Unassigned'}</span></p>
                      <p className="flex justify-between"><span className="text-stone-500">Assigned To:</span> <span className="font-semibold text-stone-800 text-right">{selectedComplaint.assignedTo?.name || 'Not Assigned'}</span></p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  {['pending', 'verified'].includes(selectedComplaint.status) && (
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                      {/* Tabs Header */}
                      <div className="flex border-b border-stone-200 bg-stone-50/50">
                        <button 
                          onClick={() => setActionTab('assign')} 
                          className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold transition-colors ${
                            actionTab === 'assign' 
                              ? 'text-blue-700 bg-white border-b-2 border-blue-600' 
                              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <UserPlus size={16} /> Assign Task
                        </button>
                        <button 
                          onClick={() => setActionTab('reject')} 
                          className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold transition-colors ${
                            actionTab === 'reject' 
                              ? 'text-red-700 bg-white border-b-2 border-red-600' 
                              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-5">
                        {/* ASSIGN TAB */}
                        {actionTab === 'assign' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
                                <Briefcase size={20}/>
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-800 text-sm">Assign to Field Worker</h4>
                                <p className="text-xs text-stone-500 mt-0.5">Select a field worker and assign this complaint for resolution.</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Field Worker <span className="text-red-500">*</span></label>
                                <div className="relative">
                                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                  <select 
                                    value={selectedWorker}
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                                  >
                                    <option value="">Select Field Worker...</option>
                                    {fieldWorkers.map((worker) => (
                                      <option key={worker._id} value={worker._id}>
                                        {worker.name} {worker.zone ? `(${worker.zone})` : ''}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>

                                                        <button 
                              onClick={handleAssignWorker} 
                              disabled={!selectedWorker || isAssigning || assignSuccess}
                              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm mt-4 ${
                                assignSuccess 
                                  ? 'bg-green-600 text-white cursor-default scale-105' // Green Tick wala design
                                  : 'bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                            >
                              {isAssigning ? (
                                <>Assigning...</>
                              ) : assignSuccess ? (
                                <><CheckCircle size={18} /> Assigned Successfully!</> // Tick yahan hai
                              ) : (
                                <><Send size={16} /> Assign Task</>
                              )}
                            </button>
                          </div>
                        )}

                        {actionTab === 'reject' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                <AlertTriangle size={20}/>
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-800 text-sm">Reject Complaint</h4>
                                <p className="text-xs text-stone-500 mt-0.5">Provide a valid reason for rejecting this complaint.</p>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <select 
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                                >
                                  <option value="">Select Reason...</option>
                                  <option value="Not a valid issue">Not a valid issue</option>
                                  <option value="Duplicate complaint">Duplicate complaint</option>
                                  <option value="Incorrect Department">Incorrect Department</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                              </div>
                            </div>

                            <button 
                              onClick={handleRejectComplaint} 
                              disabled={!rejectionReason || isRejecting || rejectSuccess}
                              className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm mt-4 ${
                                rejectSuccess 
                                  ? 'bg-red-600 text-white cursor-default scale-105' 
                                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                            >
                              {isRejecting ? (
                                <>Rejecting...</>
                              ) : rejectSuccess ? (
                                <><CheckCircle size={18} /> Rejected Successfully!</>
                              ) : (
                                <><XCircle size={16} /> Reject Complaint</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                                    {/* APPROVAL*/}
                  {selectedComplaint.status === 'resolved' && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                      <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle size={18} /> Ready to Close
                      </h3>
                      <p className="text-sm text-green-700 mb-3">The field team has resolved this issue. Please verify and close the complaint.</p>
                      
                      {/* UPDATED BUTTON */}
                      <button 
                        onClick={handleCloseComplaint}
                        disabled={isClosing || closeSuccess}
                        className={`w-full py-2 rounded-lg font-semibold transition-colors shadow-sm text-sm flex justify-center items-center gap-2 ${
                          closeSuccess 
                            ? 'bg-green-700 text-white cursor-default' 
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isClosing ? (
                          <>Closing...</>
                        ) : closeSuccess ? (
                          <><CheckCircle size={18} /> Closed Successfully!</>
                        ) : (
                          <>Approve & Close</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* CLOSED */}
                  {selectedComplaint.status === 'closed' && (
                    <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-center">
                      <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
                      <h3 className="font-bold text-stone-800">Complaint Closed</h3>
                      <p className="text-xs text-stone-500 mt-1">This issue has been fully resolved and closed.</p>
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

export default DeptAdminAllComplaints;