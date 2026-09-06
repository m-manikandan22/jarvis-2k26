import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Users, FileCheck } from 'lucide-react';

const Highlights = () => {
  const highlights = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "10+ Diverse Events",
      desc: "Across Technical & Non-Technical tracks for every skill set.",
      color: "text-neon-cyan",
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Certified Learning",
      desc: "Certificates for all participants to boost your portfolio.",
      color: "text-neon-blue",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Exciting Cash Prizes",
      desc: "Rewarding the most innovative and skilled winners.",
      color: "text-neon-violet",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Open Invitation",
      desc: "Open to students from all departments and colleges.",
      color: "text-white",
    },
  ];

  return (
    <div className="py-12 px-6 bg-space-dark/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {highlights.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className={`p-3 rounded-xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div>
              <h4 className="font-futuristic font-bold text-white text-sm uppercase tracking-wider">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Highlights;
