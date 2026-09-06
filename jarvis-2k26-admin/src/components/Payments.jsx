import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { Search, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function Payments() {
  const { sessionToken } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null); // stores paymentId of payment being processed

  useEffect(() => {
    fetchPayments();
  }, [sessionToken]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const result = await adminApi.getPayments(sessionToken);

      if (result.status === 'success') {
        setPayments(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch payments.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (paymentId, action) => {
    const actionText = action === 'verifyPayment' ? 'verify' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} this payment?`)) return;

    setActionLoading(paymentId);
    try {
      const result = action === 'verifyPayment'
        ? await adminApi.verifyPayment(sessionToken, paymentId)
        : await adminApi.rejectPayment(sessionToken, paymentId);

      if (result.status === 'success') {
        alert(`Payment ${actionText}ed successfully.`);
        await fetchPayments();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Network error occurred while updating payment status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = payments.filter(p => {
    const matchesSearch =
      p.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teamId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.utr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
      <p className="text-gray-500">Loading payments...</p>
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
              placeholder="Search Team, ID or UTR..."
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
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-gray-600 text-sm">
              <th className="p-4 font-semibold">Team</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">UTR Reference</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Submitted</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.teamName}</div>
                    <div className="text-xs text-gray-500 font-mono">{p.teamId}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">₹{p.amount}</td>
                  <td className="p-4 font-mono text-xs text-gray-600">{p.utr}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {p.paidAt ? new Date(p.paidAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStatusChange(p.paymentId, 'verifyPayment')}
                          disabled={actionLoading === p.paymentId}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          title="Verify Payment"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(p.paymentId, 'rejectPayment')}
                          disabled={actionLoading === p.paymentId}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Reject Payment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Processed {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : ''}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">No payments found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;
