import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeptAdminFieldTeam = () => {
  const { user } = useContext(AuthContext);
  const [fieldTeam, setFieldTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/admin/field-team');
        setFieldTeam(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading field team...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 capitalize">{user?.department} - Field Team</h1>
          <p className="text-slate-500 mt-1">Manage all field workers in your department</p>
        </div>
        <Link to="/dept-admin" className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold text-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>

      {fieldTeam.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
          <User size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No Field Workers</h2>
          <p className="text-slate-500 mt-2">No field workers are assigned to your department yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fieldTeam.map((worker) => (
            <div key={worker._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {worker.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{worker.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">Field Worker</p>
                </div>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{worker.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{worker.zone || 'Zone not assigned'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeptAdminFieldTeam;