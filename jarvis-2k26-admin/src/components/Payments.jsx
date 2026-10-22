import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { Search, Loader2 } from 'lucide-react';

function Payments() {
  const { sessionToken } = useContext(AuthContext);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null); // stores email being verified

  useEffect(() => {
    fetchParticipants();
  }, [sessionToken]);

  async function fetchParticipants() {
    setLoading(true);
    try {
      const result = await adminApi.listParticipantPayments(sessionToken);
      if (result.status === 'success') {
        setParticipants(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch participants.');
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyByEmail = async (email) => {
    // First confirmation dialog with re‑entry of the email
    const confirmation = window.prompt('Please re‑enter the email address to confirm verification:', '');
    if (!confirmation) {
      alert('Verification cancelled.');
      return;
    }
    if (confirmation.trim().toLowerCase() !== email.trim().toLowerCase()) {
      alert('Email mismatch. Verification aborted.');
      return;
    }
    if (!window.confirm(`Verify payment for email ${email}?`)) return;

    setActionLoading(email);
    try {
      const result = await adminApi.verifyPaymentByEmail(sessionToken, email.trim());
      if (result.status === 'success') {
        alert('Payment verified successfully.');
        await fetchParticipants();
        setEmailToVerify('');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      // Show the underlying error message if available
      const msg = err?.message || 'Network error occurred while verifying payment.';
      alert(`Error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = participants.filter(p => {
    const matchesSearch =
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.teamId && p.teamId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-500">Loading participants...</p>
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search email, name, team..."
              className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
          </select>
          {/* Email verification input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Payer email to verify"
              className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
              value={emailToVerify}
              onChange={(e) => setEmailToVerify(e.target.value)}
            />
          </div>
          <button
            onClick={() => emailToVerify && handleVerifyByEmail(emailToVerify)}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Verify by Email
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-gray-600 text-sm">
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Full Name</th>
              <th className="p-4 font-semibold">Team</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <tr key={p.email} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm">{p.email}</td>
                  <td className="p-4">{p.fullName}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.teamName}</div>
                    {p.teamId && <div className="text-xs text-gray-500 font-mono">{p.teamId}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.paymentStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}> {p.paymentStatus} </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.paymentStatus === 'Pending' && (
                      <button
                        onClick={() => handleVerifyByEmail(p.email)}
                        disabled={actionLoading === p.email}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-500">No participants found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;

