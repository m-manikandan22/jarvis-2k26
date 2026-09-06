import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { ArrowLeft, User, GraduationCap, BookOpen, CreditCard, Loader2, Users } from 'lucide-react';

function RegistrationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionToken } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const result = await adminApi.getRegistrationDetails(sessionToken, id);

        if (result.status === 'success') {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch registration details.');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id, sessionToken]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-500">Loading details...</p>
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Registration Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Team Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Team ID</span>
                <span className="font-mono text-xs font-medium">{data.teamId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Team Name</span>
                <span className="font-medium">{data.teamName}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" /> Payment
            </h2>
            {data.payment ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold">₹{data.payment.amount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">UTR</span>
                  <span className="font-mono text-xs">{data.payment.utr}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    data.payment.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data.payment.status}
                  </span>
                </div>
                {data.payment.screenshotUrl && (
                  <a
                    href={data.payment.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 mt-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                  >
                    View Screenshot
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No payment record found.</p>
            )}
          </div>
        </div>

        {/* Members & Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" /> Team Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.members.map((m, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900">{m.fullName}</span>
                    {idx === 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold">Captain</span>}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {m.college}</p>
                    <p className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {m.department} | Year {m.year}</p>
                    <p className="flex items-center gap-1"><span>✉️</span> {m.email}</p>
                    <p className="flex items-center gap-1"><span>📞</span> {m.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" /> Registered Events
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-600">Event ID</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Session</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.events.map((e, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-700">{e.eventId}</td>
                      <td className="p-3 text-sm text-gray-600">{e.session.replace('_', ' ')}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(e.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationDetails;
