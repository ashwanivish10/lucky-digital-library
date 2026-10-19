import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
  Wifi,
  Armchair,
  MapPin,
  Star,
  X,
  Send,
  MessageCircle,
  Phone,
  ExternalLink,
  Zap,
  Clock,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { ISiteSettings, IMembershipPlan, ITestimonial } from '../../types/public';
import { DynamicIcon } from '../../components/public/DynamicIcon';
import { SeatMap } from '../../components/common/SeatMap';
import AboutStorySection from '../../components/public/AboutStorySection';
import HowToJoinSection from '../../components/public/HowToJoinSection';
import AchieversShowcase from '../../components/public/AchieversShowcase';

const defaultFacilities = [
  { icon: 'wifi', title: 'High-speed optical Wi-Fi', description: 'Reliable dual-band fiber internet for focused study sessions and exams.', isVisible: true, order: 1 },
  { icon: 'silent', title: 'Quiet study environment', description: 'Comfortable, distraction-free desks with disciplined library flow.', isVisible: true, order: 2 },
  { icon: 'ac', title: 'Air-conditioned comfort', description: 'Cool, fresh interiors for long hours of focus throughout the year.', isVisible: true, order: 3 },
  { icon: 'plug', title: 'Power & lighting', description: 'Dedicated charging points and warm reading lights at every desk.', isVisible: true, order: 4 },
  { icon: 'coffee', title: 'Pantry & hydration', description: 'Clean water stations and a relaxed recharge area for short breaks.', isVisible: true, order: 5 },
  { icon: 'shield', title: 'Secure monitored space', description: 'Protected premises with monitored access and essential safety checks.', isVisible: true, order: 6 },
];

const defaultReviews: ITestimonial[] = [
  { _id: 'default-1', name: 'Riya S.', role: 'UPSC aspirant', rating: 5, text: 'The silence here is amazing. I can focus for hours without distraction and the Wi-Fi is very reliable.', source: 'google', isVisible: true },
  { _id: 'default-2', name: 'Aman K.', role: 'CA student', rating: 5, text: 'Very clean, peaceful, and productive environment. The desk setup and AC make long study hours comfortable.', source: 'manual', isVisible: true },
  { _id: 'default-3', name: 'Neha P.', role: 'Railway exam prep', rating: 5, text: 'I loved the disciplined environment and the supportive atmosphere. It feels professional and motivating.', source: 'google', isVisible: true },
  { _id: 'default-4', name: 'Vikas T.', role: 'B.Com student', rating: 5, text: 'The space is beautifully organized and the staff are helpful. Great place for serious study sessions.', source: 'manual', isVisible: true },
];

