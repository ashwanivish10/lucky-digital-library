import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Target, Compass, BookOpen, ShieldCheck, Heart, ArrowRight, Sparkles, CheckCircle2, Clock, Zap, Wifi } from 'lucide-react';
import { ISiteSettings } from '../../types/public';
import { settingsApi } from '../../lib/api';

import AboutStorySection from '../../components/public/AboutStorySection';

export const AboutPage: React.FC = () => {
  const context = useOutletContext<{ settings?: ISiteSettings }>();
  const [settings, setSettings] = useState<ISiteSettings | null>(context?.settings || null);

  useEffect(() => {
    if (!context?.settings) {
      settingsApi.getPublic()
        .then((res) => setSettings(res.data?.data?.settings || null))
        .catch(console.error);
    }
  }, [context]);

  const libraryName = settings?.libraryName || 'Lucky Digital Library';

  const defaultFacilities = [
    {
      icon: BookOpen,
      title: 'Academic Discipline',
      desc: 'Strict noise discipline and courteous environment overseen by attentive staff ensure an uninterrupted train of thought.',
    },
    {
      icon: ShieldCheck,
      title: 'Security & Integrity',
      desc: 'High-definition 24/7 CCTV surveillance and secure check-ins safeguard your personal belongings and peace of mind.',
    },
    {
      icon: Heart,
      title: 'Student-First Service',
      desc: 'Warm hospitality, clean hygienic washrooms, fresh purified RO drinking water, and responsive support whenever needed.',
    },
  ];

  return (
    <div className="bg-[#f4f9fc] min-h-screen text-[#0b1d2e]">
      {/* Hero: Solid navy bg (#0b1d2e) with grid overlay, centered content */}
      <section className="bg-[#0b1d2e] text-white pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#13b8c8]/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#13b8c8_1px,transparent_1px),linear-gradient(to_bottom,#13b8c8_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="section-eyebrow text-[#13b8c8] mb-3">Our Heritage & Ethos</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-ui)] font-bold text-white mb-6 leading-tight">
            About Us
          </h1>
          <p className="max-w-2xl mx-auto text-[#65788c] text-base sm:text-lg leading-relaxed font-normal">
            जहाँ एकाग्रता से सफलता की शुरुआत होती है। एक शांत, आधुनिक और अनुशासित अध्ययन स्थल।
          </p>
        </div>
      </section>

      {/* About Story & 9:16 Video Section */}
      <AboutStorySection />
    </div>
  );
};

export default AboutPage;
