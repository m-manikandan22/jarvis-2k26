import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDownRight } from 'lucide-react';
import heroWorkstation from '../Assests/Retro 1980s Computer Workstation.png';

const Hero = ({ onRegisterClick, onExploreClick }) => (
  <section className="hero blueprint" aria-labelledby="hero-title">
    <div className="hero-meta mono"><span>PMC TECH <i> / </i> AI &amp; DS</span><span>23 OCT 2026 <b>● SYSTEM ACTIVE</b></span></div>
    <div className="hero-layout">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
        <p className="eyebrow mono"><span className="eyebrow-index">SYS_01</span> RETRO AI LABORATORY × TECH SYMPOSIUM</p>
        <h1 id="hero-title"><span>JARVIS</span><small>SYMPOSIUM</small><em>2026</em></h1>
        <p className="hero-theme">AI FOR A BETTER TOMORROW<span className="orange-rule" /></p>
        <p className="hero-description">A meeting ground for ideas, intelligence, and the people building what comes next.</p>
        <div className="hero-fee-tag mono" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#fff', opacity: 0.9, letterSpacing: '1px' }}>
          REGISTRATION FEE: <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>₹200 PER HEAD</span>
        </div>
        <div className="hero-actions">
          <button className="button button-primary" onClick={onRegisterClick}>REGISTER NOW <ArrowRight size={18} /></button>
          <button className="button button-outline" onClick={onExploreClick}>EXPLORE EVENTS <ArrowDownRight size={18} /></button>
        </div>
      </motion.div>
      <motion.div className="hero-art" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .15 }}>
        <img className="hero-image" src={heroWorkstation} alt="Retro computer workstation with monitor, keyboard, and headphones" />
      </motion.div>
    </div>
    <div className="hero-bottom mono"><span>EXPLORE <b>•</b> IDEATE <b>•</b> COMPETE <b>•</b> CELEBRATE</span><span>HOSUR, TAMIL NADU <i>↘</i></span></div>
  </section>
);

export default Hero;
