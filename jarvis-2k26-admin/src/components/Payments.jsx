import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { Search, Loader2, XCircle, AlertCircle } from 'lucide-react';

function Payments() {
  const { sessionToken } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null); // stores paymentId of payment being processed or the string 'email' when verifying by email

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

  const handleVerifyByEmail = async () => {
    if (!emailToVerify) { alert('Please enter an email address to verify.'); return; }
    if (!window.confirm(`Verify payment for email ${emailToVerify}?`)) return;

    setActionLoading('email');
    try {
      const result = await adminApi.verifyPaymentByEmail(sessionToken, emailToVerify.trim());
      if (result.status === 'success') {
        alert('Payment verified successfully.');
        await fetchPayments();
        setEmailToVerify('');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Network error occurred while verifying payment by email.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendTicket = async (paymentId) => {
    if (!window.confirm('Send e‑ticket for this payment?')) return;
    setActionLoading(paymentId);
    try {
      const result = await adminApi.sendTicket(sessionToken, paymentId);
      if (result.status === 'success') {
        alert('E‑ticket sent successfully.');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Network error while sending e‑ticket.');
    } finally {
      setActionLoading(null);
    }
  };


  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm('Reject this payment?')) return;
    setActionLoading(paymentId);
    try {
      const result = await adminApi.rejectPayment(sessionToken, paymentId);
      if (result.status === 'success') {
        alert('Payment rejected.');
        await fetchPayments();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Network error while rejecting payment.');
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
            {/* Email verification */}
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
              onClick={handleVerifyByEmail}
              disabled={actionLoading === 'email'}
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
                        onClick={() => handleRejectPayment(p.paymentId)}
                       disabled={actionLoading === p.paymentId}
                       className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                       title="Reject Payment"
                     >
                       <XCircle className="w-4 h-4" />
                     </button>
                   </div>
                 ) : p.status === 'Verified' ? (
                   <button
                     onClick={() => handleSendTicket(p.paymentId)}
                     disabled={actionLoading === p.paymentId}
                     className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                     title="Send E‑Ticket"
                   >
                     <AlertCircle className="w-4 h-4" />
                   </button>
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
