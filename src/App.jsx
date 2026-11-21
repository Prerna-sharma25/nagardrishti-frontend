import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Settings from './pages/Settings';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminComplaints from './pages/SuperAdminComplaints';
import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminAnalytics from './pages/SuperAdminAnalytics';
import SuperAdminReports from './pages/SuperAdminReports';

// Dept Admin Pages
import DeptAdminDashboard from './pages/DeptAdminDashboard';
import DeptAdminAllComplaints from './pages/DeptAdminAllComplaints';
import DeptAdminFieldTeam from './pages/DeptAdminFieldTeam'; 

// Field Worker Pages
import FieldWorkerTasks from './pages/FieldWorkerTasks';
import FieldWorkerHistory from './pages/FieldWorkerHistory';

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
            <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/super-admin/reports" element={<SuperAdminReports />} />
            <Route path="/super-admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Dept Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['dept_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dept-admin" element={<DeptAdminDashboard />} />
            <Route path="/dept-admin/complaints" element={<DeptAdminAllComplaints />} />
            <Route path="/dept-admin/field-team" element={<DeptAdminFieldTeam />} /> 
            <Route path="/dept-admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Field Worker Routes */}
        <Route element={<ProtectedRoute allowedRoles={['field_worker']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/field-worker" element={<FieldWorkerTasks />} />
            <Route path="/field-worker/history" element={<FieldWorkerHistory />} />
            <Route path="/field-worker/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;