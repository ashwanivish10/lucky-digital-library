import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { settingsApi } from '../../lib/api';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Please enter your name and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsApi.submitContact(form);
      toast.success('Your message was delivered! We will respond promptly.');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f9fc] min-h-screen text-[#0b1d2e]">
      {/* Hero */}
      <section className="bg-[#0b1d2e] text-white pt-36 pb-20 relative overflow-hidden border-b border-[#13b8c8]/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#13b8c8_1px,transparent_1px),linear-gradient(to_bottom,#13b8c8_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#7ef9ff] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13b8c8] animate-pulse" />
            Contact & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-ui)] font-bold text-white mb-4 leading-tight">
            Send Us a Message
          </h1>
          <p className="max-w-lg mx-auto text-[#a0b3c6] text-sm sm:text-base leading-relaxed">
            Have questions about admission, seat reservation, or study shifts? Fill in your details below and our team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* Centered Send Us a Message Form Card */}
      <section className="py-14 sm:py-20 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#dce8f0] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b1d2e] mb-2 font-[family-name:var(--font-ui)]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/50 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-1 focus:ring-[#13b8c8] transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b1d2e] mb-2 font-[family-name:var(--font-ui)]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/50 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-1 focus:ring-[#13b8c8] transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b1d2e] mb-2 font-[family-name:var(--font-ui)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="amit@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/50 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-1 focus:ring-[#13b8c8] transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b1d2e] mb-2 font-[family-name:var(--font-ui)]">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Seat Availability Inquiry"
                  className="w-full px-4 py-3 rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/50 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-1 focus:ring-[#13b8c8] transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#0b1d2e] mb-2 font-[family-name:var(--font-ui)]">
                Message / Question *
              </label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Provide details about your study shift, exam preparation, or any specific requirements..."
                className="w-full px-4 py-3 rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/50 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] focus:ring-1 focus:ring-[#13b8c8] transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3.5 justify-center text-sm font-bold shadow-md rounded-xl"
            >
              {isSubmitting ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
