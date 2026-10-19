import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { ISiteSettings } from '../../types/public';

interface NoticeTickerProps {
  settings?: ISiteSettings | null;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({ settings }) => {
  const noticeText = settings?.noticeText?.trim() || '';
  const [dismissedText, setDismissedText] = useState(() => {
    try {
      return sessionStorage.getItem('ldl_notice_dismissed_text') || '';
    } catch {
      return '';
    }
  });

  if (!settings?.noticeEnabled || !noticeText || (dismissedText && dismissedText === noticeText)) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('ldl_notice_dismissed_text', noticeText);
    } catch {
      // ignore
    }
    setDismissedText(noticeText);
  };

  const badgeText = settings?.noticeBadge?.trim() || 'ANNOUNCEMENT';
  const link = settings?.noticeLink?.trim();
  const linkText = settings?.noticeLinkText?.trim() || 'View Details';
  const isExternalLink = link ? link.startsWith('http') || link.startsWith('//') : false;

  return (
    <div
      role="region"
      aria-label="Library Announcement"
      className="bg-[#f5f3ef] text-[#1c1917] border-b border-[#e7e5e4] py-2 px-3 sm:px-6 relative overflow-hidden z-50 shadow-xs"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.08),transparent_70%)]" />

      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 relative z-10">
        {/* Left Badge with pulsing live beacon */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef3c7] border border-[#f59e0b]/40 text-[#b45309] text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d97706]" />
            </span>
            <span>{badgeText}</span>
          </span>
        </div>

        {/* Center Running Marquee Ticker */}
        <div
          className="flex-1 overflow-hidden relative mx-2 sm:mx-4"
          style={{
            maskImage: 'linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 3%, black 97%, transparent 100%)',
          }}
        >
          <div
            className="flex w-max animate-marquee-left hover:[animation-play-state:paused] cursor-default select-none py-0.5"
            style={{ animationDuration: '32s' }}
          >
            {/* Part 1 */}
            <div className="flex items-center gap-8 pr-8">
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#292524]">
                {noticeText}
              </span>
              <span className="text-[#d97706] text-xs">✦</span>
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#292524]">
                {noticeText}
              </span>
              <span className="text-[#d97706] text-xs">✦</span>
            </div>

            {/* Part 2 (Duplicate for continuous loop) */}
            <div className="flex items-center gap-8 pr-8" aria-hidden="true">
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#292524]">
                {noticeText}
              </span>
              <span className="text-[#d97706] text-xs">✦</span>
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#292524]">
                {noticeText}
              </span>
              <span className="text-[#d97706] text-xs">✦</span>
            </div>
          </div>
        </div>

        {/* Right Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {link && (
            isExternalLink ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#d97706] text-white hover:bg-[#b45309] text-[11px] font-bold tracking-tight shadow-xs transition-all shrink-0"
              >
                <span>{linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <Link
                to={link}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#d97706] text-white hover:bg-[#b45309] text-[11px] font-bold tracking-tight shadow-xs transition-all shrink-0"
              >
                <span>{linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )
          )}

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notice"
            className="p-1 rounded-md text-[#78716c] hover:text-[#1c1917] hover:bg-black/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeTicker;
