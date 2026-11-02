import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, List, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center shadow-md">
      
      {/* Left Side: Logo & Links */}
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold tracking-wider">NagarDrishti</div>
        
        {/* Navigation Links (Only show if logged in) */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            {user.role === 'super_admin' && (
              <>
                <NavLink to="/super-admin" end className={navLinkClass}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/super-admin/complaints" className={navLinkClass}>
                  <List size={18} /> Complaints
                </NavLink>
                <NavLink to="/super-admin/users" className={navLinkClass}>
                  <Users size={18} /> Users
                </NavLink>
              </>
            )}
            {/* Future links for Dept Admin and Field Worker can go here */}
          </div>
        )}
      </div>
      
      {/* Right Side: User Info & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User size={18} />
            <span className="hidden sm:block">
              {user.name} <span className="text-blue-200 capitalize">({user.role.replace('_', ' ')})</span>
            </span>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className="bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors border border-blue-600"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;