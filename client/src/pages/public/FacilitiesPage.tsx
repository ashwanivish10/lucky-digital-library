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
    <div className="bg-[#f4f9fc] min-h-screen text-[#0b1d2e]">
      {/* Minimal Hero */}
      <section className="bg-[#0b1d2e] text-white pt-36 pb-20 relative overflow-hidden border-b border-[#13b8c8]/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#13b8c8_1px,transparent_1px),linear-gradient(to_bottom,#13b8c8_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#7ef9ff] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13b8c8] animate-pulse" />
            Study Environment
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-ui)] font-bold text-white mb-4 leading-tight">
            Our Facilities & Amenities
          </h1>
          <p className="max-w-xl mx-auto text-[#a0b3c6] text-sm sm:text-base leading-relaxed">
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
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#dce8f0] shadow-2xs hover:border-[#13b8c8]/60 hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0b1d2e] text-[#13b8c8] flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0b1d2e] leading-snug">
                    {facility.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475e75] leading-relaxed">
                    {facility.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Bottom CTA */}
        <div className="mt-14 pt-10 border-t border-[#dce8f0] text-center space-y-4">
          <p className="text-xs font-bold text-[#075a70] uppercase tracking-wider">
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
              className="btn btn-secondary text-xs py-2.5 px-6 rounded-xl border-[#dce8f0] text-[#0b1d2e]"
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
