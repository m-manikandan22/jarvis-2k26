import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = ({ activeSection, onNavClick, onRegisterClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Events', id: 'events' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-space-black/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavClick('home')}
        >
          <div className="relative w-10 h-10 group">
            <img
              src="/logo.png"
              alt="JARVIS 2K26 Logo"
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40?text=J';
              }}
            />
            <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-md group-hover:bg-neon-cyan/40 transition-all" />
          </div>
          <span className="font-futuristic font-bold text-xl tracking-tighter neon-text-cyan">
            JARVIS <span className="text-white">2K26</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavClick(link.id)}
                className={`text-sm font-medium transition-all relative py-2 ${
                  activeSection === link.id ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
                {activeSection === link.id && (
                  <motion.div
                    layoutId="navunderline"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan"
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={onRegisterClick}
            className="btn-primary text-sm px-5 py-2"
          >
            Register Now
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-space-dark border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavClick(link.id);
                    setIsOpen(false);
                  }}
                  className={`text-left text-lg font-medium ${
                    activeSection === link.id ? 'text-neon-cyan' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => {
                  onRegisterClick();
                  setIsOpen(false);
                }}
                className="btn-primary w-full text-center py-3"
              >
                Register Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
