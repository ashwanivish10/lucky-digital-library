import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Clock, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      
      // Check user role from localStorage to redirect properly
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === 'admin') {
          navigate('/admin');
          return;
        } else {
          navigate('/portal');
          return;
        }
      }
      navigate('/portal');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials or inactive account.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    toast('For password assistance, please visit the library reception or contact admin.', {
      icon: 'ℹ️',
      duration: 4000,
    });
  };

  return (
    <div className="grid min-h-screen bg-[#f4f9fc] lg:grid-cols-12">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#7ef9ff]/15 bg-[linear-gradient(145deg,#071521_0%,#0c2032_55%,#102b40_100%)] p-12 text-white lg:col-span-5 lg:flex">
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: 'radial-gradient(#7ef9ff 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-[#5dc4ff]/15 blur-[100px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#7ef9ff]/10 blur-[100px]" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7ef9ff]/25 bg-gradient-to-br from-[#dff9ff] via-[#7ef9ff] to-[#5dc4ff] text-2xl font-black text-[#071521] shadow-[0_8px_22px_rgba(93,196,255,0.25)] transition-transform group-hover:scale-105">
              L
            </div>
            <div>
              <span className="block font-[family-name:var(--font-ui)] text-lg font-black leading-tight tracking-[-0.045em] text-white">
                Lucky Digital Library
              </span>
              <span className="mt-1 block font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#7ef9ff]">
                Private Study Chambers
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10 max-w-sm">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7ef9ff]/25 bg-[#7ef9ff]/10 px-3 py-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.18em] text-[#dffaff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7ef9ff]" />
            Student & Scholar Portal
          </span>
          <p className="mb-10 font-[family-name:var(--font-ui)] text-3xl font-black leading-[1.08] tracking-[-0.055em] text-white sm:text-4xl">
            “Where serious scholars find their focus.”
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7ef9ff]/20 bg-[#7ef9ff]/10 text-[#7ef9ff]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Secure Portal</span>
                <span className="text-xs text-white/55">Encrypted scholar account gateway</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7ef9ff]/20 bg-[#7ef9ff]/10 text-[#7ef9ff]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">24/7 Access</span>
                <span className="text-xs text-white/55">Real-time membership & seat tracking</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#7ef9ff]/20 bg-[#7ef9ff]/10 text-[#7ef9ff]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Your Records</span>
                <span className="text-xs text-white/55">Verified receipts and membership tenure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/45">
          <span>Protected by 256-Bit TLS</span>
          <span className="flex items-center gap-1.5 font-medium text-[#7ef9ff]">
            Verified Academic Gateway
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top_right,rgba(93,196,255,0.08),transparent_35%),#f4f9fc] px-5 py-10 sm:px-12 sm:py-12 md:px-16 lg:col-span-7">
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="mb-2 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7ef9ff]/25 bg-gradient-to-br from-[#dff9ff] via-[#7ef9ff] to-[#5dc4ff] text-xl font-black text-[#071521] shadow-[0_8px_22px_rgba(93,196,255,0.25)]">
              L
            </div>
            <span className="font-[family-name:var(--font-ui)] text-lg font-black tracking-[-0.045em] text-[#0b1d2e]">
              Lucky Digital Library
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md rounded-[28px] border border-[#dce8f0] bg-white p-6 shadow-[0_24px_60px_rgba(9,31,49,0.09)] sm:p-8"
        >
          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e7faff] px-3 py-1 font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#087d99]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#13b8c8]" />
              Student portal
            </span>
            <h1 className="mb-2 font-[family-name:var(--font-ui)] text-3xl font-black leading-tight tracking-[-0.055em] text-[#0b1d2e] sm:text-4xl">
              Welcome Back
            </h1>
            <p className="text-sm text-[#65788c]">
              Sign in to your student portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#294055]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7b90a3]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="form-input rounded-xl border-[#d7e3ec] bg-[#f8fbfd] py-3 pl-10 pr-4 text-sm focus:border-[#25b8d0] focus:ring-4 focus:ring-[#25b8d0]/10"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="form-label block text-[11px] font-bold uppercase tracking-[0.12em] text-[#294055]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-[#087d99] transition-colors hover:text-[#075a70]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7b90a3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input rounded-xl border-[#d7e3ec] bg-[#f8fbfd] py-3 pl-10 pr-10 text-sm focus:border-[#25b8d0] focus:ring-4 focus:ring-[#25b8d0]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#7b90a3] transition-colors hover:text-[#087d99]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary mt-2 w-full justify-center rounded-xl py-3.5 text-sm shadow-[0_12px_28px_rgba(93,196,255,0.24)]"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#e6eef3] pt-6 text-center text-xs text-[#65788c]">
            New student?{' '}
            <Link to="/register" className="font-bold text-[#087d99] underline underline-offset-2 transition-colors hover:text-[#075a70]">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