export const HomePage: React.FC = () => {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialsList, setTestimonialsList] = useState<ITestimonial[]>([]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    name: '',
    role: '',
    rating: 5,
    text: '',
  });

  useEffect(() => {
    settingsApi
      .getPublic()
      .then((res) => {
        if (res.data?.data) {
          setSettings(res.data.data.settings);
          setPlans(res.data.data.plans || []);
          if (res.data.data.settings?.testimonials) {
            setTestimonialsList(res.data.data.settings.testimonials);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching public settings on home page:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.name.trim() || !newReviewForm.text.trim()) {
      toast.error('Please enter your name and review.');
      return;
    }

    setSubmittingReview(true);

    try {
      const res = await settingsApi.submitReview(newReviewForm);
      toast.success(res.data?.message || 'Thank you! Your review is now live.');

      if (res.data?.data) {
        setTestimonialsList((prev) => [res.data.data, ...prev]);
      }

      setReviewModalOpen(false);
      setNewReviewForm({ name: '', role: '', rating: 5, text: '' });
      window.open(mapLink, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const libraryName = settings?.libraryName || 'Lucky Digital Library';
  const tagline = settings?.tagline || 'Your Space to Focus. Your Place to Grow.';
  const facilities = settings?.facilities && settings.facilities.length > 0
    ? settings.facilities.filter((f) => f.isVisible)
    : defaultFacilities;
  const phone = settings?.phone || '+91 98765 43210';
  const whatsapp = settings?.whatsapp || phone;
  const address = settings?.address || 'Lucky Digital Library, Beside Central Hospital , Block Bazar, Prayagraj, Uttar Pradesh - 211008';
  const mapLink = settings?.mapLink || 'https://maps.app.goo.gl/AaCd93WYde8cYnx79';

  const reviewPool = useMemo(() => (testimonialsList.length ? testimonialsList : defaultReviews), [testimonialsList]);
  const marqueeReviews = useMemo(() => [...reviewPool, ...reviewPool], [reviewPool]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f9fc]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#13b8c8] border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
          <p className="font-[family-name:var(--font-ui)] tracking-widest text-[#0b1d2e] uppercase text-xs font-semibold">
            Opening {libraryName}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-x-clip bg-[#fbfbfa] text-[#1c1917]">
      {/* ========================================================= */}
      {/* 1. WARM IVORY & SANDSTONE EDITORIAL HERO SECTION            */}
      {/* ========================================================= */}
      <section className="relative min-h-[90vh] bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(120,53,15,0.06),_transparent_28%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] flex items-center overflow-hidden border-b border-[#e7e5e4] py-16 sm:py-24">
        {/* Soft warmth glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-10%] right-[-8%] w-[680px] h-[680px] rounded-full blur-[140px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.18) 0%, transparent 65%)' }}
        />

        {/* Clean editorial grid */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="grid items-center gap-12 lg:gap-16 lg:grid-cols-12">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Eyebrow Pill */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] mb-6 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Best Library In MauAima • Prayagraj</span>
              </motion.div>

              {/* Commanding Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="font-[family-name:var(--font-ui)] text-4xl sm:text-5xl lg:text-6xl xl:text-[5.2rem] font-black tracking-[-0.05em] text-[#1c1917] leading-[0.95] mb-6"
              >
                Your study flow,
                <br />
                <span className="text-gold-gradient font-black">elevated</span>.
              </motion.h1>

              {/* Sub-deck Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="text-base sm:text-lg text-[#57534e] leading-relaxed max-w-2xl font-normal mb-8"
              >
                {settings?.description ||
                  'Engineered exclusively for competitive aspirants and serious scholars. 58 dedicated ergonomic cabins, pin-drop silent atmosphere, dual-band optical fiber, and 24×7 round-the-clock access all 7 days in Prayagraj.'}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="flex flex-col items-stretch gap-3 mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
              >
                <Link
                  to="/membership"
                  className="btn btn-primary flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] shadow-md transition-all sm:w-auto"
                >
                  <span>Explore Membership</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/facilities"
                  className="btn flex w-full items-center justify-center gap-2 rounded-full border border-[#d6d3d1] bg-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#292524] shadow-xs transition-all hover:border-[#d97706] hover:bg-[#fef3c7]/30 sm:w-auto"
                >
                  <Armchair className="w-4 h-4 text-[#d97706]" />
                  <span>View 58-Desk Layout</span>
                </Link>
              </motion.div>

              {/* Social Proof Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="flex items-center gap-3 text-xs text-[#78716c] flex-wrap"
              >
                <div className="flex items-center text-[#d97706]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-[#292524]">4.9 / 5.0 Rating on Google Maps</span>
                <span className="text-[#d6d3d1] hidden sm:inline">•</span>
                <span className="text-[#57534e] hidden sm:inline">200+ Enrolled Scholars</span>
              </motion.div>
            </div>

            {/* Right Column: Achievers Showcase (5 cols) */}
            <div className="lg:col-span-5">
              <AchieversShowcase />
            </div>
          </div>

          {/* Bottom Prestige Metrics Ribbon */}
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-[#e7e5e4] pt-10 text-center md:grid-cols-4 md:divide-x md:divide-[#e7e5e4] md:divide-y-0">
            <div className="pt-3 md:pt-0">
              <div className="font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.05em] text-[#1c1917] sm:text-4xl">58 Desks</div>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#b45309]">
                Acoustic Cabins
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.05em] text-[#1c1917] sm:text-4xl">200+</div>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#b45309]">
                Enrolled Scholars
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.05em] text-[#1c1917] sm:text-4xl">24×7</div>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#b45309]">
                Open 24 Hours • All 7 Days
              </p>
            </div>
            <div className="pt-3 md:pt-0">
              <div className="font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.05em] text-[#1c1917] sm:text-4xl">4.9 ★</div>
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#b45309]">
                Google Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FACILITY HIGHLIGHTS                                     */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(93,196,255,0.12),_transparent_25%),linear-gradient(180deg,#0b1624_0%,#091725_100%)] py-20 text-white">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-10 text-center">
            <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.22em] text-[#7ef9ff]">Built for focus</p>
            <h2 className="mt-2 font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl">Everything serious students need</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {facilities.slice(0, 6).map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_36px_rgba(2,8,17,0.24)] backdrop-blur-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7ef9ff]/10 text-[#7ef9ff] ring-1 ring-[#7ef9ff]/20">
                  <DynamicIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div className="mb-2 text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-[0.22em] text-[#a9d9ff]">0{idx + 1}</div>
                <h3 className="font-[family-name:var(--font-ui)] text-xl font-bold tracking-[-0.04em] text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2.5 ABOUT LUCKY DIGITAL LIBRARY & 9:16 VIDEO SHOWCASE     */}
      {/* ========================================================= */}
      <AboutStorySection />

      {/* ========================================================= */}
      {/* 3. INTERACTIVE 58-SEAT SANCTUARY PREVIEW                  */}
      {/* ========================================================= */}
      <section className="border-y border-white/10 bg-[#091827] py-20 text-white">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-8 text-center">
            <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.22em] text-[#7ef9ff]">Seat map</p>
            <h2 className="mt-2 font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl">A quiet workspace you can actually use</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b1828] p-4 shadow-[0_18px_38px_rgba(2,8,17,0.34)]">
            <SeatMap interactive={true} showControls={true} compact={false} />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MEMBERSHIP PLANS                                       */}
      {/* ========================================================= */}
      <section className="bg-[radial-gradient(circle_at_top,_rgba(126,249,255,0.08),_transparent_18%),linear-gradient(180deg,#f4f8ff_0%,#edf5ff_100%)] py-20">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-10 text-center">
            <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.22em] text-[#0f6ea5]">Membership</p>
            <h2 className="mt-2 font-[family-name:var(--font-ui)] text-3xl font-black tracking-[-0.06em] text-[#0d1d30] sm:text-4xl">Simple plans for every study goal</h2>
          </div>

          {plans.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-[#d7e7f7] bg-white p-8 text-center shadow-[0_18px_38px_rgba(15,29,48,0.08)]">
              <p className="text-sm leading-relaxed text-[#51657a]">Contact our reception to enquire about current membership options and seat availability.</p>
              <Link to="/contact" className="btn btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-wider font-bold">Ask about plans</Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan, idx) => {
                const isFeatured = idx === 1 || plans.length === 1;

                return (
                  <div
                    key={plan._id}
                    className={`relative flex flex-col justify-between rounded-3xl p-7 ${isFeatured ? 'border border-[#7ef9ff]/30 bg-[#091827] text-white shadow-[0_22px_48px_rgba(9,24,39,0.28)]' : 'border border-[#d7e7f7] bg-white text-[#0d1d30] shadow-[0_16px_36px_rgba(15,29,48,0.08)]'}`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7ef9ff] via-[#5dc4ff] to-[#7f8cff] px-3 py-1 text-[9px] font-[family-name:var(--font-ui)] font-bold uppercase tracking-[0.2em] text-[#071521]">
                        Most chosen
                      </div>
                    )}

                    <div>
                      <h3 className="font-[family-name:var(--font-ui)] text-2xl font-black tracking-[-0.05em]">{plan.name}</h3>
                      <div className="mt-5 flex items-baseline gap-2">
                        <span className="font-[family-name:var(--font-ui)] text-4xl font-black tracking-[-0.05em]">{formatINR(plan.baseFee)}</span>
                        <span className={`text-[10px] uppercase tracking-[0.18em] ${isFeatured ? 'text-white/60' : 'text-[#5d7288]'}`}>
                          / {plan.durationValue} {plan.durationUnit}
                        </span>
                      </div>

                      {plan.registrationFee > 0 && (
                        <p className={`mt-3 text-xs ${isFeatured ? 'text-white/70' : 'text-[#5d7288]'}`}>One-time registration fee: {formatINR(plan.registrationFee)}</p>
                      )}

                      <ul className="mt-6 space-y-3">
                        {plan.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className={`flex items-start gap-2 text-sm ${isFeatured ? 'text-white/85' : 'text-[#1c2d3f]'}`}>
                            <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${isFeatured ? 'bg-[#7ef9ff]/15 text-[#7ef9ff]' : 'bg-[#1A5C3B]/10 text-[#1A5C3B]'}`}>
                              <Check className="h-3 w-3 stroke-[2.5]" />
                            </div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to="/membership"
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs uppercase tracking-wider font-bold ${isFeatured ? 'btn btn-primary' : 'btn btn-secondary'}`}
                    >
                      <span>Choose plan</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. HOW TO JOIN THE LIBRARY (Animated Interactive Steps)   */}
      {/* ========================================================= */}
      <HowToJoinSection />

      {/* ========================================================= */}
      {/* 8. SCHOLAR REVIEWS & GOOGLE FEEDBACK                      */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#f4f9fc] text-[#0b1d2e] border-t border-[#dce8f0] relative">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13b8c8]/15 border border-[#13b8c8]/35 text-[#075a70] font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-current text-[#13b8c8]" />
                <span>4.9 / 5.0 Rating on Google Maps</span>
              </div>
              <h2 className="section-title text-3xl sm:text-4xl md:text-5xl text-[#0b1d2e] mt-1">
                What Our Scholars Say
              </h2>
              <div className="w-14 h-0.5 bg-[#13b8c8] mt-4 rounded-full" />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="btn btn-primary px-5 py-2.5 text-xs uppercase tracking-wider font-bold shadow-sm inline-flex items-center gap-2"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Write a Review</span>
              </button>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-5 py-2.5 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2"
              >
                <span>Google Maps Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="marquee-shell rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-sm">
            <div className="marquee-track">
              {marqueeReviews.map((t, idx) => (
                <article
                  key={`${t._id || 'review'}-${idx}`}
                  className="marquee-card flex h-full min-h-[220px] flex-col justify-between"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-[#13b8c8]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${t._id || 'review'}-${starIndex}`}
                          className={`h-4 w-4 ${starIndex < (t.rating || 5) ? 'fill-current text-[#13b8c8]' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#1A5C3B]/10 px-2 py-1 text-[9px] font-[family-name:var(--font-ui)] uppercase tracking-[0.18em] text-[#1A5C3B]">
                      {t.source === 'google' ? 'Google' : 'Student'}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[#0b1d2e]/80 italic">“{t.text}”</p>

                  <div className="mt-6 border-t border-[#dce8f0] pt-4">
                    <h4 className="font-[family-name:var(--font-ui)] text-lg font-bold text-[#0b1d2e]">{t.name}</h4>
                    {t.role && <p className="text-xs text-[#65788c]">{t.role}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Write a Review */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl border border-[#dce8f0] bg-white p-7 shadow-2xl">
              <button type="button" onClick={() => setReviewModalOpen(false)} className="absolute right-5 top-5 text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.22em] text-[#13b8c8]">Share your experience</p>
                <h3 className="mt-2 font-[family-name:var(--font-ui)] text-2xl font-bold text-[#0b1d2e]">Submit a review</h3>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-[0.18em] text-[#0b1d2e]">Your name *</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.name}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, name: e.target.value })}
                    className="w-full rounded-lg border border-[#dce8f0] px-4 py-2.5 text-sm focus:border-[#13b8c8] focus:outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-[0.18em] text-[#0b1d2e]">Role / exam</label>
                  <input
                    type="text"
                    value={newReviewForm.role}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, role: e.target.value })}
                    className="w-full rounded-lg border border-[#dce8f0] px-4 py-2.5 text-sm focus:border-[#13b8c8] focus:outline-none"
                    placeholder="e.g. UPSC aspirant"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-[0.18em] text-[#0b1d2e]">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })} className="p-1">
                        <Star className={`h-6 w-6 ${star <= newReviewForm.rating ? 'fill-current text-[#13b8c8]' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-[#0b1d2e]">{newReviewForm.rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-[family-name:var(--font-ui)] uppercase tracking-[0.18em] text-[#0b1d2e]">Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewForm.text}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, text: e.target.value })}
                    className="w-full rounded-lg border border-[#dce8f0] px-4 py-2.5 text-sm focus:border-[#13b8c8] focus:outline-none"
                    placeholder="Tell us about your experience at the library..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-secondary px-5 py-2 text-xs uppercase tracking-wider font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingReview} className="btn btn-primary px-6 py-2 text-xs uppercase tracking-wider font-bold">
                    {submittingReview ? 'Publishing...' : <><Send className="h-3.5 w-3.5" /><span>Publish</span></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 9. INTERACTIVE GOOGLE MAP & LOCATION                      */}
      {/* ========================================================= */}
      <section className="border-t border-[#dce8f0] bg-[#edf4f8] py-20">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="font-[family-name:var(--font-ui)] text-[10px] uppercase tracking-[0.22em] text-[#13b8c8]">Visit us</p>
              <h2 className="mt-2 font-[family-name:var(--font-ui)] text-3xl font-bold text-[#0b1d2e] sm:text-4xl">Find your study routine in the heart of Mauaima.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5F6F7D]">{address}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-5 py-3 text-xs uppercase tracking-wider font-bold">
                  <MapPin className="h-4 w-4" />
                  <span>Get directions</span>
                </a>
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary px-5 py-3 text-xs uppercase tracking-wider font-semibold">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#13b8c8]/20 bg-white p-5 shadow-sm">
              <div className="overflow-hidden rounded-xl border border-[#dce8f0]">
                <iframe
                  title="Lucky Digital Library Google Maps"
                  src="https://maps.google.com/maps?q=25.6952462,81.9050274(Lucky+Digital+Library)&hl=en&z=17&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
