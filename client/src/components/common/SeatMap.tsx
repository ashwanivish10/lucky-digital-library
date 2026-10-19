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
    <div className={`w-full overflow-hidden rounded-[28px] border border-[#e7e5e4] bg-white text-[#1c1917] shadow-[0_12px_30px_rgba(28,25,23,0.06)] ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>

      {showControls && (
        <div className="my-2 space-y-2 rounded-2xl border border-[#e7e5e4] bg-[#f5f3ef]/50 p-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">
                Attendance Schedule (24×7 Open · 58 Seats)
              </p>
              <button
                type="button"
                onClick={() => setSeatDays([...WEEK_DAYS])}
                className="text-[10px] font-bold text-[#d97706] hover:underline"
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
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      selected
                        ? 'border-[#d97706] bg-[#fef3c7] text-[#b45309]'
                        : 'border-[#e7e5e4] bg-white text-[#78716c] hover:border-[#d6d3d1]'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e7e5e4] pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Shift</span>
              <input
                type="time"
                value={seatStartTime}
                onChange={(e) => setSeatStartTime(e.target.value)}
                className="rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1 text-[11px] font-mono text-[#1c1917]"
              />
              <span className="text-[#a8a29e]">to</span>
              <input
                type="time"
                value={seatEndTime}
                onChange={(e) => setSeatEndTime(e.target.value)}
                className="rounded-lg border border-[#e7e5e4] bg-white px-2.5 py-1 text-[11px] font-mono text-[#1c1917]"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-[#e7e5e4] bg-white p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#d97706] font-bold text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                All (58)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('available')}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  filterMode === 'available'
                    ? 'bg-[#15803d] font-bold text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('occupied')}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  filterMode === 'occupied'
                    ? 'bg-[#44403c] font-bold text-white shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
              >
                Allocated ({occupiedCount})
              </button>
            </div>
          </div>
          {availabilityError && <p role="alert" className="text-[11px] text-red-600 font-medium">{availabilityError}</p>}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-28 sm:w-36">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716c]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search #..."
                  className="w-full rounded-full border border-[#e7e5e4] bg-white py-1 pl-7 pr-2.5 text-[11px] text-[#1c1917] placeholder:text-[#a8a29e] focus:border-[#d97706] focus:outline-none"
                />
              </div>

              <div className="flex items-center rounded-full border border-[#e7e5e4] bg-white p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('twocol')}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-mono transition-colors ${
                    viewMode === 'twocol' ? 'bg-[#d97706] text-white font-bold shadow-xs' : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                  title="Exact 2-column room sketch"
                >
                  <Columns className="h-3 w-3" />
                  <span className="hidden sm:inline">2-col</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-mono transition-colors ${
                    viewMode === 'matrix' ? 'bg-[#d97706] text-white font-bold shadow-xs' : 'text-[#78716c] hover:text-[#1c1917]'
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

      {loading && <p className="my-3 text-center text-xs text-[#78716c] font-medium">Checking live availability…</p>}
      {availabilityError && !showControls && <p role="alert" className="my-3 text-center text-xs text-red-600 font-medium">{availabilityError}</p>}

      {viewMode === 'twocol' ? (
        <div className="relative overflow-x-auto rounded-[24px] border border-[#e7e5e4] bg-[#f5f3ef] p-2.5 shadow-inner sm:p-3.5">
          <div className="mx-auto grid min-w-[36rem] max-w-3xl grid-cols-11 items-stretch gap-1.5 sm:gap-3">
            {/* WEST WING (31–58): Left wall. Starts from Back Wall (31) down to Door (58) */}
            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1.5 flex items-center justify-between border-b border-[#e7e5e4] pb-1.5 text-[10px]">
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#b45309]">West Wing (31–58)</span>
                <span className="font-mono text-[#78716c]">Left wall</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex h-[20px] items-center justify-center rounded-xl border border-dashed border-[#d97706]/30 bg-[#fef3c7]/60 px-2 text-[8.5px] font-mono text-[#b45309] font-bold">
                  ↑ Back Wall · Starts Seat 31
                </div>

                {/* West Wing: 31 down to 58 (not from door side, starting from back wall) */}
                {westSeats
                  .slice()
                  .sort((a, b) => a.seatNumber - b.seatNumber)
                  .map((seat) => {
                    const matched = isMatch(seat);
                    const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
                    const wingName = 'West Wing';

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
                        className={`h-[20px] w-full max-w-26 self-center px-2 flex items-center justify-between rounded-lg border text-[9.5px] font-mono transition-all duration-200 select-none ${
                          !matched ? 'opacity-20 pointer-events-none' : 'opacity-100'
                        } ${
                          seat.isMySeat
                            ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-extrabold border-[#b45309] shadow-sm z-10 scale-[1.02]'
                            : isSelected
                            ? 'bg-[#d97706]/15 text-[#1c1917] border-[#d97706] ring-1 ring-[#d97706] font-bold z-10'
                            : seat.isOccupied
                            ? 'bg-[#e7e5e4] text-[#57534e] border-[#d6d3d1]'
                            : 'bg-white text-[#15803d] border-[#15803d]/30 hover:border-[#15803d] hover:bg-[#f0fdf4]'
                        }`}
                      >
                        <>
                          <span className="flex items-center gap-1 font-semibold truncate leading-none">
                            <span>Seat {seat.seatNumber}</span>
                            {seat.isMySeat && (
                              <span className="text-[7.5px] bg-white text-[#b45309] px-1 rounded font-sans uppercase font-extrabold">
                                YOU
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                seat.isMySeat ? 'bg-white' : seat.isOccupied ? 'bg-[#ef4444]' : 'bg-[#15803d]'
                              }`}
                            />
                          </span>
                        </>
                      </button>
                    );
                  })}

                <div className="flex h-[20px] items-center justify-center rounded-xl border border-dashed border-[#e7e5e4] px-2 text-[8.5px] font-mono text-[#78716c]">
                  ↓ Door Side · Ends Seat 58
                </div>
              </div>
            </div>

            {/* CENTER WALKWAY AISLE: Back Wall at Top, Door at Bottom */}
            <div className="relative col-span-1 flex flex-col items-center justify-between py-1">
              <div className="z-10 w-full rounded-xl border border-[#e7e5e4] bg-white px-1 py-1 text-center shadow-xs">
                <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-[#d97706]">Back wall</span>
                <span className="mt-0.5 block text-[7px] text-[#78716c]">Silent</span>
              </div>

              <div className="relative my-auto flex flex-col items-center justify-center">
                <div className="absolute inset-y-0 w-0.5 border-r border-dashed border-[#d6d3d1]" />
                <div className="z-10 rounded-full border border-[#e7e5e4] bg-white px-0.5 py-3 text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#78716c] [writing-mode:vertical-rl] rotate-180 shadow-xs">
                  Walkway aisle
                </div>
                <span className="mt-1.5 text-[10px] text-[#d97706]">↓</span>
              </div>

              <div className="z-10 w-full rounded-xl border border-[#d97706]/40 bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#f59e0b] px-1 py-1 text-center text-[#78350f] shadow-sm">
                <div className="flex items-center justify-center gap-1 leading-none">
                  <DoorOpen className="h-2.5 w-2.5" />
                  <span className="text-[8px] font-black uppercase tracking-[0.18em]">Door</span>
                </div>
                <span className="mt-0.5 block text-[7px] font-bold text-[#78350f]">Entry</span>
              </div>
            </div>

            {/* EAST WING (1–30): Right wall. Starts from Door (Seat 1) up to Back Wall (Seat 30) */}
            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1.5 flex items-center justify-between border-b border-[#e7e5e4] pb-1.5 text-[10px]">
                <span className="font-mono text-[#78716c]">Right wall</span>
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#b45309]">East Wing (1–30)</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex h-[20px] items-center justify-center rounded-xl border border-dashed border-[#d97706]/30 bg-[#fef3c7]/60 px-2 text-[8.5px] font-mono text-[#b45309] font-bold">
                  ↑ Back Wall · Seat 30
                </div>

                {/* East Wing: Rendered top-to-bottom so 30 is at the top (Back wall) and 1 is at the bottom (Door) */}
                {eastSeats
                  .slice()
                  .sort((a, b) => b.seatNumber - a.seatNumber)
                  .map((seat) => {
                    const matched = isMatch(seat);
                    const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
                    const wingName = 'East Wing';

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
                        className={`h-[20px] w-full max-w-26 self-center px-2 flex items-center justify-between rounded-lg border text-[9.5px] font-mono transition-all duration-200 select-none ${
                          !matched ? 'opacity-20 pointer-events-none' : 'opacity-100'
                        } ${
                          seat.isMySeat
                            ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-extrabold border-[#b45309] shadow-sm z-10 scale-[1.02]'
                            : isSelected
                            ? 'bg-[#d97706]/15 text-[#1c1917] border-[#d97706] ring-1 ring-[#d97706] font-bold z-10'
                            : seat.isOccupied
                            ? 'bg-[#e7e5e4] text-[#57534e] border-[#d6d3d1]'
                            : 'bg-white text-[#15803d] border-[#15803d]/30 hover:border-[#15803d] hover:bg-[#f0fdf4]'
                        }`}
                      >
                        <>
                          <span className="flex items-center gap-1 shrink-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                seat.isMySeat ? 'bg-white' : seat.isOccupied ? 'bg-[#ef4444]' : 'bg-[#15803d]'
                              }`}
                            />
                          </span>
                          <span className="flex items-center gap-1 font-semibold truncate leading-none">
                            {seat.isMySeat && (
                              <span className="text-[7.5px] bg-white text-[#b45309] px-1 rounded font-sans uppercase font-extrabold">
                                YOU
                              </span>
                            )}
                            <span>Seat {seat.seatNumber}</span>
                          </span>
                        </>
                      </button>
                    );
                  })}

                <div className="flex h-[20px] items-center justify-center rounded-xl border border-dashed border-[#d97706]/40 bg-[#fef3c7] px-2 text-[8.5px] font-mono text-[#b45309] font-extrabold">
                  ↓ Door Entry · Starts Seat 1
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MATRIX VIEW */
        <div className="overflow-x-auto rounded-[24px] border border-[#e7e5e4] bg-[#f5f3ef] p-2.5 sm:p-3.5">
          <div className="mx-auto grid min-w-[36rem] max-w-4xl grid-cols-11 items-center gap-2">
            {/* West Wing Grid (31–58) */}
            <div className="col-span-5">
              <span className="mb-1.5 block text-[10px] font-bold text-[#b45309]">West Wing (31–58) · From Back Wall</span>
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
                    className={`flex h-7 w-full max-w-24 items-center justify-center rounded-lg border text-[9.5px] font-mono font-bold ${
                      seat.isMySeat
                        ? 'border-[#b45309] bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-xs'
                        : seat.isOccupied
                          ? 'border-[#d6d3d1] bg-[#e7e5e4] text-[#57534e]'
                          : 'border-[#15803d]/30 bg-white text-[#15803d] hover:bg-[#f0fdf4]'
                    }`}
                  >
                    Seat {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-1 mx-auto py-4 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-[#78716c] [writing-mode:vertical-rl] rotate-180">
              Aisle
            </div>

            {/* East Wing Grid (1–30) */}
            <div className="col-span-5">
              <span className="mb-1.5 block text-[10px] font-bold text-[#b45309]">East Wing (1–30) · From Door</span>
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
                    className={`flex h-7 w-full max-w-24 items-center justify-center rounded-lg border text-[9.5px] font-mono font-bold ${
                      seat.isMySeat
                        ? 'border-[#b45309] bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-xs'
                        : seat.isOccupied
                          ? 'border-[#d6d3d1] bg-[#e7e5e4] text-[#57534e]'
                          : 'border-[#15803d]/30 bg-white text-[#15803d] hover:bg-[#f0fdf4]'
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
            className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-[#d97706]/30 bg-white p-2.5 text-xs shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                  selectedSeat.isMySeat
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white'
                    : selectedSeat.isOccupied
                      ? 'bg-[#e7e5e4] text-[#57534e]'
                      : 'bg-[#15803d]/15 text-[#15803d]'
                }`}
              >
                {selectedSeat.seatNumber}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-ui)] text-xs font-bold text-[#1c1917]">
                  Seat {selectedSeat.seatNumber} ({selectedSeat.seatNumber <= 30 ? 'East Wing · Starts at Door' : 'West Wing · From Back Wall'})
                </span>
                {selectedSeat.isMySeat ? (
                  <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[9px] font-bold text-[#b45309] border border-[#f59e0b]/40">
                    Your assigned desk
                  </span>
                ) : selectedSeat.isOccupied ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#e7e5e4] px-2 py-0.5 text-[9px] font-medium text-[#57534e]">
                    <UserCheck className="h-2.5 w-2.5" /> Allocated to other person
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-[#15803d]/30 bg-[#f0fdf4] px-2 py-0.5 text-[9px] font-bold text-[#15803d]">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Available for allocation
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="rounded-full p-1 text-[#78716c] transition-colors hover:text-[#1c1917]"
              title="Close preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[#e7e5e4] pt-2 text-[10px] text-[#78716c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-[#15803d]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex h-2 w-2 items-center justify-center rounded bg-[#e7e5e4] border border-[#d6d3d1]">
              <span className="h-1 w-1 rounded-full bg-[#ef4444]" />
            </span>
            <span>Allocated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-gradient-to-r from-[#f59e0b] to-[#d97706] shadow-xs" />
            <span className="font-semibold text-[#b45309]">Your seat</span>
          </div>
        </div>

        <span className="hidden font-mono text-[9px] text-[#a8a29e] sm:inline">
          East: 1–30 (Door to Back) • West: 31–58 (Back to Door)
        </span>
      </div>
    </div>
  );
};

export default SeatMap;