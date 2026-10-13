import React, { useEffect, useState } from 'react';
import { Armchair, Check, AlertCircle, RefreshCw } from 'lucide-react';
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

  const displaySeats =
    activeWing === 'east'
      ? eastSeats
      : activeWing === 'west'
      ? westSeats
      : seats;

  const handleSeatClick = (seat: SeatItem) => {
    if (selectedSeat === String(seat.seatNumber)) {
      onSelectSeat(''); // deselect
      return;
    }
    onSelectSeat(String(seat.seatNumber));
  };

  return (
    <div className="rounded-xl border border-[#dce8f0] bg-white p-3.5 space-y-3">
      {/* Header with Stats & Wing Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf4f8] pb-2.5">
        <div className="flex items-center gap-2">
          <Armchair className="h-4 w-4 text-[#087d99]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#0b1d2e]">
            Select Seat from Floor Map
          </span>
          <button
            type="button"
            onClick={fetchSeats}
            className="text-[#65788c] hover:text-[#087d99] transition-colors p-1"
            title="Refresh seat availability"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {availableCount} Available
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {occupiedCount} Occupied
          </span>
        </div>
      </div>

      {/* Wing Tabs & Quick Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#f4f9fc] p-0.5 rounded-lg border border-[#e2edf3] text-xs">
          <button
            type="button"
            onClick={() => setActiveWing('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeWing === 'all'
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
            }`}
          >
            All (1–58)
          </button>
          <button
            type="button"
            onClick={() => setActiveWing('east')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeWing === 'east'
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
            }`}
          >
            East Wing (1–30)
          </button>
          <button
            type="button"
            onClick={() => setActiveWing('west')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeWing === 'west'
                ? 'bg-white text-[#087d99] shadow-xs'
                : 'text-[#65788c] hover:text-[#0b1d2e]'
            }`}
          >
            West Wing (31–58)
          </button>
        </div>

        {selectedSeat && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#087d99] bg-[#e7faff] px-2.5 py-1 rounded-lg border border-[#cbe4ed]">
              Selected: Seat {selectedSeat}
            </span>
            <button
              type="button"
              onClick={() => onSelectSeat('')}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Seat
            </button>
          </div>
        )}
      </div>

      {/* Seat Buttons Grid */}
      <div className="max-h-52 overflow-y-auto pr-1">
        {loading && seats.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#65788c]">
            Loading floor map seats...
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
            {displaySeats.map((seat) => {
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
                  className={`relative flex flex-col items-center justify-center rounded-lg border py-1.5 px-1 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-[#087d99] bg-[#071521] text-[#7ef9ff] shadow-sm scale-105 z-10 ring-2 ring-[#7ef9ff]/40'
                      : isOccupied
                      ? 'border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100 hover:border-rose-300'
                      : 'border-[#dce8f0] bg-white text-[#0b1d2e] hover:border-[#13b8c8] hover:bg-[#f0fbfd]'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {isSelected && <Check size={11} className="text-[#7ef9ff]" />}
                    <span>{seat.seatNumber}</span>
                  </div>
                  <span
                    className={`text-[9px] font-normal truncate max-w-full leading-none mt-0.5 ${
                      isSelected
                        ? 'text-[#a0cadb]'
                        : isOccupied
                        ? 'text-rose-600 font-semibold'
                        : 'text-emerald-600'
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
              <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
                <AlertCircle size={14} className="shrink-0 text-amber-600" />
                <span>
                  <strong>Note:</strong> Seat {selectedSeat} is currently assigned to{' '}
                  <span className="font-bold">{matched.studentName || 'another student'}</span>. Reassigning will update their desk allocation.
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
