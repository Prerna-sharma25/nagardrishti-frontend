import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Shield, User, X } from 'lucide-react';

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'dept_admin', department: 'roads'
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
      await api.post('/admin/users', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'dept_admin', department: 'roads' }); // reset
      fetchUsers(); // refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-200">Super Admin</span>;
    if (role === 'dept_admin') return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">Dept Admin</span>;
    return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Field Worker</span>;
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading users...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Manage department admins and field workers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Department / Zone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{u.name}</td>
                <td className="p-4 text-sm text-slate-600">
                  <p>{u.email}</p>
                  <p className="text-xs text-slate-400">{u.phone}</p>
                </td>
                <td className="p-4">{getRoleBadge(u.role)}</td>
                <td className="p-4 text-sm text-slate-600 capitalize">
                  {u.department ? `${u.department} ${u.zone ? `(${u.zone})` : ''}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Create New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full border p-2 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input required type="password" className="w-full border p-2 rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select className="w-full border p-2 rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="dept_admin">Department Admin</option>
                  <option value="field_worker">Field Worker</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <select className="w-full border p-2 rounded-lg" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                    <option value="roads">Roads</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="water">Water</option>
                    <option value="electricity">Electricity</option>
                  </select>
                </div>
                {formData.role === 'field_worker' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Zone</label>
                    <input required type="text" placeholder="e.g. North Zone" className="w-full border p-2 rounded-lg" value={formData.zone || ''} onChange={e => setFormData({...formData, zone: e.target.value})} />
                  </div>
                )}
              </div>

              <button disabled={submitLoading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-4 transition-colors">
                {submitLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsers;