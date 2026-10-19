import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  VolumeX,
  Wifi,
  Zap,
  Armchair,
  Wind,
  Coffee,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ISiteSettings } from '../../types/public';
import { settingsApi } from '../../lib/api';

interface MinimalFacility {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

const MINIMAL_FACILITIES: MinimalFacility[] = [
  {
    icon: VolumeX,
    title: 'Pin-Drop Silence Zone',
    desc: 'A strictly monitored quiet environment engineered for deep concentration.',
  },
  {
    icon: Armchair,
    title: 'Ergonomic Study Cabins',
    desc: 'Partitioned personal workstations with comfortable high-back chairs.',
  },
  {
    icon: Wifi,
    title: 'High-Speed Fiber Wi-Fi',
    desc: 'Enterprise dual-band optical fiber connectivity for online lectures and research.',
  },
  {
    icon: Zap,
    title: 'Personal Power Sockets',
    desc: 'Dedicated 220V power outlets and charging ports at every desk.',
  },
  {
    icon: Wind,
    title: 'Air Conditioned Comfort',
    desc: 'Quiet climate control maintaining an optimal, fresh study temperature.',
  },
  {
    icon: Coffee,
    title: 'Pure RO Drinking Water',
    desc: 'Chilled and normal temperature purified drinking water available all day.',
  },
  {
    icon: ShieldCheck,
    title: '24/7 CCTV & Security',
    desc: 'Continuous surveillance and monitored premises for student safety.',
  },
  {
    icon: Clock,
    title: '24×7 Round-The-Clock Access',
    desc: 'Open 24 hours a day, all 7 days a week (Monday to Sunday) all year round.',
  },
];

export const FacilitiesPage: React.FC = () => {
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

  return (
    <div className="bg-[#fbfbfa] min-h-screen text-[#1c1917]">
      {/* Minimal Hero */}
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#e7e5e4]">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
            Study Environment
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-4 leading-tight">
            Our Facilities & Amenities
          </h1>
          <p className="max-w-xl mx-auto text-[#78716c] text-sm sm:text-base leading-relaxed">
            Essential study amenities at {libraryName}, calibrated for uninterrupted focus and academic achievement.
          </p>
        </div>
      </section>

      {/* Minimal Facilities Grid */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {MINIMAL_FACILITIES.map((facility, idx) => {
            const Icon = facility.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e7e5e4] shadow-[0_10px_25px_rgba(28,25,23,0.04)] hover:border-[#d97706]/60 hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0 shadow-xs ring-1 ring-[#f59e0b]/30">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#1c1917] leading-snug">
                    {facility.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
                    {facility.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Bottom CTA */}
        <div className="mt-14 pt-10 border-t border-[#e7e5e4] text-center space-y-4">
          <p className="text-xs font-bold text-[#b45309] uppercase tracking-wider">
            Lucky Digital Library — Where focus builds the foundation of success.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="btn btn-primary text-xs py-2.5 px-6 rounded-xl font-bold shadow-sm"
            >
              <span>Visit Reception / Contact</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link
              to="/contact"
              className="btn btn-secondary text-xs py-2.5 px-6 rounded-xl border-[#e7e5e4] text-[#1c1917]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitiesPage;
