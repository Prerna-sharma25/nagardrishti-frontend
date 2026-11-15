import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import { useAuth } from "../context/AuthContext";
import { Bell,LogOut,User } from "lucide-react";

const DashboardLayout = () => {
  const { user,logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Top Header (Profile & Notifications) */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-end px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="text-stone-400 hover:text-stone-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center border-l border-stone-200 pl-2">
              
              {/* Profile Info*/}
              <div className="flex items-center gap-2 text-stone-600">
                <User className="w-5 h-5 text-stone-400" />
                <span className="text-sm font-medium">
                  {user?.name || "Super Admin"} 
                  <span className="text-stone-400 ml-1">
                    ({user?.role?.replace('_', ' ') || "Super Admin"})
                  </span>
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-stone-200 mx-2"></div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              
            </div>
            
            

          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 pt-3 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;