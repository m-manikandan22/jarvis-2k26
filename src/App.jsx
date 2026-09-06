import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Highlights from './components/Highlights';
import Events from './components/Events';
import RegistrationForm from './components/RegistrationForm';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Handle scroll spy to update active section in navbar

  // Handle scroll spy to update active section in navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'events', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };

    const handleOpenRegister = () => {
      setIsRegisterOpen(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('open-registration', handleOpenRegister);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-registration', handleOpenRegister);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-space-black selection:bg-neon-cyan selection:text-space-black">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-cyan/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-glow-gradient opacity-50" />
      </div>

      <Navbar
        activeSection={activeSection}
        onNavClick={scrollToSection}
        onRegisterClick={() => setIsRegisterOpen(true)}
      />

      <main className="relative z-10">
        <section id="home">
          <Hero onRegisterClick={() => setIsRegisterOpen(true)} onExploreClick={() => scrollToSection('events')} />
        </section>

        <section id="about">
          <About />
        </section>

        <Highlights />

        <section id="events">
          <Events
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
          />
        </section>

        <div className="py-20 text-center bg-gradient-to-b from-transparent to-space-dark/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-futuristic font-bold mb-6 neon-text-cyan">Ready to Innovate?</h2>
            <p className="text-xl text-gray-400 mb-10">Seats are limited — secure your spot in the future of AI & Data Science today.</p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="btn-primary text-lg px-10 py-4"
            >
              Register Now
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {isRegisterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-space-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card p-6 md:p-10 relative"
            >
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <RegistrationForm
                onSuccess={() => setIsRegisterOpen(false)}
                setSelectedEvent={setSelectedEvent}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
