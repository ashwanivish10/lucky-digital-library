import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Armchair,
  ArrowRight,
  UserCheck,
  PhoneCall,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-[85vh] bg-[radial-gradient(circle_at_top_right,rgba(93,196,255,0.1),transparent_40%),#f4f9fc] px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl rounded-3xl border border-[#dce8f0] bg-white p-7 sm:p-10 shadow-[0_24px_60px_rgba(9,31,49,0.08)] text-[#0b1d2e]"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7ef9ff]/40 bg-gradient-to-br from-[#071521] via-[#0c2032] to-[#122e44] text-[#7ef9ff] shadow-[0_12px_24px_rgba(93,196,255,0.2)]">
            <UserCheck className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7faff] px-3.5 py-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#087d99] mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-[#13b8c8]" />
            In-Person Admissions
          </span>

          <h1 className="font-[family-name:var(--font-ui)] text-2xl sm:text-3xl font-black tracking-[-0.04em] text-[#0b1d2e]">
            Online Self-Registration is Closed
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#65788c] max-w-lg mx-auto leading-relaxed">
            To guarantee personalized seat allocation, custom shift timings, and instant printed receipts, all student enrollments are handled directly at the library reception.
          </p>
        </div>

        {/* 3 Step Walk-in Guide */}
        <div className="rounded-2xl border border-[#e2edf3] bg-[#f8fbfd] p-5 sm:p-6 mb-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#087d99]">
            How to Enroll at Lucky Digital Library
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-[#e2edf3] bg-white p-3.5 space-y-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e7faff] text-[#087d99] font-bold">
                1
              </div>
              <div className="font-bold text-[#0b1d2e] flex items-center gap-1">
                <MapPin size={13} className="text-[#13b8c8]" />
                Visit Reception
              </div>
              <p className="text-[#65788c] text-[11px] leading-relaxed">
                Walk in to our library reception counter during study hours.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2edf3] bg-white p-3.5 space-y-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e7faff] text-[#087d99] font-bold">
                2
              </div>
              <div className="font-bold text-[#0b1d2e] flex items-center gap-1">
                <Armchair size={13} className="text-[#13b8c8]" />
                Pick Seat & Shift
              </div>
              <p className="text-[#65788c] text-[11px] leading-relaxed">
                Choose your favorite desk (1–58) and custom from/to shift timings.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2edf3] bg-white p-3.5 space-y-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e7faff] text-[#087d99] font-bold">
                3
              </div>
              <div className="font-bold text-[#0b1d2e] flex items-center gap-1">
                <Clock size={13} className="text-[#13b8c8]" />
                Instant Admission
              </div>
              <p className="text-[#65788c] text-[11px] leading-relaxed">
                Pay fee (Cash/UPI), receive printed receipt & start studying!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/contact"
            className="btn btn-primary w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl py-3 px-6 text-sm font-bold shadow-md hover:shadow-lg"
          >
            <PhoneCall size={16} />
            <span>Contact Reception Desk</span>
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl border border-[#cfdce6] bg-white py-3 px-6 text-sm font-bold text-[#294055] hover:bg-[#f1f7fa] hover:text-[#087d99] transition-colors"
          >
            <LogIn size={16} />
            <span>Already Enrolled? Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
