import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const links = [
  { name: 'ABOUT', id: 'about' }, { name: 'EVENTS', id: 'events' },
  { name: 'WORKSHOP', id: 'workshop' }, { name: 'PAPER', id: 'paper' },
  { name: 'SCHEDULE', id: 'schedule' }, { name: 'TEAM', id: 'team' },
];

const Navbar = ({ activeSection, onNavClick, onRegisterClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = id => { onNavClick(id); setIsOpen(false); };
  return <header className="site-header"><nav className="navbar" aria-label="Main navigation">
    <button className="brand-lockup" onClick={() => navigate('home')} aria-label="JARVIS 2026 home"><img src="/logo.svg" alt=""/><span><b>JARVIS</b><small>AI &amp; DS / PMC TECH</small></span></button>
    <div className="desktop-links">{links.map(link => <button key={link.id} className={activeSection === link.id ? 'nav-link active' : 'nav-link'} onClick={() => navigate(link.id)}>{link.name}</button>)}</div>
    <button className="nav-register" onClick={onRegisterClick}>REGISTER <ArrowUpRight size={16}/></button>
    <button className="mobile-menu-toggle" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X/> : <Menu/>}</button>
  </nav>
  {isOpen && <div className="mobile-nav">{links.map(link => <button key={link.id} onClick={() => navigate(link.id)}>{link.name}<ArrowUpRight size={16}/></button>)}<button onClick={() => { setIsOpen(false); onRegisterClick(); }}>REGISTER NOW<ArrowUpRight size={16}/></button></div>}
  </header>;
};

export default Navbar;
