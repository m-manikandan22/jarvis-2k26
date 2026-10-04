import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';
import { Search, Download, Loader2, Users } from 'lucide-react';

const EVENT_SCHEDULE = {
  'technova': 'TECHNOVA',
  'hackonomics': 'BRAINBID',
  'bytebattles': 'TECH CLASH',
  'aiwhisperer': 'PROMPT WARS',
  'coderelay': 'CODE RUSH',
  'cyberarena': 'ARENA X',
  'funfiesta': 'FUNFEST',
  'corporatequest': 'THE FINAL ROUND',
  'chaosroom': 'ESCAPE ROOM: CHAOS',
  'listenlink': 'LISTEN & WIN',
};

function EventParticipants() {
  const { sessionToken } = useContext(AuthContext);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  async function fetchParticipants() {
    if (!selectedEvent) return;
    setLoading(true);
    setError('');
    try {
      const result = await adminApi.getEventParticipants(sessionToken, selectedEvent);
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

  useEffect(() => {
    fetchParticipants();
  }, [selectedEvent, sessionToken]);

  const downloadCSV = () => {
    if (participants.length === 0) return;

    const headers = ['Full Name', 'Email', 'Phone', 'Team Name', 'Team ID', 'Session'];
    const rows = participants.map(p => [
      `"${p.fullName}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${p.teamName}"`,
      `"${p.teamId}"`,
      `"${p.session}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `participants_${selectedEvent}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = participants.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Event Participants</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search participants..."
              className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">Select an Event</option>
            {Object.entries(EVENT_SCHEDULE).map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>

          <button
            onClick={downloadCSV}
            disabled={participants.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Loading participants...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : !selectedEvent ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please select an event from the dropdown to view participants.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-600 text-sm">
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Team</th>
                <th className="p-4 font-semibold">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{p.fullName}</td>
                    <td className="p-4 text-sm text-gray-600">{p.email}</td>
                    <td className="p-4 text-sm text-gray-600">{p.phone}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">{p.teamName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{p.teamId}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {p.session.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">No participants found for this event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EventParticipants;
