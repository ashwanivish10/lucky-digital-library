import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  ArrowRight,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

interface AboutStorySectionProps {
  videoUrl?: string;
  videoPoster?: string;
}

export const AboutStorySection: React.FC<AboutStorySectionProps> = ({
  videoUrl = '/videos/ldl_tour_9_16.mp4',
  videoPoster = '/videos/ldl_tour_poster.jpg',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy prevented playback, keep paused
          setIsPlaying(false);
        });
    }
  }, []);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newFraction = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = newFraction * videoRef.current.duration;
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#fbfbfa] via-[#f5f3ef] to-[#eeeae4] text-[#1c1917] border-y border-[#e7e5e4]">
      {/* Decorative ambient background accents */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#d97706 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#d97706]/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-[#b45309]/10 blur-[120px]"
      />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: HINDI NARRATIVE CONTENT ONLY (7 Cols)         */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section Tag & Heading */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef3c7] border border-[#f59e0b]/30 text-xs font-bold uppercase tracking-wider text-[#b45309]">
                <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
                लकी डिजिटल लाइब्रेरी के बारे में
              </span>
              <h2 className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1c1917] tracking-tight leading-[1.15]">
                जहाँ एकाग्रता से सफलता की शुरुआत होती है।
              </h2>
            </div>

            {/* The single narrative paragraph requested */}
            <p className="text-base sm:text-lg text-[#57534e] leading-[1.9] font-normal">
              20 फरवरी 2025 को स्थापित{' '}
              <strong className="text-[#1c1917] font-extrabold">
                लकी डिजिटल लाइब्रेरी
              </strong>{' '}
              का उद्देश्य विद्यार्थियों को एक शांत, आरामदायक और प्रेरणादायक वातावरण प्रदान करना है, जहाँ वे एकाग्रता और अनुशासन के साथ अपने सपनों को साकार करने की दिशा में आगे बढ़ सकें। हमारा मानना है कि सही वातावरण, निरंतर मेहनत और दृढ़ संकल्प ही सफलता की नींव हैं। हम विद्यार्थियों को ऐसा अध्ययन स्थल प्रदान करने के लिए प्रतिबद्ध हैं, जहाँ वे अपने लक्ष्यों पर ध्यान केंद्रित कर सकें और सफलता की ओर कदम बढ़ा सकें।
            </p>

            {/* Tagline Motto Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fef3c7] via-[#fbfbfa] to-white border-l-4 border-l-[#d97706] border border-[#e7e5e4] shadow-[0_10px_25px_rgba(28,25,23,0.04)]">
              <p className="text-base sm:text-lg font-bold text-[#1c1917] leading-snug">
                लकी डिजिटल लाइब्रेरी —{' '}
                <span className="text-[#b45309]">जहाँ एकाग्रता बनती है सफलता की नींव।</span>
              </p>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/contact"
                className="btn btn-primary text-xs py-2.5 px-5 rounded-xl font-bold shadow-sm"
              >
                <span>प्रवेश जानकारी (Enquire Now)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link
                to="/facilities"
                className="btn btn-secondary text-xs py-2.5 px-5 rounded-xl border-[#e7e5e4] text-[#1c1917]"
              >
                सुविधाएं देखें
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 9:16 VERTICAL VIDEO PLAYER (5 Cols)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[320px] sm:max-w-[360px]">
              {/* Smartphone Capsule Frame (9:16 Aspect Ratio) */}
              <div
                className="relative rounded-[40px] sm:rounded-[46px] p-3 sm:p-3.5 bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09] border-2 border-[#d97706]/40 shadow-[0_24px_60px_rgba(28,25,23,0.2)] ring-1 ring-white/10"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Top Dynamic Island / Speaker Pill */}
                <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/90 rounded-full z-30 flex items-center justify-center gap-2 border border-white/10 shadow-sm pointer-events-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-white/15" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/70" />
                </div>

                {/* Inner 9:16 Screen Container */}
                <div
                  onClick={() => handleTogglePlay()}
                  className="relative aspect-[9/16] w-full rounded-[32px] sm:rounded-[36px] overflow-hidden bg-black flex flex-col justify-between border border-white/10 shadow-inner group cursor-pointer select-none"
                >
                  {/* HTML5 Native Video Tag */}
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={videoPoster}
                    playsInline
                    loop
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Top Bar Overlay */}
                  <div className="absolute top-0 inset-x-0 pt-7 sm:pt-8 px-3.5 pb-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                      वीडियो टूर • 9:16
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleRestart}
                        aria-label="Restart video"
                        className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white/90 flex items-center justify-center border border-white/15 hover:bg-black/90 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                        className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/90 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Center Play/Pause Large Floating Button */}
                  <div
                    className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                      !isPlaying || isHovering ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="pointer-events-auto w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#b45309] to-[#d97706] text-white flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.5)] border-2 border-white/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-white" />
                      ) : (
                        <Play className="w-7 h-7 ml-1 fill-white" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Bar Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 pt-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                        <h4 className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                          लकी डिजिटल लाइब्रेरी
                        </h4>
                      </div>
                      <span className="text-[10px] text-white/70 font-mono">
                        {isPlaying ? 'PLAYING' : 'PAUSED'}
                      </span>
                    </div>

                    <p className="text-white/70 text-[10px] leading-snug line-clamp-1 mb-2.5">
                      जहाँ एकाग्रता बनती है सफलता की नींव।
                    </p>

                    {/* Progress Bar scrubber */}
                    <div
                      onClick={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group/bar hover:h-2 transition-all"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#b45309] to-[#d97706] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Label */}
              <div className="mt-3 text-center">
                <span className="text-[11px] font-semibold text-[#78716c] uppercase tracking-widest">
                  लकी डिजिटल लाइब्रेरी — 9:16 वीडियो टूर
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStorySection;
