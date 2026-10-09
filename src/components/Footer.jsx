import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => <footer id="contact" className="site-footer">
  <div className="footer-inner">
    <div className="footer-main"><div><p className="footer-wordmark">JARVIS<span>{' 2026'}</span></p><p className="footer-theme mono">AI FOR A BETTER TOMORROW</p></div><div className="footer-address"><p className="mono">DEPARTMENT OF<br/>ARTIFICIAL INTELLIGENCE<br/>AND DATA SCIENCE ENGINEERING</p><p>ER. PERUMAL MANIMEKALAI<br/>COLLEGE OF ENGINEERING<br/>KONERIPALLI, HOSUR — 635 117</p></div><a className="footer-top mono" href="#home">BACK TO TOP <ArrowUpRight size={16}/></a></div>
    <div className="footer-bottom mono"><span>© 2026 JARVIS SYMPOSIUM</span><span>PMC TECH <i> / </i> MADE FOR WHAT'S NEXT</span></div>
  </div>
</footer>;

export default Footer;
