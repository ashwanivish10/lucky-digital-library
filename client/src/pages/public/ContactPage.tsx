import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { settingsApi } from '../../lib/api';
import FormSteps from '../../components/admin/FormSteps';
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
    <div className="bg-[#fbfbfa] min-h-screen text-[#1c1917]">
      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#e7e5e4]">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
            Contact & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-4 leading-tight">
            Send Us a Message
          </h1>
          <p className="max-w-lg mx-auto text-[#78716c] text-sm sm:text-base leading-relaxed">
            Have questions about admission, seat reservation, or study shifts? Fill in your details below and our team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* Centered Send Us a Message Form Card */}
      <section className="py-14 sm:py-20 pb-24 sm:pb-20 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-5 sm:p-10 border border-[#e7e5e4] shadow-[0_10px_25px_rgba(28,25,23,0.04)]">
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            <FormSteps
              steps={['Your details', 'Message']}
              canContinue={(index) => {
                if (index === 0 && !form.name.trim()) {
                  toast.error('Please enter your name.');
                  return false;
                }
                return true;
              }}
              footer={
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3.5 min-h-[48px] justify-center text-sm font-bold shadow-md rounded-xl"
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
              }
            >
            <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c1917] mb-2 font-[family-name:var(--font-ui)]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#e7e5e4] bg-[#fbfbfa] text-[#1c1917] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-colors text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c1917] mb-2 font-[family-name:var(--font-ui)]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#e7e5e4] bg-[#fbfbfa] text-[#1c1917] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-colors text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c1917] mb-2 font-[family-name:var(--font-ui)]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="amit@example.com"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#e7e5e4] bg-[#fbfbfa] text-[#1c1917] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-colors text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c1917] mb-2 font-[family-name:var(--font-ui)]">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Seat Availability Inquiry"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#e7e5e4] bg-[#fbfbfa] text-[#1c1917] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-colors text-base sm:text-sm"
                />
              </div>
            </div>
            </div>

            <div className="space-y-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1c1917] mb-2 font-[family-name:var(--font-ui)]">
                Message / Question *
              </label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Provide details about your study shift, exam preparation, or any specific requirements..."
                className="w-full px-4 py-3 min-h-[120px] rounded-xl border border-[#e7e5e4] bg-[#fbfbfa] text-[#1c1917] focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-colors text-base sm:text-sm"
              />
            </div>
            </FormSteps>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
