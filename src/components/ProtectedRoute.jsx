import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // If not logged in, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role is not allowed, send to their default dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'super_admin') return <Navigate to="/super-admin" replace />;
    if (user.role === 'dept_admin') return <Navigate to="/dept-admin" replace />;
    if (user.role === 'field_worker') return <Navigate to="/field-worker" replace />;
  }

  // Render the child route
  return <Outlet />;
};

export default ProtectedRoute;