import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List } from 'lucide-react';

const SuperAdminSidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col gap-2">
      <NavLink 
        to="/super-admin" 
        end
        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
      >
        <LayoutDashboard size={20} /> Dashboard
      </NavLink>
      <NavLink 
        to="/super-admin/complaints" 
        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
      >
        <List size={20} /> All Complaints
      </NavLink>
    </div>
  );
};

export default SuperAdminSidebar;