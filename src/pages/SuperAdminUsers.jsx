import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserPlus, Shield, User, X, Users, HardHat, Search, FilterX, ChevronDown,
  Mail, Phone, Lock, Briefcase, MapPin 
} from 'lucide-react';

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'dept_admin', department: 'roads', zone: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

    const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      //create a new payload so that the correct data is sent to the backend
      const payload = { ...formData };
      
      // If the user is a Super Admin, set department and zone to null not an empty string
      if (payload.role === 'super_admin') {
        payload.department = null;
        payload.zone = null;
      }

      await api.post('/admin/users', payload);
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'dept_admin', department: 'roads', zone: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(u => {
    const searchStr = searchTerm.toLowerCase();
    const nameMatch = u.name ? u.name.toLowerCase().includes(searchStr) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(searchStr) : false;
    const phoneMatch = u.phone ? u.phone.toLowerCase().includes(searchStr) : false;
    const deptMatch = u.department ? u.department.toLowerCase().includes(searchStr) : false;
    
    const matchesSearch = nameMatch || emailMatch || phoneMatch || deptMatch;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const hasActiveFilters = searchTerm !== '' || roleFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
  };

  // Stats calculation
  const totalUsers = users.length;
  const deptAdmins = users.filter(u => u.role === 'dept_admin').length;
  const fieldWorkers = users.filter(u => u.role === 'field_worker').length;

  // Modern Role Badges
  const getRoleBadge = (role) => {
    if (role === 'super_admin') return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border border-purple-200 bg-purple-50 text-purple-700 uppercase">Super Admin</span>;
    if (role === 'dept_admin') return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-200 bg-blue-50 text-blue-700 uppercase">Dept Admin</span>;
    return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border border-green-200 bg-green-50 text-green-700 uppercase">Field Worker</span>;
  };

  // Helper for Avatar Initial
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) return <div className="text-center mt-20 text-stone-500 font-medium">Loading users...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-0">
      
      {/* 1. Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">User Management</h1>
          <p className="text-sm text-stone-500 mt-1">Manage department administrators and field workers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0f766e] hover:bg-[#115e59] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Users */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600"></div>
          <div className="p-3 bg-teal-50/80 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-stone-800">{totalUsers}</h3>
          </div>
        </div>
        
        {/* Dept Admins */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Department Admins</p>
            <h3 className="text-2xl font-bold text-stone-800">{deptAdmins}</h3>
          </div>
        </div>

        {/* Field Workers */}
        <div className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 relative overflow-hidden flex items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
          <div className="p-3 bg-amber-50/80 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <HardHat size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Field Workers</p>
            <h3 className="text-2xl font-bold text-stone-800">{fieldWorkers}</h3>
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-3 w-full mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone or department..." 
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-48 flex-shrink-0">
          <select 
            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="dept_admin">Dept Admin</option>
            <option value="field_worker">Field Worker</option>
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
            Showing: {filteredUsers.length}
          </div>
        )}
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Department / Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-stone-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'dept_admin' ? 'bg-blue-100 text-blue-700' : 
                            'bg-green-100 text-green-700'}`}
                        >
                          {getInitial(u.name)}
                        </div>
                        <span className="font-bold text-stone-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{u.phone || '-'}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-sm text-stone-600 capitalize">
                      {u.role === 'super_admin' ? '-' : (u.department ? `${u.department} ${u.zone ? `(${u.zone})` : ''}` : '-')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200">
            
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Add New User</h2>
                <p className="text-xs text-stone-500 mt-1">Create login credentials for staff</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-stone-400 hover:text-red-500 bg-white border border-stone-200 p-2 rounded-full shadow-sm transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 pt-3 space-y-3 max-h-[75vh] overflow-y-auto">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-stone-400" />
                  </div>
                  <input 
                    required type="text" 
                    placeholder="Enter full name" 
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-stone-400" />
                  </div>
                  <input 
                    required type="email" 
                    placeholder="name@nagardrishti.com" 
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-stone-400" />
                  </div>
                  <input 
                    required type="text" 
                    placeholder="+91 XXXXX XXXXX" 
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-stone-400" />
                  </div>
                  <input 
                    required type="password" 
                    placeholder="Create a strong password" 
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield size={18} className="text-stone-400" />
                  </div>
                  <select 
                    className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white appearance-none cursor-pointer" 
                    value={formData.role} 
                    onChange={e => {
                      const newRole = e.target.value;
                      setFormData({
                        ...formData, 
                        role: newRole,
                        department: newRole === 'super_admin' ? '' : (formData.department || 'roads'),
                        zone: newRole === 'super_admin' ? '' : formData.zone
                      });
                    }}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="dept_admin">Dept Admin</option>
                    <option value="field_worker">Field Worker</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Department & Zone */}
              {formData.role !== 'super_admin' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase size={18} className="text-stone-400" />
                      </div>
                      <select 
                        className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white appearance-none cursor-pointer" 
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})}
                      >
                        <option value="roads">Roads</option>
                        <option value="sanitation">Sanitation</option>
                        <option value="water">Water</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {formData.role === 'field_worker' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Zone</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={18} className="text-stone-400" />
                        </div>
                        <input 
                          required type="text" 
                          placeholder="e.g. North Zone" 
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors" 
                          value={formData.zone || ''} 
                          onChange={e => setFormData({...formData, zone: e.target.value})} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold hover:bg-stone-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  disabled={submitLoading} 
                  type="submit" 
                  className="flex-1 bg-[#0f766e] text-white py-2.5 rounded-xl font-semibold hover:bg-[#115e59] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitLoading ? 'Creating...' : <><UserPlus size={18}/> Create User</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;