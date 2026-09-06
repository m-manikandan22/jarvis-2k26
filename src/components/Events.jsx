import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  Coins,
  MessageSquare,
  Terminal,
  Code2,
  Gamepad2,
  Gamepad,
  UserCheck,
  DoorOpen,
  Mic2,
  ArrowRight
} from 'lucide-react';
import { TECHNICAL_EVENTS, NON_TECHNICAL_EVENTS } from '../config/events.jsx';

const EventCard = ({ event, onOpen }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="glass-card p-6 group cursor-pointer relative overflow-hidden"
    onClick={() => onOpen(event)}
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
      {event.icon && React.cloneElement(event.icon, { className: 'w-20 h-20' })}
    </div>
    <div className={`p-3 rounded-xl w-fit mb-4 bg-white/5 text-neon-cyan group-hover:bg-neon-cyan group-hover:text-space-black transition-colors`}>
      {event.icon || <div className="w-6 h-6 bg-neon-cyan/20 rounded-sm" />}
    </div>
    <h3 className="text-xl font-futuristic font-bold text-white mb-1">{event.title}</h3>
    <p className="text-neon-blue text-sm font-medium mb-3">{event.subtitle}</p>
    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{event.hook}</p>
    <button className="text-xs font-bold uppercase tracking-widest text-neon-cyan group-hover:text-white transition-colors flex items-center gap-2">
      View Details <ArrowRight className="w-3 h-3" />
    </button>
  </motion.div>
);

const Events = ({ selectedEvent, setSelectedEvent }) => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-futuristic font-bold mb-4 neon-text-cyan"
          >
            The Events
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            From high-stakes technical battles to chaotic escape rooms, explore the diverse challenges awaiting you.
          </motion.p>
        </div>

        {/* Technical Events */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h3 className="text-2xl font-futuristic font-bold text-white uppercase tracking-widest">Technical Events</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TECHNICAL_EVENTS.map(event => (
              <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
            ))}
          </div>
        </div>

        {/* Non-Technical Events */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h3 className="text-2xl font-futuristic font-bold text-white uppercase tracking-widest">Non-Technical Events</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {NON_TECHNICAL_EVENTS.map(event => (
              <EventCard key={event.id} event={event} onOpen={setSelectedEvent} />
            ))}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-space-black/90 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl glass-card relative p-8 md:p-12 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 blur-3xl" />

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan">
                  {selectedEvent.icon || <div className="w-6 h-6 bg-neon-cyan/20 rounded-sm" />}
                </div>
                <div>
                  <h3 className="text-3xl font-futuristic font-bold text-white">{selectedEvent.title}</h3>
                  <p className="text-neon-blue font-medium">{selectedEvent.subtitle}</p>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-10">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {Object.entries(selectedEvent.placeholders).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-gray-500 block">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedEvent(null);
                  window.dispatchEvent(new CustomEvent('open-registration'));
                }}
                className="btn-primary w-full py-4 text-lg"
              >
                Register for this Event
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Events;
