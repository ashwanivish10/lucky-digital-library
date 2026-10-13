import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DoorOpen,
  Search,
  UserCheck,
  CheckCircle2,
  X,
  Columns,
  LayoutGrid,
} from 'lucide-react';
import { studentsApi } from '../../lib/api';
import { WEEK_DAYS } from '../../types/public';

export interface SeatData {
  seatNumber: number;
  label: string;
  side: 'left' | 'right';
  wing?: string;
  isOccupied: boolean;
  isMySeat: boolean;
  studentCode?: string;
  studentName?: string;
}

interface SeatMapProps {
  /** If specified, this seat number will be actively highlighted as the student's seat */
  highlightSeat?: number | string | null;
  /** Allow clicking a seat to inspect it */
  interactive?: boolean;
  /** Show legend and search header */
  showControls?: boolean;
  /** Compact mode for smaller viewports or embedded widgets */
  compact?: boolean;
  /** Callback when user selects a seat */
  onSelectSeat?: (seatNumber: number) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  highlightSeat,
  interactive = true,
  showControls = true,
  compact = false,
  onSelectSeat,
}) => {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'twocol' | 'matrix'>('twocol');
  const [seatDays, setSeatDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]);
  const [seatStartTime, setSeatStartTime] = useState('06:00');
  const [seatEndTime, setSeatEndTime] = useState('14:00');
  const [availabilityError, setAvailabilityError] = useState('');
  const mySeatRef = useRef<HTMLButtonElement | null>(null);

  // Normalize highlightSeat prop to number if given
  const targetSeatNum = React.useMemo(() => {
    if (!highlightSeat) return null;
    const match = String(highlightSeat).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }, [highlightSeat]);

  // Fetch real-time seat availability
  useEffect(() => {
    let isMounted = true;
    if (seatDays.length === 0 || seatStartTime >= seatEndTime) {
      setSeats([]);
      setAvailabilityError(seatDays.length === 0
        ? 'Choose at least one day to check availability.'
        : 'End time must be after start time.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setAvailabilityError('');

    studentsApi
      .getSeatMap({
        days: seatDays.join(','),
        startTime: seatStartTime,
        endTime: seatEndTime,
      })
      .then((res) => {
        if (!isMounted) return;
        const apiSeats: SeatData[] = res.data?.data?.seats || [];

        const adjustedSeats = apiSeats.map((s) => ({
          ...s,
          wing: s.seatNumber <= 30 ? 'East Wing' : 'West Wing',
          side: (s.seatNumber <= 30 ? 'right' : 'left') as 'left' | 'right',
          isMySeat: s.isOccupied && (targetSeatNum ? s.seatNumber === targetSeatNum : s.isMySeat),
        }));

        setSeats(adjustedSeats);

        // Pre-select student's seat if assigned
        const mySeat = adjustedSeats.find((s) => s.isMySeat);
        if (mySeat) {
          setSelectedSeat(mySeat);
        }
      })
      .catch((err) => {
        console.error('Failed to load seat map data:', err);
        if (isMounted) {
          setSeats([]);
          setAvailabilityError(err.response?.data?.message || 'Could not load live seat availability. Please try again.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetSeatNum, seatDays, seatStartTime, seatEndTime]);

  // East Wing: 1 to 30 (Starts from Door at 1 up to Back Wall at 30)
  const eastSeats = seats.filter((s) => s.seatNumber >= 1 && s.seatNumber <= 30);
  // West Wing: 31 to 58 (Starts not from door side, i.e. starts at Back Wall at 31 down to Door at 58)
  const westSeats = seats.filter((s) => s.seatNumber >= 31 && s.seatNumber <= 58);

  // Filtered check
  const isMatch = (s: SeatData) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const numMatch = String(s.seatNumber).includes(q);
      const nameMatch = s.studentName?.toLowerCase().includes(q) || false;
      if (!numMatch && !nameMatch) return false;
    }
    if (filterMode === 'available') return !s.isOccupied;
    if (filterMode === 'occupied') return s.isOccupied;
    return true;
  };

  const occupiedCount = seats.filter((s) => s.isOccupied).length;
  const availableCount = seats.length - occupiedCount;

  // Helper for rendering a single seat in 2-Column Exact Sketch mode
  const renderTwoColRow = (seat: SeatData, side: 'left' | 'right') => {
    const matched = isMatch(seat);
    const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
    const wingName = seat.seatNumber <= 30 ? 'East Wing' : 'West Wing';

    return (
      <button
        type="button"
        key={seat.seatNumber}
        ref={seat.isMySeat ? mySeatRef : undefined}
        onClick={() => {
          if (interactive) {
            setSelectedSeat(seat);
            onSelectSeat?.(seat.seatNumber);
          }
        }}
        title={`Seat ${seat.seatNumber}\n${wingName}\n${seat.isMySeat ? 'Your Reserved Seat' : seat.isOccupied ? 'Allocated to other person' : 'Available'}`}
        className={`h-[18px] w-full max-w-24 self-center px-1.5 flex items-center justify-between rounded-lg border text-[9px] font-mono transition-all duration-200 select-none ${
          !matched ? 'opacity-20 pointer-events-none' : 'opacity-100'
        } ${
          seat.isMySeat
            ? 'bg-gradient-to-r from-[#f7d77b] via-[#f2bf63] to-[#d7a14a] text-[#071521] font-extrabold border-[#fbdd81] shadow-[0_0_18px_rgba(247,215,123,0.42)] z-10 scale-[1.02]'
            : isSelected
            ? 'bg-gradient-to-r from-[#7ef9ff]/25 to-[#5dc4ff]/20 text-white border-[#7ef9ff]/60 ring-1 ring-[#7ef9ff]/60 z-10'
            : seat.isOccupied
            ? 'bg-[#111f32] text-[#8aa7c6] border-[#213a55] hover:border-[#335d8f] hover:bg-[#16283d]'
            : 'bg-[#0d2d2e]/90 text-[#aefae3] border-[#1f7d74]/60 hover:border-[#4fe3d1] hover:bg-[#12363a]'
        }`}
      >
        {side === 'left' ? (
          <>
            <span className="flex items-center gap-1 font-semibold truncate leading-none">
              <span>Seat {seat.seatNumber}</span>
              {seat.isMySeat && (
                <span className="text-[7.5px] bg-[#060A14] text-[#13b8c8] px-0.5 rounded font-sans uppercase font-bold">
                  YOU
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  seat.isMySeat ? 'bg-[#060A14]' : seat.isOccupied ? 'bg-[#F43F5E]' : 'bg-[#10B981]'
                }`}
              />
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1 shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  seat.isMySeat ? 'bg-[#060A14]' : seat.isOccupied ? 'bg-[#F43F5E]' : 'bg-[#10B981]'
                }`}
              />
            </span>
            <span className="flex items-center gap-1 font-semibold truncate leading-none">
              {seat.isMySeat && (
                <span className="text-[7.5px] bg-[#060A14] text-[#13b8c8] px-0.5 rounded font-sans uppercase font-bold">
                  YOU
                </span>
              )}
              <span>Seat {seat.seatNumber}</span>
            </span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`w-full overflow-hidden rounded-[28px] border border-[#7ef9ff]/20 bg-[radial-gradient(circle_at_top,_rgba(126,249,255,0.18),_transparent_18%),linear-gradient(180deg,#091827_0%,#0f1d2f_100%)] text-white shadow-[0_24px_48px_rgba(2,8,17,0.36)] ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>

      {showControls && (
        <div className="my-2 space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                Attendance Schedule (24×7 Open · 58 Seats)
              </p>
              <button
                type="button"
                onClick={() => setSeatDays([...WEEK_DAYS])}
                className="text-[10px] font-semibold text-[#7ef9ff] hover:underline"
              >
                Select All 7 Days
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {WEEK_DAYS.map((day) => {
                const selected = seatDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSeatDays(selected
                      ? seatDays.filter((selectedDay) => selectedDay !== day)
                      : [...seatDays, day])}
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                      selected
                        ? 'border-[#7ef9ff]/50 bg-[#7ef9ff]/15 text-[#7ef9ff]'
                        : 'border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Shift</span>
              <input
                type="time"
                value={seatStartTime}
                onChange={(e) => setSeatStartTime(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#040d18] px-2 py-1 text-[11px] font-mono text-white"
              />
              <span className="text-white/40">to</span>
              <input
                type="time"
                value={seatEndTime}
                onChange={(e) => setSeatEndTime(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#040d18] px-2 py-1 text-[11px] font-mono text-white"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#040d18] p-0.5">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-full px-2 py-1 text-[11px] transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#7ef9ff] font-bold text-[#071521]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                All (58)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('available')}
                className={`rounded-full px-2 py-1 text-[11px] transition-colors ${
                  filterMode === 'available'
                    ? 'bg-[#6ee7b7] font-bold text-[#071521]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('occupied')}
                className={`rounded-full px-2 py-1 text-[11px] transition-colors ${
                  filterMode === 'occupied'
                    ? 'bg-[#334155] font-bold text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Allocated ({occupiedCount})
              </button>
            </div>
          </div>
          {availabilityError && <p role="alert" className="text-[11px] text-rose-300">{availabilityError}</p>}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-28 sm:w-36">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search #..."
                  className="w-full rounded-full border border-white/10 bg-[#040d18] py-0.5 pl-6 pr-2 text-[11px] text-white placeholder:text-white/35 focus:border-[#7ef9ff]/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center rounded-full border border-white/10 bg-[#040d18] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('twocol')}
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                    viewMode === 'twocol' ? 'bg-[#7ef9ff] text-[#071521] font-bold' : 'text-white/70 hover:text-white'
                  }`}
                  title="Exact 2-column room sketch"
                >
                  <Columns className="h-3 w-3" />
                  <span className="hidden sm:inline">2-col</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                    viewMode === 'matrix' ? 'bg-[#7ef9ff] text-[#071521] font-bold' : 'text-white/70 hover:text-white'
                  }`}
                  title="Matrix view"
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span className="hidden sm:inline">grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="my-2 text-center text-xs text-white/60">Checking live availability…</p>}
      {availabilityError && !showControls && <p role="alert" className="my-2 text-center text-xs text-rose-300">{availabilityError}</p>}

      {viewMode === 'twocol' ? (
        <div className="relative overflow-hidden rounded-[24px] border border-[#7ef9ff]/20 bg-[#040d18] p-2 shadow-inner sm:p-3">
          <div className="mx-auto grid max-w-3xl grid-cols-11 items-stretch gap-1.5 sm:gap-3">
            {/* WEST WING (31–58): Left wall. Starts from Back Wall (31) down to Door (58) */}
            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1 text-[10px]">
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#8fe7ff]">West Wing (31–58)</span>
                <span className="font-mono text-[#8aa7c6]">Left wall</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-[#7ef9ff]/20 bg-[#7ef9ff]/5 px-2 text-[8.5px] font-mono text-[#7ef9ff]/80">
                  ↑ Back Wall · Starts Seat 31
                </div>

                {/* West Wing: 31 down to 58 (not from door side, starting from back wall) */}
                {westSeats
                  .slice()
                  .sort((a, b) => a.seatNumber - b.seatNumber)
                  .map((seat) => renderTwoColRow(seat, 'left'))}

                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-white/10 px-2 text-[8.5px] font-mono text-white/35">
                  ↓ Door Side · Ends Seat 58
                </div>
              </div>
            </div>

            {/* CENTER WALKWAY AISLE: Back Wall at Top, Door at Bottom */}
            <div className="relative col-span-1 flex flex-col items-center justify-between py-1">
              <div className="z-10 w-full rounded-xl border border-[#7ef9ff]/30 bg-[#040d18] px-1 py-1 text-center shadow-sm">
                <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-[#7ef9ff]">Back wall</span>
                <span className="mt-0.5 block text-[7.5px] text-white/60">Silent</span>
              </div>

              <div className="relative my-auto flex flex-col items-center justify-center">
                <div className="absolute inset-y-0 w-0.5 border-r border-dashed border-[#7ef9ff]/30" />
                <div className="z-10 rounded-full border border-white/10 bg-[#040d18] px-0.5 py-3 text-[8.5px] font-bold uppercase tracking-[0.2em] text-white/60 [writing-mode:vertical-rl] rotate-180">
                  Walkway aisle
                </div>
                <span className="mt-1.5 text-[10px] text-[#7ef9ff]">↓</span>
              </div>

              <div className="z-10 w-full rounded-xl border border-white/20 bg-gradient-to-r from-[#dff9ff] via-[#7ef9ff] to-[#5dc4ff] px-1 py-1 text-center text-[#071521] shadow-md">
                <div className="flex items-center justify-center gap-1 leading-none">
                  <DoorOpen className="h-2.5 w-2.5" />
                  <span className="text-[8px] font-black uppercase tracking-[0.18em]">Door</span>
                </div>
                <span className="mt-0.5 block text-[7px] font-bold text-[#071521]/85">Entry</span>
              </div>
            </div>

            {/* EAST WING (1–30): Right wall. Starts from Door (Seat 1) up to Back Wall (Seat 30) */}
            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1 text-[10px]">
                <span className="font-mono text-[#8aa7c6]">Right wall</span>
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#8fe7ff]">East Wing (1–30)</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-[#7ef9ff]/20 bg-[#7ef9ff]/5 px-2 text-[8.5px] font-mono text-[#7ef9ff]/80">
                  ↑ Back Wall · Seat 30
                </div>

                {/* East Wing: Rendered top-to-bottom so 30 is at the top (Back wall) and 1 is at the bottom (Door) */}
                {eastSeats
                  .slice()
                  .sort((a, b) => b.seatNumber - a.seatNumber)
                  .map((seat) => renderTwoColRow(seat, 'right'))}

                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-gradient-to-r from-[#dff9ff]/10 to-[#7ef9ff]/15 px-2 text-[8.5px] font-mono text-[#7ef9ff] font-bold">
                  ↓ Door Entry · Starts Seat 1
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MATRIX VIEW */
        <div className="rounded-[24px] border border-[#7ef9ff]/20 bg-[#040d18] p-2 sm:p-3">
          <div className="mx-auto grid max-w-4xl grid-cols-11 items-center gap-2">
            {/* West Wing Grid (31–58) */}
            <div className="col-span-5">
              <span className="mb-1 block text-[10px] font-bold text-[#8fe7ff]">West Wing (31–58) · From Back Wall</span>
              <div className="grid grid-cols-3 justify-items-center gap-1.5 sm:grid-cols-4">
                {westSeats.map((seat) => (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    onClick={() => {
                      if (interactive) {
                        setSelectedSeat(seat);
                        onSelectSeat?.(seat.seatNumber);
                      }
                    }}
                    className={`flex h-7 w-full max-w-24 items-center justify-center rounded-lg border text-[9px] font-mono font-bold ${
                      seat.isMySeat
                        ? 'border-[#f7d77b] bg-gradient-to-r from-[#f7d77b] via-[#f2bf63] to-[#d7a14a] text-[#071521]'
                        : seat.isOccupied
                          ? 'border-[#213a55] bg-[#111f32] text-[#8aa7c6]'
                          : 'border-[#1f7d74]/60 bg-[#0d2d2e]/90 text-[#aefae3]'
                    }`}
                  >
                    Seat {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-1 mx-auto py-4 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-white/60 [writing-mode:vertical-rl] rotate-180">
              Aisle
            </div>

            {/* East Wing Grid (1–30) */}
            <div className="col-span-5">
              <span className="mb-1 block text-[10px] font-bold text-[#8fe7ff]">East Wing (1–30) · From Door</span>
              <div className="grid grid-cols-3 justify-items-center gap-1.5 sm:grid-cols-4">
                {eastSeats.map((seat) => (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    onClick={() => {
                      if (interactive) {
                        setSelectedSeat(seat);
                        onSelectSeat?.(seat.seatNumber);
                      }
                    }}
                    className={`flex h-7 w-full max-w-24 items-center justify-center rounded-lg border text-[9px] font-mono font-bold ${
                      seat.isMySeat
                        ? 'border-[#f7d77b] bg-gradient-to-r from-[#f7d77b] via-[#f2bf63] to-[#d7a14a] text-[#071521]'
                        : seat.isOccupied
                          ? 'border-[#213a55] bg-[#111f32] text-[#8aa7c6]'
                          : 'border-[#1f7d74]/60 bg-[#0d2d2e]/90 text-[#aefae3]'
                    }`}
                  >
                    Seat {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Seat Inspector Modal / Card */}
      <AnimatePresence>
        {selectedSeat && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-[#7ef9ff]/25 bg-white/[0.04] p-2 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                  selectedSeat.isMySeat
                    ? 'bg-gradient-to-r from-[#f7d77b] via-[#f2bf63] to-[#d7a14a] text-[#071521]'
                    : selectedSeat.isOccupied
                      ? 'bg-[#334155] text-white'
                      : 'bg-[#6ee7b7] text-[#071521]'
                }`}
              >
                Seat {selectedSeat.seatNumber}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-ui)] text-xs font-bold text-white">
                  Seat {selectedSeat.seatNumber} ({selectedSeat.seatNumber <= 30 ? 'East Wing · Starts at Door' : 'West Wing · From Back Wall'})
                </span>
                {selectedSeat.isMySeat ? (
                  <span className="rounded-full bg-[#f7d77b] px-1.5 py-0.5 text-[9px] font-bold text-[#071521]">
                    Your assigned desk
                  </span>
                ) : selectedSeat.isOccupied ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#334155] px-1.5 py-0.5 text-[9px] font-medium text-[#CBD5E1]">
                    <UserCheck className="h-2.5 w-2.5" /> Allocated to other person
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-[#6ee7b7]/50 bg-[#6ee7b7]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#aefae3]">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Available for allocation
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="rounded-full p-1 text-white/60 transition-colors hover:text-white"
              title="Close preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-[10px] text-white/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-[#6ee7b7] border border-[#6ee7b7]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex h-2 w-2 items-center justify-center rounded bg-[#111f32] border border-white/20">
              <span className="h-1 w-1 rounded-full bg-[#f87171]" />
            </span>
            <span>Allocated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-[#f7d77b] shadow-[0_0_6px_rgba(247,215,123,0.7)]" />
            <span className="font-semibold text-[#f9e4a6]">Your seat</span>
          </div>
        </div>

        <span className="hidden font-mono text-[9px] text-white/45 sm:inline">
          East: 1–30 (Door to Back) • West: 31–58 (Back to Door)
        </span>
      </div>
    </div>
  );
};

export default SeatMap;