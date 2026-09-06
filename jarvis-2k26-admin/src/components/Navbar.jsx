import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { LayoutDashboard, Users, LogOut, CreditCard } from 'lucide-react';

function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          JARVIS <span className="text-yellow-400">ADMIN</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/registrations" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Users className="w-4 h-4" /> Registrations
          </Link>
          <Link to="/events" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Users className="w-4 h-4" /> Events
          </Link>
          <Link to="/payments" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <CreditCard className="w-4 h-4" /> Payments
          </Link>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </nav>
  );
}

export default Navbar;
