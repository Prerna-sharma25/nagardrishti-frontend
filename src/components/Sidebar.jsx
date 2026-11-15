import { NavLink } from "react-router-dom";
import { Home, List, Users, BarChart2, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoSidebar from "../assets/sidebarLogo.png"; 
import sidebarCity from "../assets/sidebar_bottom.png"; 

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/super-admin", icon: Home },
    { name: "Complaints", path: "/super-admin/complaints", icon: List },
    { name: "Users", path: "/super-admin/users", icon: Users },
    { name: "Analytics", path: "/super-admin/analytics", icon: BarChart2 },
    { name: "Reports", path: "/super-admin/reports", icon: FileText },
    { name: "Settings", path: "/super-admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-[#0b5c55] text-white flex flex-col h-screen fixed left-0 top-0 z-30 overflow-hidden">
      
      {/* Logo Area */}
      <div className="px-2 pt-4 pb-4">
        <img src={logoSidebar} alt="NagarDrishti" className="w-full h-auto object-contain" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-2 z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/super-admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-m font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#138f84] text-white shadow-m" 
                  : "text-teal-100/80 hover:bg-white/10 hover:text-white" 
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Illustration*/}
      <div className="relative mt-auto">
        
        {/* City Illustration */}
        {sidebarCity && (
          <div className="w-full relative mt-auto">
            <img 
              src={sidebarCity} 
              alt="City" 
              className="w-full h-auto object-contain" 
              style={{ 
                maskImage: 'linear-gradient(to top, black 60%, transparent 100%)', 
                WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)' 
              }}
            />
          </div>
        )}

      </div>

    </aside>
  );
};

export default Sidebar;