import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ArrowRight } from 'lucide-react';
import { ISiteSettings } from '../../types/public';
import NoticeTicker from './NoticeTicker';

interface NavbarProps {
  settings?: ISiteSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Membership', path: '/membership' },
    { label: 'Contact', path: '/contact' },
  ];

  const libraryName = settings?.libraryName || 'Lucky Digital Library';

  return (
    <header className="sticky top-0 z-50">
      <NoticeTicker settings={settings} />
      <div className="border-b border-[#dce8f0] bg-white/95 shadow-[0_8px_24px_rgba(7,21,33,0.08)] backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
          <Link to="/" className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#7ef9ff]/25 bg-gradient-to-br from-[#dff9ff] via-[#7ef9ff] to-[#5dc4ff] text-xl font-black text-[#071521] shadow-[0_8px_22px_rgba(93,196,255,0.25)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-11 sm:w-11 sm:text-2xl">
              L
            </div>

            <div className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-ui)] text-sm font-black leading-tight tracking-[-0.045em] text-[#0b1d2e] transition-colors group-hover:text-[#087d99] sm:text-lg">
                {libraryName}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200 xl:px-3.5 xl:text-[11px] ${
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

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#d7e3ec] bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#294055] transition-all hover:border-[#69cddd] hover:bg-[#f2fcff] hover:text-[#087d99] xl:text-[11px]"
            >
              <User className="h-3.5 w-3.5 text-[#087d99]" />
              <span>Student Login</span>
            </Link>
            <Link
              to="/register"
              className="btn btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] xl:px-5 xl:text-[11px]"
            >
              <span>Join Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <Link
              to="/login"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7e3ec] bg-white text-[#294055] transition-colors hover:border-[#69cddd] hover:bg-[#f2fcff] hover:text-[#087d99]"
              aria-label="Student Login"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7e3ec] bg-white text-[#294055] transition-colors hover:border-[#69cddd] hover:bg-[#f2fcff] hover:text-[#087d99]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute left-3 right-3 top-full mt-2 rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-[0_22px_36px_rgba(7,21,33,0.16)] sm:left-6 sm:right-6 lg:hidden">
          <ul className="mb-4 flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block rounded-xl px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all ${
                      isActive
                        ? 'bg-[#e5faff] text-[#087d99]'
                        : 'text-[#415469] hover:bg-[#f1f7fa] hover:text-[#0b1d2e]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2 border-t border-[#dce8f0] pt-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e3ec] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#294055]"
            >
              <User className="h-3.5 w-3.5 text-[#087d99]" />
              <span>Student Portal Login</span>
            </Link>
            <Link
              to="/register"
              className="btn btn-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] uppercase tracking-[0.14em]"
            >
              <span>Join the Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
