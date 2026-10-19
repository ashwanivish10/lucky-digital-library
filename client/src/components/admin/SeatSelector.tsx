import React, { useEffect, useState } from 'react';
import { Armchair, Check, AlertCircle, RefreshCw, Search, Sparkles, Clock } from 'lucide-react';
import { studentsApi } from '../../lib/api';

function formatTo12Hr(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const padHour = String(hour12).padStart(2, '0');
  const padMin = String(m || 0).padStart(2, '0');
  return `${padHour}:${padMin} ${period}`;
}

export interface BookedShift {
  studentName?: string;
  studentCode?: string;
  shiftTimings?: string;
  seatStartTime?: string;
  seatEndTime?: string;
  isOverlapping?: boolean;
}

export interface SeatItem {
  seatNumber: number;
  label: string;
  wing: string;
  isOccupied: boolean;
  isShared?: boolean;
  studentName?: string;
  studentCode?: string;
  bookedShifts?: BookedShift[];
}

export interface SeatSelectorProps {
  selectedSeat: string;
  onSelectSeat: (seatNum: string) => void;
  startTime?: string;
  endTime?: string;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  selectedSeat,
  onSelectSeat,
  startTime,
  endTime,
}) => {
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWing, setActiveWing] = useState<'all' | 'east' | 'west'>('all');
  const [seatSearch, setSeatSearch] = useState('');

  const fetchSeats = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (startTime && endTime) {
      params.startTime = startTime;
      params.endTime = endTime;
    }

    studentsApi
      .getSeatMap(params)
      .then((res) => {
        if (res.data?.data?.seats) {
          setSeats(res.data.data.seats);
        }
      })
      .catch((err) => {
        console.error('Failed to load seats:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSeats();
  }, [startTime, endTime]);

  const totalSeats = seats.length || 58;
  const occupiedCount = seats.filter((s) => s.isOccupied).length;
  const sharedCount = seats.filter((s) => !s.isOccupied && s.isShared).length;
  const availableCount = totalSeats - occupiedCount;

  const eastSeats = seats.filter((s) => s.seatNumber <= 30);
  const westSeats = seats.filter((s) => s.seatNumber > 30);

  let filteredSeats =
    activeWing === 'east'
      ? eastSeats
      : activeWing === 'west'
      ? westSeats
      : seats;

  if (seatSearch.trim()) {
    const q = seatSearch.trim().toLowerCase();
    filteredSeats = filteredSeats.filter(
      (s) =>
        String(s.seatNumber).includes(q) ||
        s.studentName?.toLowerCase().includes(q) ||
        s.bookedShifts?.some((b) => b.studentName?.toLowerCase().includes(q))
    );
  }

  const handleSeatClick = (seat: SeatItem) => {
    if (selectedSeat === String(seat.seatNumber)) {
      onSelectSeat(''); // deselect
      return;
    }
    onSelectSeat(String(seat.seatNumber));
  };

  return (
    <div className="rounded-2xl border border-[#e8dcc8] bg-white p-3.5 sm:p-4.5 space-y-3.5 shadow-xs">
      {/* Header with Stats & Live Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f0e6] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5ead4] text-[#a38b52]">
            <Armchair className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2c1f0e] block leading-tight">
                Floor Seat Map
              </span>
              {startTime && endTime && (
                <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#f5ead4] text-[#a38b52] border border-[#cbe4ed]">
                  <Clock size={10} />
                  {formatTo12Hr(startTime)} – {formatTo12Hr(endTime)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#8a7a60]">Tap any seat to select</span>
          </div>
          <button
            type="button"
            onClick={fetchSeats}
            className="text-[#8a7a60] hover:text-[#a38b52] transition-colors p-1 rounded-md hover:bg-[#f1f7fa] ml-1"
            title="Refresh seat availability"
            aria-label="Refresh seats"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {availableCount} Free
          </span>
          {sharedCount > 0 && (
            <span className="flex items-center gap-1 font-semibold text-[#a38b52] bg-[#f5ead4] border border-[#cbe4ed] px-2.5 py-1 rounded-full">
              <Sparkles size={11} className="text-[#c2a66e]" />
              {sharedCount} Shared (Open)
            </span>
          )}
          <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {occupiedCount} Taken
          </span>
        </div>
      </div>

      {/* Shift Context Indicator for Mobile */}
      {startTime && endTime && (
        <div className="xs:hidden flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#f0fbfd] border border-[#cbe4ed] text-[11px] text-[#a38b52]">
          <span className="font-semibold flex items-center gap-1">
            <Clock size={12} className="text-[#c2a66e]" /> Checking Shift:
          </span>
          <span className="font-bold">{formatTo12Hr(startTime)} – {formatTo12Hr(endTime)}</span>
        </div>
      )}

      {/* Wing Filter Tabs & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 bg-[#faf6f0] p-1 rounded-xl border border-[#e2edf3] text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveWing('all');
              setSeatSearch('');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
              activeWing === 'all'
                ? 'bg-white text-[#a38b52] shadow-xs'
                : 'text-[#8a7a60] hover:text-[#2c1f0e]'
            }`}
          >
            All (1–58)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveWing('east');
              setSeatSearch('');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
              activeWing === 'east'
                ? 'bg-white text-[#a38b52] shadow-xs'
                : 'text-[#8a7a60] hover:text-[#2c1f0e]'
            }`}
          >
            East Wing (1–30)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveWing('west');
              setSeatSearch('');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
              activeWing === 'west'
                ? 'bg-white text-[#a38b52] shadow-xs'
                : 'text-[#8a7a60] hover:text-[#2c1f0e]'
            }`}
          >
            West Wing (31–58)
          </button>
        </div>

        {/* Quick seat search on mobile/desktop */}
        <div className="relative flex-1 sm:max-w-[160px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7b90a3]" />
          <input
            type="text"
            inputMode="numeric"
            value={seatSearch}
            onChange={(e) => setSeatSearch(e.target.value)}
            placeholder="Find seat #"
            className="w-full rounded-lg border border-[#cfdce6] bg-[#f8fbfd] py-1.5 pl-8 pr-2.5 text-xs text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Selected Seat Banner */}
      {selectedSeat && (
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#071521] to-[#122e44] px-3.5 py-2 text-white text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#e8d5a8]" />
            <span className="font-bold text-[#e8d5a8]">
              Selected: Seat {selectedSeat}
            </span>
            <span className="text-white/60 text-[11px] hidden xs:inline">
              ({Number(selectedSeat) <= 30 ? 'East Wing' : 'West Wing'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectSeat('')}
            className="text-[11px] font-bold text-rose-300 hover:text-white underline hover:no-underline px-2 py-0.5 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Seat Buttons Grid: Ultra-responsive on mobile (5 cols on mobile, up to 10 on desktop) */}
      <div className="max-h-64 sm:max-h-60 overflow-y-auto pr-1 -mr-1 overscroll-contain">
        {loading && seats.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8a7a60]">
            Loading floor map seats...
          </div>
        ) : filteredSeats.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8a7a60]">
            No seats found matching "{seatSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-1.5">
            {filteredSeats.map((seat) => {
              const isSelected = selectedSeat === String(seat.seatNumber);
              const isOccupied = seat.isOccupied;
              const isShared = !isOccupied && !!seat.isShared;

              const occupantTooltip = isOccupied
                ? `Seat ${seat.seatNumber} (Taken during this shift by ${seat.studentName || 'Student'})`
                : isShared
                ? `Seat ${seat.seatNumber} (Shared Desk - Open for this shift)`
                : `Seat ${seat.seatNumber} (Completely Vacant)`;

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  onClick={() => handleSeatClick(seat)}
                  title={occupantTooltip}
                  className={`relative flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs font-bold transition-all min-h-[46px] select-none active:scale-95 ${
                    isSelected
                      ? 'border-[#a38b52] bg-[#071521] text-[#e8d5a8] shadow-md ring-2 ring-[#e8d5a8]/50 scale-[1.03] z-10'
                      : isOccupied
                      ? 'border-rose-200 bg-rose-50/80 text-rose-800 hover:bg-rose-100 hover:border-rose-300'
                      : isShared
                      ? 'border-[#76d6e6] bg-[#f0fbfd] text-[#a38b52] hover:border-[#c2a66e] hover:bg-[#e4f8fc]'
                      : 'border-[#e8dcc8] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd]'
                  }`}
                >
                  <div className="flex items-center gap-0.5 font-[family-name:var(--font-ui)]">
                    {isSelected ? (
                      <Check size={11} className="text-[#e8d5a8]" />
                    ) : null}
                    <span className="text-xs sm:text-[13px]">{seat.seatNumber}</span>
                  </div>
                  <span
                    className={`text-[9px] truncate max-w-full leading-none mt-0.5 ${
                      isSelected
                        ? 'text-[#a0cadb] font-semibold'
                        : isOccupied
                        ? 'text-rose-600 font-semibold'
                        : isShared
                        ? 'text-[#a38b52] font-bold'
                        : 'text-emerald-600 font-medium'
                    }`}
                  >
                    {isOccupied ? 'Taken' : isShared ? 'Shared' : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected seat occupant feedback & warning */}
      {selectedSeat && (
        (() => {
          const matched = seats.find((s) => String(s.seatNumber) === selectedSeat);
          if (!matched) return null;

          if (matched.isOccupied) {
            const conflictShift = matched.bookedShifts?.find((b) => b.isOverlapping)?.shiftTimings;
            return (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50/90 px-3.5 py-2.5 text-xs text-rose-900 animate-fade-in">
                <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold">
                    Shift Conflict: Seat {selectedSeat} is already booked!
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    Currently assigned to <span className="font-bold">{matched.studentName || 'another student'}</span>
                    {conflictShift ? ` during ${conflictShift}` : ''}.
                    Please choose another seat or non-overlapping hours.
                  </div>
                </div>
              </div>
            );
          }

          if (matched.isShared) {
            const otherOccupants = matched.bookedShifts?.map((b) => `${b.studentName || 'Student'} (${b.shiftTimings || 'Other Shift'})`).join(', ');
            return (
              <div className="flex items-start gap-2.5 rounded-xl border border-[#9ae6f0] bg-[#f0fbfd] px-3.5 py-2.5 text-xs text-[#065b70] animate-fade-in">
                <Sparkles size={15} className="shrink-0 text-[#c2a66e] mt-0.5" />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Time-Shared Desk Available!
                    <span className="text-[10px] bg-[#f5ead4] text-[#a38b52] px-1.5 py-0.5 rounded font-semibold border border-[#cbe4ed]">
                      No Conflict
                    </span>
                  </div>
                  <div className="text-[11px] text-[#a38b52] mt-0.5">
                    Seat {selectedSeat} is open for your chosen shift. Other shift(s) on this desk: <span className="font-semibold">{otherOccupants || 'Active in another shift'}</span>.
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900 animate-fade-in">
              <Check size={14} className="shrink-0 text-emerald-600" />
              <span>
                <strong>Vacant Desk:</strong> Seat {selectedSeat} is completely free with no other occupants.
              </span>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default SeatSelector;
