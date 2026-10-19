import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { ISiteSettings } from '../../types/public';

export const RulesPage: React.FC = () => {
  const { settings } = useOutletContext<{ settings?: ISiteSettings | null }>();
  const rules = (settings?.rules || []).map((rule) => rule.trim()).filter(Boolean);
  const libraryName = settings?.libraryName || 'Lucky Digital Library';

  return (
    <div className="bg-[#f4f9fc] min-h-screen text-[#0b1d2e]">
      <section className="bg-[#0b1d2e] text-white pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#13b8c8]/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#13b8c8_1px,transparent_1px),linear-gradient(to_bottom,#13b8c8_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="section-eyebrow text-[#13b8c8] mb-3">Study hall conduct</span>
          <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-ui)] font-bold text-white mb-6 leading-tight">
            Library Rules
          </h1>
          <p className="max-w-2xl mx-auto text-[#9eb0c2] text-base sm:text-lg leading-relaxed">
            These rules keep {libraryName} quiet, fair, and usable for every scholar. Membership is an agreement to follow them.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        {rules.length === 0 ? (
          <p className="rounded-2xl border border-[#dce8f0] bg-white p-6 text-sm text-[#65788c]">
            The library has not published its rules yet. Ask at reception, or send a message from the contact page.
          </p>
        ) : (
          <ol className="space-y-3">
            {rules.map((rule, index) => (
              <li
                key={`${index}-${rule}`}
                className="flex gap-4 rounded-2xl border border-[#dce8f0] bg-white p-4 sm:p-5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7faff] text-sm font-bold text-[#087d99]">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-[#294055] sm:text-base">{rule}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <ScrollText className="h-4 w-4 text-[#087d99]" />
          <span className="text-[#65788c]">Questions about a rule?</span>
          <Link to="/contact" className="font-bold text-[#087d99] underline">
            Contact reception
          </Link>
        </div>
      </section>
    </div>
  );
};

export default RulesPage;
