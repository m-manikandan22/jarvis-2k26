import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GAS_CONFIG } from '../config/gasConfig';
import { BarChart, Users, Activity } from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use VITE_GAS_ADMIN_KEY from env variables
        const adminKey = import.meta.env.VITE_GAS_ADMIN_KEY;
        if (!adminKey) {
          throw new Error('Admin key not configured in environment variables.');
        }

        const res = await fetch(`${GAS_CONFIG.webAppUrl}?key=${adminKey}`);
        const data = await res.json();

        if (data.status === 'success') {
          setStats(data);
        } else {
          setError(data.errors?.general || 'Failed to fetch statistics.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Loading stats...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  return (
    <div className="min-h-screen bg-space-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-12">
          <BarChart className="w-10 h-10 text-neon-cyan" />
          <h1 className="text-4xl font-futuristic font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <Users className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="text-gray-400 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold">{stats.totalRegistrations}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <Activity className="w-8 h-8 text-neon-blue" />
            <div>
              <p className="text-gray-400 text-sm">Active Events</p>
              <p className="text-3xl font-bold">{Object.keys(stats.perEvent).length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-futuristic font-bold mb-6">Event Headcounts</h2>
          {Object.entries(stats.perEvent).sort(([, a], [, b]) => b - a).map(([event, count]) => (
            <div key={event} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{event}</span>
                <span className="text-neon-cyan font-mono">{count}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.totalRegistrations) * 100}%` }}
                  className="h-full bg-neon-cyan shadow-neon-cyan"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminStats;
