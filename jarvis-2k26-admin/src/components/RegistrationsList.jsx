import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { Search, ExternalLink, Loader2 } from 'lucide-react';

function RegistrationsList() {
  const { sessionToken } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const result = await adminApi.getRegistrations(sessionToken);

        if (result.status === 'success') {
          setRegistrations(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch registrations.');
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, [sessionToken]);

  const filtered = registrations.filter(reg =>
    reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.teamId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-500">Loading registrations...</p>
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team or ID..."
            className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Registration ID</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Team Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Created At</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Payment</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map(reg => (
                <tr key={reg.teamId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">{reg.teamId}</td>
                  <td className="p-4 font-medium text-gray-900">{reg.teamName}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.paymentStatus === 'Verified' ? 'bg-green-100 text-green-700' :
                      reg.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {reg.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/registration/${reg.teamId}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-500">No registrations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RegistrationsList;
