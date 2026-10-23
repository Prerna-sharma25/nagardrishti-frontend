import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Placeholder dashboards

const DeptAdminDashboard = () => <div><h1 className="text-3xl font-bold text-gray-800">Dept Admin Dashboard</h1><p className="mt-2 text-gray-600">Department tasks coming here.</p></div>;
const FieldWorkerDashboard = () => <div><h1 className="text-3xl font-bold text-gray-800">Field Worker Dashboard</h1><p className="mt-2 text-gray-600">Your assigned tasks coming here.</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['dept_admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dept-admin" element={<DeptAdminDashboard />} />
          </Route>
        </Route>

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