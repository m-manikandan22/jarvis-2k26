import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Zap } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-futuristic font-bold mb-8 neon-text-cyan">
              Redefining the <br />
              <span className="text-white">Technical Frontier</span>
            </h2>

            <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
              <p>
                At the <span className="text-white font-medium">Department of Artificial Intelligence and Data Science</span> of
                Er. Perumal Manimekalai College of Engineering, we aren't just teaching code; we're shaping the architects of tomorrow.
                Our mission is to push students beyond the textbook and into the realm of real-world innovation, where machine learning,
                neural networks, and big data converge to solve the impossible.
              </p>

              <p>
                <span className="text-neon-cyan font-semibold">JARVIS 2K26</span> is our way of bringing that energy to the wider student community.
                It's a flagship symposium designed as a playground for curiosity. Whether you're a seasoned coder, a data wizard, or
                someone who just loves a good technical challenge, JARVIS is where you come to compete, learn, and showcase your skills.
              </p>

              <p>
                We built this platform to make your experience seamless. No more digging through confusing PDFs or chasing coordinators
                on WhatsApp. From discovering event rules to securing your spot, everything is centralized right here. One click,
                instant confirmation, and you're in.
              </p>
            </div>
          </motion.div>

          {/* Right Side: Futuristic Visuals */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 hover:border-neon-cyan transition-colors group">
                <div className="p-3 rounded-xl bg-neon-blue/20 text-neon-blue group-hover:scale-110 transition-transform">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="font-futuristic font-bold text-white">AI First</h3>
                <p className="text-sm text-gray-400">Pushing the boundaries of generative and predictive models.</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 mt-8 hover:border-neon-cyan transition-colors group">
                <div className="p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-futuristic font-bold text-white">Global Scale</h3>
                <p className="text-sm text-gray-400">Designing systems that handle millions of data points.</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 hover:border-neon-cyan transition-colors group">
                <div className="p-3 rounded-xl bg-neon-violet/20 text-neon-violet group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-futuristic font-bold text-white">Fast Innovation</h3>
                <p className="text-sm text-gray-400">Rapid prototyping from concept to deployment.</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 mt-8 hover:border-neon-cyan transition-colors group">
                <div className="p-3 rounded-xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">2K26</span>
                </div>
                <h3 className="font-futuristic font-bold text-white">The Vision</h3>
                <p className="text-sm text-gray-400">A legacy of excellence in technical education.</p>
              </div>
            </div>

            {/* Ambient glow behind cards */}
            <div className="absolute inset-0 -z-10 bg-neon-blue/20 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
