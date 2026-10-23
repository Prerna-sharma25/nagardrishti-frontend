import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold tracking-wider">NagarDrishti</div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User size={18} />
          <span className="text-sm hidden sm:block">
            {user?.name} <span className="text-blue-200 capitalize">({user?.role.replace('_', ' ')})</span>
          </span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;