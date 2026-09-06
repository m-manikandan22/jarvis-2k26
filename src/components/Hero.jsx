import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = ({ onRegisterClick, onExploreClick }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] animate-bounce" style={{ animationDuration: '8s' }} />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 relative inline-block"
        >
          <img
            src="/logo.png"
            alt="JARVIS 2K26 Logo"
            className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto relative z-10"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150?text=JARVIS+LOGO';
            }}
          />
          <div className="absolute inset-0 rounded-full bg-neon-cyan/30 blur-3xl animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-futuristic font-black mb-4 tracking-tighter">
            <span className="block neon-text-cyan">JARVIS 2K26</span>
            <span className="text-white opacity-90 text-3xl md:text-5xl font-sans font-light italic">
              "Where Intelligence Meets Innovation"
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto font-light">
            Organized by the <span className="text-white font-medium">Department of Artificial Intelligence and Data Science</span>,
            <br className="hidden md:block" />
            Er. Perumal Manimekalai College of Engineering.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button
            onClick={onRegisterClick}
            className="btn-primary group flex items-center gap-2 text-lg px-10 py-4 w-full sm:w-auto"
          >
            Register Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreClick}
            className="btn-secondary flex items-center gap-2 text-lg px-10 py-4 w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5" />
            Explore Events
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-neon-cyan to-transparent animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
