import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

export const SetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.setFirstPassword(newPassword);
      updateUser({ requiresPasswordChange: false });
      toast.success('Your new password is set! Welcome to your dashboard.');
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(93,196,255,0.12),transparent_40%),#faf6f0] px-4 pt-8 pb-24 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[28px] border border-[#e8dcc8] bg-white p-7 shadow-[0_24px_60px_rgba(9,31,49,0.1)] sm:p-9"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8d5a8]/40 bg-gradient-to-br from-[#071521] via-[#0c2032] to-[#14324a] text-[#e8d5a8] shadow-[0_8px_20px_rgba(93,196,255,0.2)]">
            <KeyRound className="h-7 w-7" />
          </div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f5ead4] px-3 py-1 font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#a38b52]">
            <ShieldCheck className="h-3 w-3 text-[#c2a66e]" />
            First-Time Account Activation
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-ui)] text-2xl font-black tracking-[-0.04em] text-[#2c1f0e] sm:text-3xl">
            Set Your New Password
          </h1>
          <p className="mt-2 text-xs text-[#8a7a60] sm:text-sm">
            Hello <span className="font-semibold text-[#2c1f0e]">{user?.name || 'Scholar'}</span>, please create a secure personal password to protect your library account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#294055]">
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-[#d7e3ec] bg-[#f8fbfd] py-3 pl-10 pr-11 text-base sm:text-sm text-[#2c1f0e] placeholder-[#a0b3c6] transition-all focus:border-[#25b8d0] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#25b8d0]/10 min-h-[48px] sm:min-h-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 min-w-[44px] min-h-[44px] text-[#7b90a3] hover:text-[#a38b52]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#294055]">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full rounded-xl border border-[#d7e3ec] bg-[#f8fbfd] py-3 pl-10 pr-11 text-base sm:text-sm text-[#2c1f0e] placeholder-[#a0b3c6] transition-all focus:border-[#25b8d0] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#25b8d0]/10 min-h-[48px] sm:min-h-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 min-w-[44px] min-h-[44px] text-[#7b90a3] hover:text-[#a38b52]"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2edf3] bg-[#f7fafc] p-3 text-xs text-[#52667a]">
            <p className="flex items-center gap-1.5 font-semibold text-[#2c1f0e]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c2a66e]" />
              Account Security Rules:
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11px] text-[#8a7a60]">
              <li>Minimum 6 characters long</li>
              <li>You can use this new password for all future logins</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary mt-2 w-full justify-center rounded-xl py-3.5 min-h-[48px] text-sm shadow-[0_12px_28px_rgba(93,196,255,0.24)]"
          >
            {isSubmitting ? (
              <span>Saving Password...</span>
            ) : (
              <>
                <span>Save Password & Enter Portal</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SetPasswordPage;
