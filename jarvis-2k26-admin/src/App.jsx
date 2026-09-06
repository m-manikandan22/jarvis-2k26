import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RegistrationsList from './components/RegistrationsList';
import RegistrationDetails from './components/RegistrationDetails';
import Payments from './components/Payments';
import EventParticipants from './components/EventParticipants';
import Navbar from './components/Navbar';

export const AuthContext = createContext(null);

function App() {
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('admin_token'));

  const login = (token) => {
    localStorage.setItem('admin_token', token);
    setSessionToken(token);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setSessionToken(null);
  };

  return (
    <AuthContext.Provider value={{ sessionToken, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {sessionToken && <Navbar />}
          <main className="p-4 md:p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/login" element={!sessionToken ? <Login /> : <Navigate to="/" />} />
              <Route path="/" element={sessionToken ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/registrations" element={sessionToken ? <RegistrationsList /> : <Navigate to="/login" />} />
              <Route path="/payments" element={sessionToken ? <Payments /> : <Navigate to="/login" />} />
              <Route path="/events" element={sessionToken ? <EventParticipants /> : <Navigate to="/login" />} />
              <Route path="/registration/:id" element={sessionToken ? <RegistrationDetails /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
