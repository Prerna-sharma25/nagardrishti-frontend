import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminComplaints from './pages/SuperAdminComplaints';
import SuperAdminUsers from './pages/SuperAdminUsers';

// Dept Admin Pages
import DeptAdminDashboard from './pages/DeptAdminDashboard';
import DeptAdminFieldTeam from './pages/DeptAdminFieldTeam'; // ✅ NAYA IMPORT

// Field Worker Pages
import FieldWorkerDashboard from './pages/FieldWorkerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/complaints" element={<SuperAdminComplaints />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
          </Route>
        </Route>

        {/* Dept Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['dept_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dept-admin" element={<DeptAdminDashboard />} />
            <Route path="/dept-admin/field-team" element={<DeptAdminFieldTeam />} /> {/* ✅ NAYA ROUTE */}
          </Route>
        </Route>

        {/* Field Worker Routes */}
        <Route element={<ProtectedRoute allowedRoles={['field_worker']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/field-worker" element={<FieldWorkerDashboard />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;