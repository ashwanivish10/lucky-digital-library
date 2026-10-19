import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DitherCanvas } from "./DitherCanvas";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- PrismaHero (Responsive with Hamburger) ---------------- */
const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Facilities", path: "/facilities" },
  { label: "Membership", path: "/membership" },
  { label: "Rules", path: "/rules" },
  { label: "Contact", path: "/contact" },
];

export const PrismaHero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="h-[100svh] w-full p-1.5 sm:p-2 md:p-4 bg-[#fbfbfa]">
      <div className="relative h-full w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-xl">

        {/* Dither Canvas Background Effect */}
        <DitherCanvas
          imageSrc="/hero-library.jpg"
          className="absolute inset-0"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />

        {/* Gradient overlay — stronger on mobile for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/75 sm:from-black/20 sm:via-transparent sm:to-black/70" />

        {/* ──────────── Desktop Navbar (md+) ──────────── */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2 pt-3 hidden md:block">
          <div className="flex items-center gap-6 lg:gap-8 rounded-full bg-white/90 backdrop-blur-md px-8 lg:px-10 py-2.5 border border-[#e7e5e4] shadow-md">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-sm font-bold uppercase tracking-wider text-[#1c1917] transition-colors hover:text-[#d97706] whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* ──────────── Mobile Navbar (< md) ──────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 md:hidden">
          {/* Logo / Brand */}
          <Link to="/" className="rounded-full bg-white/90 backdrop-blur-md px-4 py-2 border border-[#e7e5e4] shadow-md">
            <span className="text-sm font-black tracking-tight text-[#1c1917]">LDL</span>
          </Link>

          {/* Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-[#e7e5e4] shadow-md transition-transform active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-[#1c1917]" />
            ) : (
              <Menu className="h-5 w-5 text-[#1c1917]" />
            )}
          </button>
        </div>

        {/* ──────────── Mobile Menu Overlay ──────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-4 top-16 z-30 rounded-2xl bg-white/95 backdrop-blur-lg border border-[#e7e5e4] shadow-2xl p-5 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#1c1917] transition-colors hover:bg-[#f5f3ef] hover:text-[#d97706] active:bg-[#ebe8e2]"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Quick CTA in mobile menu */}
              <div className="mt-3 border-t border-[#e7e5e4] pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d97706] py-3 text-sm font-bold text-white transition-all hover:bg-[#b45309] shadow-md"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──────────── Hero Content ──────────── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-20 sm:pb-8 md:px-12 md:pb-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            {/* Big title */}
            <div className="flex-shrink-0">
              <h1
                className="font-black leading-[0.82] tracking-[-0.07em] text-[20vw] sm:text-[18vw] md:text-[16vw] lg:text-[14vw] xl:text-[12vw]"
                style={{ color: "#fbfbfa" }}
              >
                <WordsPullUp text="Lucky" showAsterisk />
              </h1>
            </div>

            {/* Description + CTA */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:max-w-md lg:pb-6">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[13px] leading-relaxed sm:text-sm md:text-base text-white/90 font-medium max-w-sm sm:max-w-md"
              >
                Lucky Digital Library in Prayagraj provides 58 dedicated ergonomic cabins, pin-drop silent atmosphere, dual-band optical fiber, and 24×7 round-the-clock access all 7 days for serious scholars.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-[#d97706] py-2.5 pl-5 pr-2 text-sm font-bold text-white transition-all hover:gap-3 hover:bg-[#b45309] shadow-lg sm:py-2 sm:pl-6 sm:text-base"
                >
                  Sign In
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1c1917] transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismaHero;
