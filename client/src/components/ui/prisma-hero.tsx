import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

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

/* ---------------- PrismaHero (Adapted with Lucky Digital Library Data) ---------------- */
const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Facilities", path: "/facilities" },
  { label: "Membership", path: "/membership" },
  { label: "Rules", path: "/rules" },
  { label: "Contact", path: "/contact" },
];

export const PrismaHero = () => {
  return (
    <section className="h-screen w-full p-2 sm:p-4 bg-[#fbfbfa]">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem] shadow-xl">

        {/* Background video / Library ambience video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />

        {/* Gradient overlay calibrated for light theme readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* Navbar */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2 pt-3">
          <div className="flex items-center gap-3 rounded-full bg-white/90 backdrop-blur-md px-6 py-2.5 sm:gap-6 md:gap-8 md:px-10 border border-[#e7e5e4] shadow-md">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1c1917] transition-colors hover:text-[#d97706]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-6 md:px-12 md:pb-10">
          <div className="grid grid-cols-12 items-end gap-4">

            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-black leading-[0.82] tracking-[-0.07em] text-[22vw] sm:text-[20vw] md:text-[18vw] lg:text-[16vw]"
                style={{ color: "#fbfbfa" }}
              >
                <WordsPullUp text="Lucky" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-6">

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-base text-white/90 font-medium"
                style={{ lineHeight: 1.35 }}
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
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-[#d97706] py-2 pl-6 pr-2 text-sm font-bold text-white transition-all hover:gap-3 hover:bg-[#b45309] shadow-lg sm:text-base"
                >
                  Sign In
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1c1917] transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
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
