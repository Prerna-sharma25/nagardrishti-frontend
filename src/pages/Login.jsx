import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Users, HardHat, Info } from "lucide-react";
import logoFull from "../assets/logo_dashboard.png"; 
import loginCity from "../assets/login_city.png"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === "super_admin") navigate("/super-admin");
      else if (result.role === "dept_admin") navigate("/dept-admin");
      else if (result.role === "field_worker") navigate("/field-worker");
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      
      {/* LEFT SIDE - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white flex-col overflow-hidden">
        
        {/* Custom SVG Background for the Wavy Design */}
        <svg
          className="absolute inset-0 w-full h-full z-0"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {/* SVG Gradient Definition */}
          <defs>
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="100%" stopColor="#e0f2f1" />
              <stop offset="100%" stopColor="#f0fdfa" />
              <stop offset="100%" stopColor="#e0f2f1" />
            </linearGradient>
          </defs>

          <rect width="100" height="100" fill="url(#topGradient)" />
          
          {/* Teal wavy shape */}
          <path d="M0,15 C30,30 70,0 100,20 L100,100 L0,100 Z" fill="#0f766e" />
        </svg>

        {/* Top: Logo */}
        <div className="relative z-10 p-6">
          <img 
            src={logoFull} 
            alt="NagarDrishti Logo" 
            className="h-24 object-contain" 
          />
        </div>

        {/* Middle & Bottom: Text, Illustration, Roles */}
        <div className="relative z-10 px-12 pb-12 flex flex-col flex-grow justify-end">
          
          {/* Text Section */}
          <div className="mb-4 mt-8">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4 text-white">
              Civic Infrastructure<br />Management Platform
            </h1>
            <p className="text-teal-100 text-lg max-w-md">
              A unified platform for municipal authorities to verify, assign, and resolve civic complaints.
            </p>
          </div>

          {/* Illustration Image */}
          {loginCity && (
            <div className="relative w-[calc(100%+6rem)] -ml-12 h-64 overflow-hidden">
              <img 
                src={loginCity} 
                alt="City Illustration" 
                className="w-full h-full object-cover object-center"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
                }}
              />
            </div>
          )}

          {/* Roles */}
          <div className="flex justify-between items-center pb-2 w-full relative z-20">
            <div className="flex flex-col items-center text-center text-white flex-1">
              <ShieldCheck className="w-10 h-10 mb-2 text-teal-300" />
              <span className="font-semibold text-m">Super Admin</span>
              <span className="text-xs text-teal-200">System Oversight</span>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px h-12 bg-white/20 mx-2"></div>

            <div className="flex flex-col items-center text-center text-white flex-1">
              <Users className="w-10 h-10 mb-2 text-teal-300" />
              <span className="font-semibold text-m">Department Admin</span>
              <span className="text-xs text-teal-200">Complaint Management</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-12 bg-white/20 mx-2"></div>

            <div className="flex flex-col items-center text-center text-white flex-1">
              <HardHat className="w-10 h-10 mb-2 text-teal-300" />
              <span className="font-semibold text-m">Field Worker</span>
              <span className="text-xs text-teal-200">Issue Resolution</span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#e0f2f1] via-[#f0fdfa] to-white p-6 sm:p-12 relative bg-white z-20">
        
        {/* THE LOGIN CARD */}
        <div className="w-full max-w-md ">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Staff Login</h2>
            <p className="text-stone-500">Access your NagarDrishti account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Info Banner */}
          <div className="mt-8 flex items-center gap-4 p-2 pl-5 bg-[#f4fbf9] rounded-xl border border-teal-100 border-l-[6px] border-l-teal-600 shadow-sm">

            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <p className="text-stone-600 text-sm leading-snug">
                <strong className="font-semibold text-stone-900">
                  Authorized Access Only
                </strong>{" "}
                - Access is restricted to Super Admin, Department Admin, and Field Worker accounts.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;