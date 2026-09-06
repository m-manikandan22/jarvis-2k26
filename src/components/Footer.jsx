import React from "react";
import { Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-space-dark pt-20 pb-10 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-neon-blue/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JARVIS 2K26 Logo" className="w-10 h-10 object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/40?text=J"; }} />
            <span className="font-futuristic font-bold text-xl neon-text-cyan">
              JARVIS <span className="text-white">2K26</span>
            </span>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            The flagship technical symposium of the AI & Data Science department, dedicated to fostering innovation, competition, and learning.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-3 rounded-full bg-white/5 text-gray-400 hover:text-neon-cyan hover:bg-white/10 transition-all"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="p-3 rounded-full bg-white/5 text-gray-400 hover:text-neon-blue hover:bg-white/10 transition-all"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-futuristic font-bold text-white uppercase tracking-widest">Quick Navigation</h4>
          <ul className="space-y-4 text-gray-400">
            <li><a href="#home" className="hover:text-neon-cyan transition-colors">Home</a></li>
            <li><a href="#about" className="hover:text-neon-cyan transition-colors">About Us</a></li>
            <li><a href="#events" className="hover:text-neon-cyan transition-colors">All Events</a></li>
            <li><a href="#contact" className="hover:text-neon-cyan transition-colors">Contact Support</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-futuristic font-bold text-white uppercase tracking-widest">Get In Touch</h4>
          <div className="space-y-4 text-gray-400">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-neon-cyan"><Mail className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm text-white">contact@jarvis2k26.com [edit me]</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-neon-blue"><Phone className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="text-sm text-white">+91 98765 43210 [edit me]</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white"><span className="text-xs font-bold">LOC</span></div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Venue</p>
                <p className="text-sm text-white">Er. Perumal Manimekalai College of Engineering</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
        <p className="text-xs text-gray-500">© 2026 Department of Artificial Intelligence and Data Science, Er. Perumal Manimekalai College of Engineering. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
