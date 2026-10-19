import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ArrowRight, Menu, X } from 'lucide-react';
import { ISiteSettings } from '../../types/public';
import NoticeTicker from './NoticeTicker';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  settings?: ISiteSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const accountPath = user?.role === 'admin' ? '/admin' : user ? '/portal' : '/login';
  const accountLabel = user?.role === 'admin' ? 'Admin' : user ? 'My Portal' : 'Student Login';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Membership', path: '/membership' },
    { label: 'Rules', path: '/rules' },
    { label: 'Contact', path: '/contact' },
  ];

  const libraryName = settings?.libraryName || 'Lucky Digital Library';

  return (
    <header className="sticky top-0 z-50">
      <NoticeTicker settings={settings} />
      <div className="border-b border-[#dce8f0] bg-white/95 shadow-[0_8px_24px_rgba(7,21,33,0.08)] backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between gap-3 py-2 sm:py-3">
          <Link to="/" className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3 touch-target-min">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#7ef9ff]/25 bg-gradient-to-br from-[#dff9ff] via-[#7ef9ff] to-[#5dc4ff] text-xl font-black text-[#071521] shadow-[0_8px_22px_rgba(93,196,255,0.25)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-11 sm:w-11 sm:text-2xl">
              L
            </div>

            <div className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-ui)] text-sm font-black leading-tight tracking-[-0.045em] text-[#0b1d2e] transition-colors group-hover:text-[#087d99] sm:text-base">
                {libraryName}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#e5faff] text-[#087d99] shadow-[inset_0_0_0_1px_rgba(8,125,153,0.14)]'
                      : 'text-[#415469] hover:bg-[#f1f7fa] hover:text-[#0b1d2e]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              to={accountPath}
              className="inline-flex items-center gap-2 rounded-full border border-[#d7e3ec] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#294055] transition-all hover:border-[#69cddd] hover:bg-[#f2fcff] hover:text-[#087d99] min-h-[44px]"
            >
              <User className="h-3.5 w-3.5 text-[#087d99]" />
              <span>{accountLabel}</span>
            </Link>
            <Link
              to="/contact"
              className="btn btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] min-h-[44px]"
            >
              <span>Join Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce8f0] bg-white text-[#294055]"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link
              to="/contact"
              className="btn btn-primary inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold active:scale-95"
              aria-label="Enquire or Join"
            >
              <span>Join</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-[#e6eef3] px-4 py-3 md:hidden" aria-label="Mobile pages">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                    isActive ? 'bg-[#e5faff] text-[#087d99]' : 'text-[#294055]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link to={accountPath} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#087d99]">
              {user ? `${accountLabel}${user.name ? ` · ${user.name}` : ''}` : accountLabel}
            </Link>
          </nav>
        )}
      </div>
      </div>
    </header>
  );
};

export default Navbar;
