import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { ADMIN_GAS_URL } from '../config/adminGasConfig';
import { Users, UserCheck, Clock, AlertCircle } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { sessionToken } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(ADMIN_GAS_URL, {
          method: 'POST',
          body: JSON.stringify({
            requestType: 'getDashboardStats',
            sessionToken
          })
        });
        const result = await response.json();

        if (result.status === 'success') {
          setStats(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch dashboard stats.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [sessionToken]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={stats?.totalTeams || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Participants"
          value={stats?.totalMembers || 0}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Verified Payments"
          value={stats?.verifiedPayments || 0}
          icon={UserCheck}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments || 0}
          icon={AlertCircle}
          color="bg-orange-500"
        />
      </div>

      <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Insights</h2>
        <p className="text-gray-600">
          The dashboard provides a real-time snapshot of the current registration state.
          You can monitor payment verification progress and total participation counts across all events.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
