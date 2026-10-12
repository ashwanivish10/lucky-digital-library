import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { studentsApi } from '../../lib/api';
import toast from 'react-hot-toast';
import { WEEK_DAYS } from '../../types/public';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    message: '',
    seatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    seatStartTime: '06:00',
    seatEndTime: '14:00',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick day presets
  const handleSelectAllDays = () => {
    setForm(prev => ({ ...prev, seatDays: [...WEEK_DAYS] }));
  };

  const handleSelectWeekdays = () => {
    setForm(prev => ({
      ...prev,
      seatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }));
  };

  const handleSelectWeekends = () => {
    setForm(prev => ({
      ...prev,
      seatDays: ['Saturday', 'Sunday'],
    }));
  };

  const handleToggleDay = (day: string) => {
    setForm(prev => {
      const exists = prev.seatDays.includes(day);
      return {
        ...prev,
        seatDays: exists
          ? prev.seatDays.filter(d => d !== day)
          : [...prev.seatDays, day],
      };
    });
  };

  // Duration calculation
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const diff = endMins - startMins;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (mins === 0) return `${hours} hrs`;
    return `${hours} hrs ${mins} mins`;
  };

  const durationText = calculateDuration(form.seatStartTime, form.seatEndTime);

  const handleCopyCode = async () => {
    if (!registeredCode) return;
    try {
      await navigator.clipboard.writeText(registeredCode);
      setCopiedCode(true);
      toast.success('Provisional ID copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      toast.error('Failed to copy ID');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (form.phone.trim().length < 10) {
      toast.error('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match. Please verify your password.');
      return;
    }

    if (form.seatDays.length === 0) {
      toast.error('Please select at least one study day for your preferred schedule.');
      return;
    }

    if (form.seatStartTime >= form.seatEndTime) {
      toast.error('Your preferred slot end time must be after the start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await studentsApi.register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        address: form.address.trim(),
        password: form.password,
        message: form.message.trim(),
        seatDays: form.seatDays,
        seatStartTime: form.seatStartTime,
        seatEndTime: form.seatEndTime,
      });

      const studentCode = res.data?.data?.studentCode || 'LDL-PENDING';
      setRegisteredCode(studentCode);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f9fc] min-h-screen text-[#0b1d2e] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#13b8c8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full bg-[#13b8c8]/5 blur-[120px]"
      />

      <div className="max-w-4xl mx-auto relative z-10">

        {registeredCode ? (
          /* ================= SUCCESS STATE ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#dce8f0] shadow-xl p-6 sm:p-10 text-center"
          >
            {/* Status Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1A5C3B]/10 to-[#1A5C3B]/20 text-[#1A5C3B] border border-[#1A5C3B]/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#087d99] bg-[#e7faff] px-3.5 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#13b8c8]" />
              Application Submitted Successfully
            </span>

            <h1 className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl text-[#0b1d2e] mb-3 tracking-tight">
              Welcome to the Scholar Queue
            </h1>

            <p className="text-sm sm:text-base text-[#65788c] max-w-lg mx-auto mb-8 leading-relaxed">
              Your application has been logged into our admissions ledger. Our administration
              is reviewing your seat schedule preferences.
            </p>

            {/* Provisional ID Card */}
            <div className="bg-gradient-to-br from-[#f8fbfd] to-[#edf4f8] rounded-2xl p-6 border border-[#dce8f0] text-left mb-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#65788c]">
                  Provisional Student ID
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  Verification Pending
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap mt-1">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#0b1d2e] tracking-wider">
                  {registeredCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="btn btn-secondary text-xs py-2 px-3.5 gap-1.5 bg-white border-[#dce8f0] hover:border-[#13b8c8] text-[#0b1d2e]"
                >
                  {copiedCode ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-[#1A5C3B]" />
                      <span className="text-[#1A5C3B] font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#65788c]" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#dce8f0] grid sm:grid-cols-2 gap-3 text-xs text-[#65788c]">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#828C99]">
                    Registered Name
                  </span>
                  <span className="font-semibold text-[#0b1d2e]">{form.name}</span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-semibold text-[#828C99]">
                    Preferred Slot
                  </span>
                  <span className="font-semibold text-[#0b1d2e]">
                    {form.seatStartTime} – {form.seatEndTime} ({form.seatDays.length} days/wk)
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Roadmap */}
            <div className="text-left mb-8 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1d2e] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#087d99]" />
                What happens next?
              </h3>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#f4f9fc] border border-[#dce8f0]">
                  <span className="w-5 h-5 rounded-full bg-[#13b8c8]/20 text-[#075a70] font-bold flex items-center justify-center text-[10px] mb-2">
                    1
                  </span>
                  <div className="font-bold text-[#0b1d2e] mb-1">Slot Validation</div>
                  <p className="text-[#65788c] text-[11px] leading-relaxed">
                    Librarian cross-checks your requested slot against active desk allocations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f4f9fc] border border-[#dce8f0]">
                  <span className="w-5 h-5 rounded-full bg-[#13b8c8]/20 text-[#075a70] font-bold flex items-center justify-center text-[10px] mb-2">
                    2
                  </span>
                  <div className="font-bold text-[#0b1d2e] mb-1">Desk Assignment</div>
                  <p className="text-[#65788c] text-[11px] leading-relaxed">
                    You'll be contacted via Phone/WhatsApp to confirm your seat number and fee tier.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f4f9fc] border border-[#dce8f0]">
                  <span className="w-5 h-5 rounded-full bg-[#13b8c8]/20 text-[#075a70] font-bold flex items-center justify-center text-[10px] mb-2">
                    3
                  </span>
                  <div className="font-bold text-[#0b1d2e] mb-1">Portal Access</div>
                  <p className="text-[#65788c] text-[11px] leading-relaxed">
                    Log in using your registered credentials to download digital fee receipts.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/login" className="btn btn-primary py-3 px-6 text-sm font-bold shadow-md">
                <span>Access Student Login</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/" className="btn btn-secondary py-3 px-6 text-sm border-[#dce8f0]">
                Return to Homepage
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ================= CLEAN CENTERED REGISTRATION FORM ================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            {/* Header Text */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl text-[#0b1d2e] tracking-tight mb-2">
                Student Registration
              </h1>
              <p className="text-sm text-[#65788c] max-w-md mx-auto">
                Enter your details and preferred study schedule to create your student account.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl border border-[#dce8f0] shadow-xl p-6 sm:p-9 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* SECTION 1: Personal & Contact */}
                <div>
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#dce8f0]">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0b1d2e] text-white text-[11px] font-bold">
                      1
                    </span>
                    <h2 className="text-sm font-bold text-[#0b1d2e] uppercase tracking-wider">
                      Scholar Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Full Legal Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0b1d2e] mb-1.5">
                        Full Legal Name <span className="text-[#8B1A1A]">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Aditi Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone & Email side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0b1d2e] mb-1.5">
                          Phone / WhatsApp <span className="text-[#8B1A1A]">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="e.g. 9876543210"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0b1d2e] mb-1.5">
                          Email Address <span className="text-[#8B1A1A]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="aditi@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Portal Security */}
                <div>
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#dce8f0]">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0b1d2e] text-white text-[11px] font-bold">
                      2
                    </span>
                    <h2 className="text-sm font-bold text-[#0b1d2e] uppercase tracking-wider">
                      Student Portal Credentials
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#0b1d2e]">
                          Password <span className="text-[#8B1A1A]">*</span>
                        </label>
                        <span className="text-[10px] text-[#65788c]">Min 8 characters</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828C99] hover:text-[#0b1d2e] p-1 transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#0b1d2e]">
                          Confirm Password <span className="text-[#8B1A1A]">*</span>
                        </label>
                        {form.confirmPassword && form.password === form.confirmPassword && (
                          <span className="text-[10px] text-[#1A5C3B] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Match
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828C99] hover:text-[#0b1d2e] p-1 transition-colors"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Preferred Study Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#dce8f0] flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0b1d2e] text-white text-[11px] font-bold">
                        3
                      </span>
                      <h2 className="text-sm font-bold text-[#0b1d2e] uppercase tracking-wider">
                        Study Schedule & Slot Preference
                      </h2>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllDays}
                        className="px-2.5 py-1 rounded-md bg-[#edf4f8] text-[#0b1d2e] hover:bg-[#dce8f0] font-medium text-[11px] transition-colors"
                      >
                        All 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectWeekdays}
                        className="px-2.5 py-1 rounded-md bg-[#edf4f8] text-[#0b1d2e] hover:bg-[#dce8f0] font-medium text-[11px] transition-colors"
                      >
                        Mon–Fri
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectWeekends}
                        className="px-2.5 py-1 rounded-md bg-[#edf4f8] text-[#0b1d2e] hover:bg-[#dce8f0] font-medium text-[11px] transition-colors"
                      >
                        Weekends
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#f8fbfd] rounded-2xl border border-[#dce8f0] p-4 sm:p-5 space-y-4">
                    {/* Days Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[#0b1d2e] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#087d99]" />
                          Weekly Attendance Days <span className="text-[#8B1A1A]">*</span>
                        </label>
                        <span className="text-[11px] text-[#65788c] font-medium">
                          {form.seatDays.length} day{form.seatDays.length === 1 ? '' : 's'} selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {WEEK_DAYS.map((day) => {
                          const isSelected = form.seatDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => handleToggleDay(day)}
                              className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#0b1d2e] text-white border-[#0b1d2e] shadow-sm'
                                  : 'bg-white text-[#65788c] border-[#dce8f0] hover:border-[#13b8c8]/50 hover:text-[#0b1d2e]'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-[#13b8c8]" />}
                              <span>{day.slice(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Inputs */}
                    <div className="pt-2 border-t border-[#dce8f0]">
                      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                        <label className="text-xs font-semibold text-[#0b1d2e] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#087d99]" />
                          Daily Shift Timings <span className="text-[#8B1A1A]">*</span>
                        </label>
                        {durationText && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e7faff] text-[#075a70] border border-[#13b8c8]/30">
                            ⏱️ Slot Span: {durationText}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[11px] font-medium text-[#65788c] mb-1">
                            Shift Start Time
                          </span>
                          <input
                            type="time"
                            required
                            value={form.seatStartTime}
                            onChange={(e) => setForm({ ...form, seatStartTime: e.target.value })}
                            className="w-full px-3.5 py-2 bg-white border border-[#dce8f0] rounded-xl text-sm font-semibold text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                          />
                        </div>

                        <div>
                          <span className="block text-[11px] font-medium text-[#65788c] mb-1">
                            Shift End Time
                          </span>
                          <input
                            type="time"
                            required
                            value={form.seatEndTime}
                            onChange={(e) => setForm({ ...form, seatEndTime: e.target.value })}
                            className="w-full px-3.5 py-2 bg-white border border-[#dce8f0] rounded-xl text-sm font-semibold text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                          />
                        </div>
                      </div>

                      <p className="mt-2 text-[11px] text-[#65788c] leading-relaxed">
                        Library operational hours: 06:00 AM to 10:00 PM. Desks can be shared by scholars attending non-overlapping shifts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Address & Academic Profile */}
                <div>
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#dce8f0]">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0b1d2e] text-white text-[11px] font-bold">
                      4
                    </span>
                    <h2 className="text-sm font-bold text-[#0b1d2e] uppercase tracking-wider">
                      Academic Target & Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Address */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0b1d2e] mb-1.5">
                        Residential / Hostel Address{' '}
                        <span className="text-[11px] font-normal text-[#65788c]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#828C99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="e.g. Katra / Civil Lines / Salori, Prayagraj"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Target Exam / Message */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0b1d2e] mb-1.5">
                        Target Examination / Special Request{' '}
                        <span className="text-[11px] font-normal text-[#65788c]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-[#828C99] absolute left-3.5 top-3.5 pointer-events-none" />
                        <textarea
                          rows={2}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="e.g. UPSC CSE / UPPSC / Judiciary / NEET aspirant. Prefer quiet corner or ground floor desk."
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dce8f0] rounded-xl text-sm text-[#0b1d2e] placeholder-[#828C99] focus:outline-none focus:border-[#13b8c8] focus:ring-2 focus:ring-[#13b8c8]/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms agreement note */}
                <div className="p-3.5 rounded-xl bg-[#edf4f8] text-xs text-[#65788c] leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#087d99] shrink-0 mt-0.5" />
                  <span>
                    By submitting this application, you agree to maintain complete silence, respect study hall hygiene, and adhere to library code of conduct.
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-3.5 justify-center text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0b1d2e] border-t-transparent rounded-full animate-spin" />
                      Submitting Admission Application...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Submit Application & Generate Student ID</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Link to login */}
                <div className="pt-2 text-center text-xs text-[#65788c]">
                  Already have an approved membership?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-[#087d99] hover:text-[#0b1d2e] underline underline-offset-2 transition-colors ml-1"
                  >
                    Sign in to student portal
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
