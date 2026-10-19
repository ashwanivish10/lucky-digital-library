import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { ISiteSettings } from '../../types/public';

interface FooterProps {
  settings?: ISiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const mapLink = settings?.mapLink || 'https://maps.app.goo.gl/AaCd93WYde8cYnx79';

  return (
    <footer className="relative overflow-hidden border-t border-[#e7e5e4] bg-[#f5f3ef] px-4 pt-12 pb-24 sm:px-6 sm:py-16 text-center text-[#1c1917]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16 flex-col items-center gap-4">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-[family-name:var(--font-ui)] text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl md:text-5xl text-[#1c1917]">
          <span>Made with</span>
          <Heart className="h-6 w-6 shrink-0 fill-[#e11d48] text-[#e11d48] sm:h-8 sm:w-8 md:h-10 md:w-10" aria-label="love" />
          <span>in the house of</span>
        </p>
          <span className="text-[#b45309] flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-[family-name:var(--font-ui)] text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl md:text-5xl">Lucky Digital Library</span>

        <nav className="flex max-w-lg flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-[#78716c] sm:text-sm" aria-label="Footer">
          <Link to="/about" className="hover:text-[#b45309]">About</Link>
          <Link to="/facilities" className="hover:text-[#b45309]">Facilities</Link>
          <Link to="/membership" className="hover:text-[#b45309]">Membership</Link>
          <Link to="/rules" className="hover:text-[#b45309]">Rules</Link>
          <Link to="/contact" className="hover:text-[#b45309]">Contact</Link>
        </nav>
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#78716c] transition-colors hover:text-[#b45309] sm:text-sm"
        >
          <Star className="h-3.5 w-3.5 fill-current text-[#d97706]" />
          <span>Give us a review on Google</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
