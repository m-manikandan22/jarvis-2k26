import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { adminApi } from '../services/adminApi';

import { Lock, User } from 'lucide-react';

function Login() {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.log('[ADMIN] Login action triggered');
    setLoading(true);
    setError('');

    try {
      console.log('[ADMIN] Calling adminApi.login...');
      const result = await adminApi.login(credentials.username, credentials.password);
      console.log('[ADMIN] Login response received:', result);

      if (result.status === 'success') {
        login(result.sessionToken);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('[ADMIN] Login catch block:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500">Please sign in to continue</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="admin-username"
              name="username"
              autoComplete="username"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              id="admin-password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
