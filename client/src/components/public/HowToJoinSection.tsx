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
    <section className="py-20 sm:py-24 relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.06),_transparent_25%),linear-gradient(180deg,#f4f2ee_0%,#fbfbfa_100%)] text-[#1c1917]">
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#d97706]/10 blur-[140px]"
      />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Section Header: ONLY heading as requested */}
        <div className="text-center max-w-xl mx-auto mb-14 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1c1917] tracking-tight"
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
                className="rounded-2xl p-6 sm:p-7 border border-[#e7e5e4] bg-white hover:border-[#d97706]/50 transition-all duration-300 shadow-[0_10px_25px_rgba(28,25,23,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#b45309] to-[#d97706] text-white flex items-center justify-center shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-[family-name:var(--font-ui)] text-2xl font-black text-[#d6d3d1] tracking-tight">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-ui)] text-xl font-bold text-[#1c1917] mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#78716c] leading-relaxed font-normal">
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
            className="btn btn-primary px-8 py-3.5 text-xs uppercase tracking-wider font-bold rounded-xl shadow-md inline-flex items-center gap-2 hover:scale-105 transition-transform"
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
