import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder components for dashboards
const SuperAdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Super Admin Dashboard</h1></div>;
const DeptAdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dept Admin Dashboard</h1></div>;
const FieldWorkerDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Field Worker Dashboard</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/dept-admin" element={<DeptAdminDashboard />} />
        <Route path="/field-worker" element={<FieldWorkerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;