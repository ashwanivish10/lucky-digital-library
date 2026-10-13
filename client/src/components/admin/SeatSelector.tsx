import React, { useEffect, useState } from 'react';
import { Armchair, Check, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { studentsApi } from '../../lib/api';

interface SeatItem {
  seatNumber: number;
  label: string;
  wing: string;
  isOccupied: boolean;
  studentName?: string;
  studentCode?: string;
}

interface SeatSelectorProps {
  selectedSeat: string;
  onSelectSeat: (seatNum: string) => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  selectedSeat,
  onSelectSeat,
}) => {
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWing, setActiveWing] = useState<'all' | 'east' | 'west'>('all');
  const [seatSearch, setSeatSearch] = useState('');

  const fetchSeats = () => {
    setLoading(true);
    studentsApi
      .getSeatMap()
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
  }, []);

  const totalSeats = seats.length || 58;
  const occupiedCount = seats.filter((s) => s.isOccupied).length;
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
        s.studentName?.toLowerCase().includes(q)
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
    <div className="rounded-2xl border border-[#dce8f0] bg-white p-3.5 sm:p-4.5 space-y-3.5 shadow-xs">
      {/* Header with Stats & Live Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf4f8] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e7faff] text-[#087d99]">
            <Armchair className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0b1d2e] block leading-tight">
              Floor Seat Map
            </span>
            <span className="text-[10px] text-[#65788c]">Tap any seat to select</span>
          </div>
          <button
            type="button"
            onClick={fetchSeats}
            className="text-[#65788c] hover:text-[#087d99] transition-colors p-1 rounded-md hover:bg-[#f1f7fa] ml-1"
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
          <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {occupiedCount} Occupied
          </span>
        </div>
      </div>

      {/* Wing Filter Tabs & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 bg-[#f4f9fc] p-1 rounded-xl border border-[#e2edf3] text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveWing('all');
              setSeatSearch('');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
              activeWing === 'all'
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
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
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
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
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
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
            className="w-full rounded-lg border border-[#cfdce6] bg-[#f8fbfd] py-1.5 pl-8 pr-2.5 text-xs text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Selected Seat Banner */}
      {selectedSeat && (
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#071521] to-[#122e44] px-3.5 py-2 text-white text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#7ef9ff]" />
            <span className="font-bold text-[#7ef9ff]">
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
          <div className="py-10 text-center text-xs text-[#65788c]">
            Loading floor map seats...
          </div>
        ) : filteredSeats.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#65788c]">
            No seats found matching "{seatSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-1.5">
            {filteredSeats.map((seat) => {
              const isSelected = selectedSeat === String(seat.seatNumber);
              const isOccupied = seat.isOccupied;

              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  onClick={() => handleSeatClick(seat)}
                  title={
                    isOccupied
                      ? `Seat ${seat.seatNumber} (Occupied by ${seat.studentName || 'Student'})`
                      : `Seat ${seat.seatNumber} (Available)`
                  }
                  className={`relative flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs font-bold transition-all min-h-[46px] select-none active:scale-95 ${
                    isSelected
                      ? 'border-[#087d99] bg-[#071521] text-[#7ef9ff] shadow-md ring-2 ring-[#7ef9ff]/50 scale-[1.03] z-10'
                      : isOccupied
                      ? 'border-rose-200 bg-rose-50/80 text-rose-800 hover:bg-rose-100 hover:border-rose-300'
                      : 'border-[#dce8f0] bg-white text-[#0b1d2e] hover:border-[#13b8c8] hover:bg-[#f0fbfd]'
                  }`}
                >
                  <div className="flex items-center gap-0.5 font-[family-name:var(--font-ui)]">
                    {isSelected ? (
                      <Check size={11} className="text-[#7ef9ff]" />
                    ) : null}
                    <span className="text-xs sm:text-[13px]">{seat.seatNumber}</span>
                  </div>
                  <span
                    className={`text-[9px] truncate max-w-full leading-none mt-0.5 ${
                      isSelected
                        ? 'text-[#a0cadb] font-semibold'
                        : isOccupied
                        ? 'text-rose-600 font-semibold'
                        : 'text-emerald-600 font-medium'
                    }`}
                  >
                    {isOccupied ? 'Taken' : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected seat occupant warning if occupied */}
      {selectedSeat && (
        (() => {
          const matched = seats.find((s) => String(s.seatNumber) === selectedSeat);
          if (matched?.isOccupied) {
            return (
              <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs text-amber-900 animate-fade-in">
                <AlertCircle size={15} className="shrink-0 text-amber-600" />
                <span>
                  <strong>Occupied Desk:</strong> Seat {selectedSeat} is currently assigned to{' '}
                  <span className="font-bold">{matched.studentName || 'another student'}</span>. Selecting will update desk assignment.
                </span>
              </div>
            );
          }
          return null;
        })()
      )}
    </div>
  );
};

export default SeatSelector;
