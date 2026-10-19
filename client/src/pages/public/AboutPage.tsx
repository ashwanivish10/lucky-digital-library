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

  return (
    <div className="bg-[#fbfbfa] min-h-screen text-[#1c1917]">
      {/* Hero: Warm Ivory & Sandstone bg (#f5f3ef) with grid overlay, centered content */}
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#e7e5e4]">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] mb-4 shadow-xs">
            Our Heritage & Ethos
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-6 leading-tight">
            About Us
          </h1>
          <p className="max-w-2xl mx-auto text-[#78716c] text-base sm:text-lg leading-relaxed font-normal">
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
