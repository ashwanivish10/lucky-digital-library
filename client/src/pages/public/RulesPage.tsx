import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { ISiteSettings } from '../../types/public';

export const RulesPage: React.FC = () => {
  const { settings } = useOutletContext<{ settings?: ISiteSettings | null }>();
  const rules = (settings?.rules || []).map((rule) => rule.trim()).filter(Boolean);
  const libraryName = settings?.libraryName || 'Lucky Digital Library';

  return (
    <div className="bg-[#fbfbfa] min-h-screen text-[#1c1917]">
      <section className="bg-[radial-gradient(circle_at_top_right,_rgba(217,119,6,0.08),_transparent_32%),linear-gradient(135deg,#fcfbf9_0%,#f5f3ef_50%,#eeeae4_100%)] text-[#1c1917] pt-12 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden border-b border-[#e7e5e4]">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,rgba(28,25,23,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.12)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d6d3d1] text-[#78350f] font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
            Study hall conduct
          </span>
          <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-ui)] font-bold text-[#1c1917] mb-6 leading-tight">
            Library Rules
          </h1>
          <p className="max-w-2xl mx-auto text-[#78716c] text-base sm:text-lg leading-relaxed">
            These rules keep {libraryName} quiet, fair, and usable for every scholar. Membership is an agreement to follow them.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        {rules.length === 0 ? (
          <p className="rounded-2xl border border-[#e7e5e4] bg-white p-6 text-sm text-[#78716c] shadow-[0_10px_25px_rgba(28,25,23,0.04)]">
            The library has not published its rules yet. Ask at reception, or send a message from the contact page.
          </p>
        ) : (
          <ol className="space-y-3">
            {rules.map((rule, index) => (
              <li
                key={`${index}-${rule}`}
                className="flex gap-4 rounded-2xl border border-[#e7e5e4] bg-white p-4 sm:p-5 shadow-[0_10px_25px_rgba(28,25,23,0.04)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-sm font-bold text-[#b45309] ring-1 ring-[#f59e0b]/30">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-[#292524] sm:text-base">{rule}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <ScrollText className="h-4 w-4 text-[#d97706]" />
          <span className="text-[#78716c]">Questions about a rule?</span>
          <Link to="/contact" className="font-bold text-[#d97706] underline">
            Contact reception
          </Link>
        </div>
      </section>
    </div>
  );
};

export default RulesPage;
