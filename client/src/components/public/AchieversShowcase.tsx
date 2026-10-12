import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight, Award, Sparkles } from 'lucide-react';

interface Achiever {
  id: number;
  image: string;
  name: string;
  title: string;
  exam: string;
  badge: string;
}

const ACHIEVERS: Achiever[] = [
  {
    id: 1,
    image: '/images/achievers/achiever_3.jpg',
    name: 'Kashif Mobin',
    title: 'All India Rank 3 (AIR 3)',
    exam: 'UGC NET Examination',
    badge: 'National Rank 3',
  },
  {
    id: 2,
    image: '/images/achievers/achiever_1.jpg',
    name: 'Student Felicitation',
    title: 'Exam Selection & Honor',
    exam: 'Competitive Exam Qualifier',
    badge: 'Selected Scholar',
  },
  {
    id: 3,
    image: '/images/achievers/achiever_2.jpg',
    name: 'Study Hall Celebration',
    title: 'Honoring Library Achievers',
    exam: 'LDL Study Sanctuary',
    badge: 'Hall of Fame',
  },
  {
    id: 4,
    image: '/images/achievers/achiever_4.jpg',
    name: 'Sweet Success Celebration',
    title: 'Felicitation with Garland & Shawl',
    exam: 'Hard Work & Discipline',
    badge: 'Proud Moment',
  },
  {
    id: 5,
    image: '/images/achievers/achiever_5.jpg',
    name: 'Inspiring Achiever',
    title: 'Honoring Hard Work',
    exam: 'Where Focus Builds Success',
    badge: 'Excellence',
  },
];

export const AchieversShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  // Smooth auto-slide transition every 4 seconds, pausing on hover/interaction
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % ACHIEVERS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % ACHIEVERS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + ACHIEVERS.length) % ACHIEVERS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(126,249,255,0.18),transparent_26%),linear-gradient(180deg,rgba(15,28,42,0.98),rgba(9,18,28,0.96))] p-5 sm:p-7 shadow-[0_25px_60px_rgba(2,9,18,0.58)] backdrop-blur-xl"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#5dc4ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-0 h-36 w-36 rounded-full bg-[#7ef9ff]/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header: Achievers */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#7ef9ff] shadow-[0_0_14px_rgba(126,249,255,0.9)] animate-pulse" />
              <span className="font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#cfeeff]">
                Hall of Fame • Selections
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-ui)] text-2xl sm:text-3xl font-black tracking-[-0.04em] text-white">
              Achievers
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#7ef9ff]">
              {currentIndex + 1} / {ACHIEVERS.length}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7ef9ff]/25 bg-[#7ef9ff]/10 text-[#7ef9ff] shadow-[inset_0_0_0_1px_rgba(126,249,255,0.18)]">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ULTRA-SMOOTH PERSISTENT 3D OVERLAPPING CARD DECK          */}
        {/* ======================================================== */}
        <div className="relative w-full h-[325px] sm:h-[355px] mb-4 flex items-center justify-center select-none">
          {ACHIEVERS.map((achiever, i) => {
            const offset = (i - currentIndex + ACHIEVERS.length) % ACHIEVERS.length;

            // Compute positions for smooth deck shuffle
            let target: {
              x: number;
              y: number;
              scale: number;
              rotate: number;
              opacity: number;
              zIndex: number;
              pointerEvents: 'none' | 'auto';
            } = {
              x: 0,
              y: 22,
              scale: 0.82,
              rotate: 0,
              opacity: 0,
              zIndex: 0,
              pointerEvents: 'none',
            };

            if (offset === 0) {
              // Active top card
              target = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1,
                zIndex: 30,
                pointerEvents: 'auto' as const,
              };
            } else if (offset === 1) {
              // 2nd card layered behind to the right
              target = {
                x: 16,
                y: 10,
                scale: 0.94,
                rotate: 3.5,
                opacity: 0.65,
                zIndex: 20,
                pointerEvents: 'auto' as const,
              };
            } else if (offset === 2) {
              // 3rd card layered behind to the left
              target = {
                x: -14,
                y: 18,
                scale: 0.88,
                rotate: -4,
                opacity: 0.35,
                zIndex: 10,
                pointerEvents: 'none' as const,
              };
            } else if (offset === ACHIEVERS.length - 1) {
              // Just-exited card gracefully sliding off to the side and fading
              target = {
                x: direction > 0 ? -120 : 120,
                y: 6,
                scale: 0.92,
                rotate: direction > 0 ? -7 : 7,
                opacity: 0,
                zIndex: 25,
                pointerEvents: 'none' as const,
              };
            }

            return (
              <motion.div
                key={achiever.id}
                animate={target}
                transition={{
                  duration: 0.65,
                  ease: [0.25, 1, 0.5, 1],
                }}
                drag={offset === 0 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    handlePrev();
                  } else if (info.offset.x < -50) {
                    handleNext();
                  }
                }}
                onClick={() => {
                  if (offset === 1) handleNext();
                }}
                className={`absolute w-[92%] sm:w-[94%] h-[300px] sm:h-[335px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none bg-[#091522] ${
                  offset === 0
                    ? 'border-2 border-[#13b8c8]/50 shadow-[0_20px_50px_rgba(2,10,20,0.75)]'
                    : offset === 1
                    ? 'border border-white/20 shadow-[0_12px_32px_rgba(2,10,20,0.45)]'
                    : 'border border-white/10 shadow-[0_8px_20px_rgba(2,10,20,0.3)]'
                }`}
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Photo */}
                <img
                  src={achiever.image}
                  alt={achiever.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  loading="eager"
                />

                {/* Top Badge Overlay - smoothly visible on active card */}
                <div
                  className={`absolute top-3 left-3 z-20 transition-opacity duration-300 ${
                    offset === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#13b8c8]/40 text-[11px] font-bold text-[#7ef9ff] shadow-md">
                    <Award className="w-3.5 h-3.5 text-[#13b8c8]" />
                    <span>{achiever.badge}</span>
                  </span>
                </div>

                {/* Bottom Details Overlay - smoothly visible on active card */}
                <div
                  className={`absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-20 text-left transition-opacity duration-300 ${
                    offset === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#13b8c8] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7ef9ff]">
                      {achiever.exam}
                    </span>
                  </div>
                  <h4 className="text-white text-base sm:text-lg font-bold leading-tight">
                    {achiever.name}
                  </h4>
                  <p className="text-white/80 text-xs mt-0.5 font-medium line-clamp-1">
                    {achiever.title}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Achiever"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white/90 flex items-center justify-center z-40 border border-white/20 backdrop-blur-sm transition-transform active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Achiever"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white/90 flex items-center justify-center z-40 border border-white/20 backdrop-blur-sm transition-transform active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress & Slide Dots Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            {ACHIEVERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentIndex === i
                    ? 'w-6 bg-gradient-to-r from-[#087d99] to-[#7ef9ff] shadow-[0_0_8px_rgba(126,249,255,0.6)]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to achiever ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7ef9ff]">
            <Sparkles className="w-3.5 h-3.5 text-[#13b8c8]" />
            <span>Success Stories</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchieversShowcase;
