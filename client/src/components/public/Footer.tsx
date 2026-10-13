import React from 'react';
import { Heart, Star } from 'lucide-react';
import { ISiteSettings } from '../../types/public';

interface FooterProps {
  settings?: ISiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const mapLink = settings?.mapLink || 'https://maps.app.goo.gl/AaCd93WYde8cYnx79';

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050d18] px-4 pt-12 pb-24 sm:px-6 sm:py-16 text-center text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(126,249,255,0.75) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16 flex-col items-center gap-4">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-[family-name:var(--font-ui)] text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl md:text-5xl">
          <span>Made with</span>
          <Heart className="h-6 w-6 shrink-0 fill-[#fb7185] text-[#fb7185] sm:h-8 sm:w-8 md:h-10 md:w-10" aria-label="love" />
          <span>in the house of</span>
        </p>
          <span className="text-[#7ef9ff] flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-[family-name:var(--font-ui)] text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl md:text-5xl">Lucky Digital Library</span>

        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:text-[#7ef9ff] sm:text-sm"
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>Give us a review on Google</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
