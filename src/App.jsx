import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import About from './components/About';
import Events from './components/Events';
import RegistrationForm from './components/RegistrationForm';
import Footer from './components/Footer';
import { Workshop, PaperPresentation, Coordinators, Registration } from './components/ProgramSections';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

const App = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Scroll & section observer logic
  useEffect(() => {
    const sections = ['home', 'about', 'events', 'workshop', 'paper', 'team', 'register'];
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.2, 0.5, 1] }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const handleOpenRegister = () => setIsRegisterOpen(true);
    window.addEventListener('open-registration', handleOpenRegister);
    return () => {
      observer.disconnect();
      window.removeEventListener('open-registration', handleOpenRegister);
    };
  }, []);

  // Modal body scroll lock and escape handling
  useEffect(() => {
    if (!isRegisterOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEsc = e => { if (e.key === 'Escape') setIsRegisterOpen(false); };
    window.addEventListener('keydown', closeOnEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', closeOnEsc);
    };
  }, [isRegisterOpen]);

  const scrollToSection = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const openRegistration = () => setIsRegisterOpen(true);

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell">
        <Navbar activeSection={activeSection} onNavClick={scrollToSection} onRegisterClick={openRegistration} />
        <main className="relative z-10">
          <section id="home">
            <Hero onRegisterClick={openRegistration} onExploreClick={() => scrollToSection('events')} />
          </section>
          <Countdown />
          <About />
          <Events selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} setIsRegisterOpen={setIsRegisterOpen} />
          <Workshop />
          <PaperPresentation onRegisterClick={openRegistration} />
          <Coordinators />
          <Registration onRegisterClick={openRegistration} />
        </main>
        <Footer />
        <AnimatePresence>
          {isRegisterOpen && (
            <motion.div
              className="registration-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={() => setIsRegisterOpen(false)}
            >
              <motion.div
                className="registration-modal"
                role="dialog"
                aria-modal="true"
                aria-label="JARVIS symposium registration"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                onMouseDown={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="registration-modal-close"
                  aria-label="Close registration"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  ×
                </button>
                <RegistrationForm onSuccess={() => setIsRegisterOpen(false)} setSelectedEvent={setSelectedEvent} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default App;
