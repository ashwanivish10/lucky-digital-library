import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { IMembershipPlan } from '../../types/public';
import { settingsApi } from '../../lib/api';
import { formatINR } from '../../lib/utils';

export const MembershipPage: React.FC = () => {
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi
      .getPublic()
      .then((res) => {
        if (res.data?.data) {
          setPlans(res.data.data.plans || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching membership data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#fbfbfa] min-h-screen text-[#1c1917]">
      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#e7e5e4]">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
            Transparent Tiers
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-4 leading-tight">
            Membership Plans
          </h1>
          <p className="max-w-xl mx-auto text-[#78716c] text-sm sm:text-base leading-relaxed">
            Select the membership plan tailored to your study schedule. All tiers include full access to our silent zones, power charging, and high-speed Wi-Fi.
          </p>
        </div>
      </section>

      {/* Membership Plans Grid */}
      <section className="py-16 sm:py-24 w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border border-[#e7e5e4] animate-pulse shadow-xs" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#e7e5e4] p-8 max-w-md mx-auto shadow-sm">
            <HelpCircle className="w-12 h-12 text-[#d97706] mx-auto mb-4" />
            <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-2">Plans Available Soon</h3>
            <p className="text-sm text-[#78716c] mb-6 font-normal">
              Please contact our administrative desk for current membership availability and registration.
            </p>
            <Link to="/contact" className="btn btn-primary text-xs uppercase tracking-wider font-bold">Contact Desk</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plans.length === 1;
              return (
                <div
                  key={plan._id}
                  className={`relative flex flex-col rounded-2xl bg-white p-7 sm:p-9 transition-all duration-300 ${
                    isPopular
                      ? 'border-2 border-[#d97706] shadow-xl lg:-translate-y-2 ring-2 ring-[#d97706]/20'
                      : 'border border-[#e7e5e4] shadow-[0_10px_25px_rgba(28,25,23,0.04)] hover:shadow-md hover:border-[#d97706]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm flex items-center gap-1 font-[family-name:var(--font-ui)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-1.5">{plan.name}</h3>
                    <p className="text-xs uppercase font-semibold text-[#78716c] tracking-wider font-[family-name:var(--font-ui)]">
                      Tenure: {plan.durationValue} {plan.durationUnit}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-[#e7e5e4]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917]">
                        {formatINR(plan.baseFee)}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-[#78716c] font-medium font-[family-name:var(--font-ui)]">
                        / {plan.durationValue} {plan.durationUnit}
                      </span>
                    </div>
                    {plan.registrationFee > 0 && (
                      <p className="text-xs text-[#78716c] mt-2 font-normal">
                        + One-time Registration: {formatINR(plan.registrationFee)}
                      </p>
                    )}
                  </div>

                  {/* Included Benefits */}
                  <div className="flex-1 space-y-3.5 mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1c1917] font-[family-name:var(--font-ui)]">
                      Included Privileges:
                    </p>
                    {plan.benefits.map((benefit, bIndex) => (
                      <div key={bIndex} className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 bg-[#15803d]/10 text-[#15803d] shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-[#292524]">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {plan.terms && (
                    <p className="text-xs text-[#a8a29e] italic mb-6 border-t border-[#e7e5e4] pt-3">
                      * {plan.terms}
                    </p>
                  )}

                  <Link
                    to="/contact"
                    className={`btn w-full justify-center text-center py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider ${
                      isPopular ? 'btn-primary shadow-md' : 'btn-secondary'
                    }`}
                  >
                    <span>Enquire & Visit Reception</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MembershipPage;
