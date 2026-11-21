import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, HardHat, Shield, UserPlus, Search, FilterX, 
  MapPin, CheckCircle, XCircle, X, ChevronDown, Mail, Lock, User
} from 'lucide-react';

const DeptAdminFieldTeam = () => {
  const { user } = useContext(AuthContext);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Modal Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', zone: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch Workers
  const fetchWorkers = async () => {
    try {
      const response = await api.get('/admin/field-team');
      setWorkers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle Add Worker
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        ...formData,
        role: 'field_worker',
        department: user?.department || 'roads'
      };
      
      await api.post('/admin/users', payload); 
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', zone: '' });
      fetchWorkers(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating field worker');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filters
  const filteredWorkers = workers.filter(w => {
    const searchStr = searchTerm.toLowerCase().replace('#', '');
    
    const nameMatch = w.name ? w.name.toLowerCase().includes(searchStr) : false;
    const emailMatch = w.email ? w.email.toLowerCase().includes(searchStr) : false;
    const zoneMatch = w.zone ? w.zone.toLowerCase().includes(searchStr) : false;
    
    // ID Match logic
    const idMatch = w._id ? w._id.toLowerCase().includes(searchStr) : false;
    const shortIdMatch = w._id ? w._id.slice(-6).toLowerCase().includes(searchStr) : false;
    
    const matchesSearch = nameMatch || emailMatch || zoneMatch || idMatch || shortIdMatch;
    const matchesZone = zoneFilter === 'all' || w.zone === zoneFilter;

    return matchesSearch && matchesZone;
  });

  // Extract unique zones for dropdown
  const uniqueZones = [...new Set(workers.map(w => w.zone).filter(Boolean))];

  const hasActiveFilters = searchTerm !== '' || zoneFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setZoneFilter('all');
  };

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading field team...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* 1. Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            {user?.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : ''} Field Team
          </h1>
          <p className="text-sm text-stone-500 mt-1">Manage and monitor your department's field workers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus size={18} /> Add Field Worker
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-3 w-full mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, name, or zone..." 
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-48 flex-shrink-0">
          <select 
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="all">All Zones</option>
            {uniqueZones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {hasActiveFilters ? (
          <button 
            onClick={clearFilters}
            className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <FilterX size={16} /> Clear Filters
          </button>
        ) : (
          <div className="w-full md:w-auto px-4 py-2.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl border border-stone-200 text-center flex-shrink-0 whitespace-nowrap">
            Showing: {filteredWorkers.length}
          </div>
        )}
      </div>

      {/* 3. Workers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Worker ID</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-stone-500">
                    No field workers found.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-stone-50/50 transition-colors">
                    
                    <td className="px-6 py-4 text-sm font-bold text-stone-700 font-mono whitespace-nowrap">
                      #{worker._id.slice(-6).toUpperCase()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                          {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <span className="font-bold text-stone-800">{worker.name}</span>
                      </div>
                    </td>

                    {/* Email  */}
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {worker.email || '-'}
                    </td>

                    <td className="px-6 py-4 text-sm text-stone-600">
                      {worker.phone || '-'}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border border-green-200 bg-green-50 text-green-700 uppercase">
                        Field Worker
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-stone-600">
                      {worker.zone ? (
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-400"/> {worker.zone}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Worker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200">
            
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Add Field Worker</h2>
                <p className="text-xs text-stone-500 mt-1">Create a new login for your department's worker</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-red-500 bg-white border border-stone-200 p-2 rounded-full shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateWorker} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-stone-400" /></div>
                  <input required type="text" placeholder="Enter full name" className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Department</label>
                  <div className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-500 capitalize flex items-center">
                    {user?.department || 'Roads'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Zone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin size={18} className="text-stone-400" /></div>
                    <input required type="text" placeholder="e.g. North Zone" className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-stone-400" /></div>
                  <input required type="email" placeholder="name@nagardrishti.com" className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-stone-400" /></div>
                  <input required type="text" placeholder="+91 XXXXX XXXXX" className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-stone-400" /></div>
                  <input required type="password" placeholder="Create a password" className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold hover:bg-stone-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button disabled={submitLoading} type="submit" className="flex-1 bg-[#0f766e] text-white py-2.5 rounded-xl font-semibold hover:bg-[#115e59] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
                  {submitLoading ? 'Creating...' : <><UserPlus size={18}/> Create Account</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptAdminFieldTeam;