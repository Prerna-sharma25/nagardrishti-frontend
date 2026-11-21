import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, Shield, Key, MonitorSmartphone, 
  Save, Eye, EyeOff, ChevronDown
} from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  
  // Profile State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Accordion States
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showSessionsSection, setShowSessionsSection] = useState(false);

  // Password State
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("UI Only: Backend API is required to update profile in DB.");
    }, 800);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setShowPasswordSection(false);
    alert("UI Only: Backend API is required to change password.");
  };

  return (
    <div className="max-w-8xl mx-auto pb-0">
      
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Profile Form */}
        <div className="p-6 sm:p-10 border-b border-stone-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 bg-teal-100 text-teal-700 text-4xl font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                {getInitial(user?.name)}
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-1.5">
                <h3 className="text-2xl font-bold text-stone-800">{user?.name || 'User Name'}</h3>
                <span className="px-3 py-1 rounded-md text-xs font-bold border border-purple-200 bg-purple-50 text-purple-700 uppercase">
                  {user?.role?.replace('_', ' ') || 'Role'}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-500">{user?.email || 'email@example.com'}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" required value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
              <input 
                type="email" disabled value={user?.email || ''}
                className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Phone Number</label>
              <input 
                type="text" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Role</label>
              <div className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-500 flex items-center gap-2">
                <Shield size={16} className="text-stone-400" />
                <span className="capitalize">{user?.role?.replace('_', ' ') || 'Role'}</span>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end mt-1">
              <button 
                type="submit" disabled={isSaving}
                className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-2 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Accordion */}
        <div className="border-b border-stone-100">
          <button 
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setShowSessionsSection(false); 
            }} 
            className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${showPasswordSection ? 'bg-teal-50 text-teal-600' : 'bg-stone-100 text-stone-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                <Key size={20} />
              </div>
              <span className="text-base font-semibold text-stone-800">Change Password</span>
            </div>
            <ChevronDown size={20} className={`text-stone-400 transition-transform duration-300 ${showPasswordSection ? 'rotate-180' : ''}`} />
          </button>

          {showPasswordSection && (
            <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                <form onSubmit={handleUpdatePassword} className="flex flex-col lg:flex-row gap-4 items-start lg:items-end w-full">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Current Password</label>
                    <input required type="password" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" onChange={(e) => setPassData({...passData, current: e.target.value})} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">New Password</label>
                    <div className="relative">
                      <input required type={showPass ? "text" : "password"} className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10" onChange={(e) => setPassData({...passData, new: e.target.value})} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Confirm New Password</label>
                    <input required type="password" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" onChange={(e) => setPassData({...passData, confirm: e.target.value})} />
                  </div>
                  <div className="w-full lg:w-auto">
                    <button type="submit" className="w-full lg:w-auto h-[42px] bg-[#0f766e] text-white px-6 rounded-lg text-sm font-semibold hover:bg-[#115e59] transition-colors whitespace-nowrap shadow-sm">
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions Accordion */}
        <div className="rounded-b-2xl">
          <button 
            onClick={() => {
              setShowSessionsSection(!showSessionsSection);
              setShowPasswordSection(false); 
            }} 
            className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors group rounded-b-2xl"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${showSessionsSection ? 'bg-teal-50 text-teal-600' : 'bg-stone-100 text-stone-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                <MonitorSmartphone size={20} />
              </div>
              <span className="text-base font-semibold text-stone-800">Active Sessions</span>
            </div>
            <ChevronDown size={20} className={`text-stone-400 transition-transform duration-300 ${showSessionsSection ? 'rotate-180' : ''}`} />
          </button>

          {showSessionsSection && (
            <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border border-teal-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <MonitorSmartphone size={20} className="text-teal-600" />
                    <div>
                      <p className="text-sm font-bold text-stone-800">Windows • Chrome</p>
                      <p className="text-xs text-stone-500">New Delhi, India • Active Now</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 uppercase">Current</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MonitorSmartphone size={20} className="text-stone-400" />
                    <div>
                      <p className="text-sm font-bold text-stone-800">iPhone 13 • Safari</p>
                      <p className="text-xs text-stone-500">Mumbai, India • 2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 uppercase">Logout</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;