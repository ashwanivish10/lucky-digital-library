import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  FileText,
  Armchair,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Choose Plan & Shift',
    description: 'Select your preferred study timing and membership duration.',
    icon: Layers,
  },
  {
    number: '02',
    title: 'Submit Registration',
    description: 'Fill out our quick online registration form in under 2 minutes.',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Seat Allocation',
    description: 'Get your dedicated personal study desk and workstation assigned.',
    icon: Armchair,
  },
  {
    number: '04',
    title: 'Begin Studying',
    description: 'Enjoy high-speed Wi-Fi, air conditioning, and peaceful silence.',
    icon: Sparkles,
  },
];

export const HowToJoinSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#0b1624] via-[#08121d] to-[#040a12] text-white">
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#13b8c8]/10 blur-[140px]"
      />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header: ONLY heading as requested */}
        <div className="text-center max-w-xl mx-auto mb-14 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight"
          >
            How To Join The Library
          </motion.h2>
        </div>

        {/* 4 Clean, Smooth Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6 sm:p-7 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#13b8c8]/50 transition-all duration-300 shadow-[0_8px_24px_rgba(2,8,17,0.3)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#087d99] to-[#13b8c8] text-[#040e17] flex items-center justify-center shadow-[0_0_20px_rgba(19,184,200,0.35)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-[family-name:var(--font-ui)] text-2xl font-black text-white/30 tracking-tight">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-ui)] text-xl font-bold text-white mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-sm text-white/65 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Clean, Simple CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            to="/contact"
            className="btn btn-primary px-8 py-3.5 text-xs uppercase tracking-wider font-bold rounded-xl shadow-lg inline-flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <span>Enquire & Visit Us</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToJoinSection;
