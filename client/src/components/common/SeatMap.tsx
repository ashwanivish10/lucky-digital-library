// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Armchair,
//   Zap,
//   Wifi,
//   Lamp,
//   DoorOpen,
//   Sparkles,
//   Search,
//   UserCheck,
//   CheckCircle2,
//   X,
//   Columns,
//   LayoutGrid,
// } from 'lucide-react';
// import { studentsApi } from '../../lib/api';

// export interface SeatData {
//   seatNumber: number;
//   label: string;
//   side: 'left' | 'right';
//   isOccupied: boolean;
//   isMySeat: boolean;
//   studentCode?: string;
//   studentName?: string;
// }

// interface SeatMapProps {
//   /** If specified, this seat number will be actively highlighted as the student's seat */
//   highlightSeat?: number | string | null;
//   /** Allow clicking a seat to inspect it */
//   interactive?: boolean;
//   /** Show legend and search header */
//   showControls?: boolean;
//   /** Compact mode for smaller viewports or embedded widgets */
//   compact?: boolean;
//   /** Callback when user selects a seat */
//   onSelectSeat?: (seatNumber: number) => void;
// }

// export const SeatMap: React.FC<SeatMapProps> = ({
//   highlightSeat,
//   interactive = true,
//   showControls = true,
//   compact = false,
//   onSelectSeat,
// }) => {
//   const [seats, setSeats] = useState<SeatData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
//   const [filterMode, setFilterMode] = useState<'all' | 'available' | 'occupied'>('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState<'twocol' | 'matrix'>('twocol');
//   const mySeatRef = useRef<HTMLButtonElement | null>(null);

//   // Normalize highlightSeat prop to number if given
//   const targetSeatNum = React.useMemo(() => {
//     if (!highlightSeat) return null;
//     const match = String(highlightSeat).match(/\d+/);
//     return match ? parseInt(match[0], 10) : null;
//   }, [highlightSeat]);

//   // Fetch real-time seat availability
//   useEffect(() => {
//     let isMounted = true;
//     setLoading(true);

//     studentsApi
//       .getSeatMap()
//       .then((res) => {
//         if (!isMounted) return;
//         const apiSeats: SeatData[] = res.data?.data?.seats || [];

//         // If prop passed an explicit highlight seat, mark it as isMySeat
//         const adjustedSeats = apiSeats.map((s) => ({
//           ...s,
//           isMySeat: targetSeatNum ? s.seatNumber === targetSeatNum : s.isMySeat,
//         }));

//         setSeats(adjustedSeats);

//         // Pre-select student's seat if assigned
//         const mySeat = adjustedSeats.find((s) => s.isMySeat);
//         if (mySeat) {
//           setSelectedSeat(mySeat);
//         }
//       })
//       .catch((err) => {
//         console.error('Failed to load seat map data, using fallback structure:', err);
//         const fallback: SeatData[] = [];
//         for (let i = 1; i <= 64; i++) {
//           fallback.push({
//             seatNumber: i,
//             label: `Seat ${i}`,
//             side: i <= 31 ? 'left' : 'right',
//             isOccupied: i % 4 === 0,
//             isMySeat: targetSeatNum ? i === targetSeatNum : false,
//           });
//         }
//         if (isMounted) setSeats(fallback);
//       })
//       .finally(() => {
//         if (isMounted) setLoading(false);
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, [targetSeatNum]);

//   // Split into Left (1–31) and Right (32–64)
//   const leftSeats = seats.filter((s) => s.seatNumber >= 1 && s.seatNumber <= 31);
//   const rightSeats = seats.filter((s) => s.seatNumber >= 32 && s.seatNumber <= 64);

//   // Filtered check
//   const isMatch = (s: SeatData) => {
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase().trim();
//       const numMatch = String(s.seatNumber).includes(q);
//       const nameMatch = s.studentName?.toLowerCase().includes(q) || false;
//       if (!numMatch && !nameMatch) return false;
//     }
//     if (filterMode === 'available') return !s.isOccupied;
//     if (filterMode === 'occupied') return s.isOccupied;
//     return true;
//   };

//   const occupiedCount = seats.filter((s) => s.isOccupied).length;
//   const availableCount = seats.length - occupiedCount;
//   const mySeat = seats.find((s) => s.isMySeat);

//   // Helper for rendering a single seat in 2-Column Exact Sketch mode
//   const renderTwoColRow = (seat: SeatData, side: 'left' | 'right') => {
//     const matched = isMatch(seat);
//     const isSelected = selectedSeat?.seatNumber === seat.seatNumber;

//     return (
//       <button
//         type="button"
//         key={seat.seatNumber}
//         ref={seat.isMySeat ? mySeatRef : undefined}
//         onClick={() => {
//           if (interactive) {
//             setSelectedSeat(seat);
//             onSelectSeat?.(seat.seatNumber);
//           }
//         }}
//         title={`Desk #${seat.seatNumber} • ${side === 'left' ? 'West Wing' : 'East Wing'} • ${seat.isMySeat ? 'Your Reserved Seat' : seat.isOccupied ? 'Allocated to other person' : 'Available'}`}
//         className={`w-full h-[14.5px] sm:h-[15px] px-1 sm:px-2 flex items-center justify-between rounded-[4px] border text-[10px] sm:text-[11px] font-mono transition-all duration-100 select-none ${
//           !matched ? 'opacity-20 pointer-events-none' : 'opacity-100'
//         } ${
//           seat.isMySeat
//             ? 'bg-[#13b8c8] text-[#060A14] font-extrabold border-[#13b8c8] shadow-[0_0_8px_rgba(191,157,82,0.8)] z-10 scale-[1.02]'
//             : isSelected
//             ? 'bg-[#1E3A8A] text-white font-bold ring-1 ring-[#60A5FA] z-10'
//             : seat.isOccupied
//             ? 'bg-[#182335] text-[#94A3B8] border-white/5 hover:border-white/25 hover:bg-[#202E44]'
//             : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/30 hover:border-[#10B981]'
//         }`}
//       >
//         {side === 'left' ? (
//           <>
//             <span className="flex items-center gap-1 font-semibold truncate leading-none">
//               <span>{seat.seatNumber}</span>
//               {seat.isMySeat && (
//                 <span className="text-[7.5px] bg-[#060A14] text-[#13b8c8] px-0.5 rounded font-sans uppercase font-bold">
//                   YOU
//                 </span>
//               )}
//             </span>
//             <span className="flex items-center gap-1 shrink-0">
//               <span
//                 className={`w-1.5 h-1.5 rounded-full ${
//                   seat.isMySeat ? 'bg-[#060A14]' : seat.isOccupied ? 'bg-[#F43F5E]' : 'bg-[#10B981]'
//                 }`}
//               />
//               <Armchair className="w-2.5 h-2.5 opacity-70" />
//             </span>
//           </>
//         ) : (
//           <>
//             <span className="flex items-center gap-1 shrink-0">
//               <Armchair className="w-2.5 h-2.5 opacity-70" />
//               <span
//                 className={`w-1.5 h-1.5 rounded-full ${
//                   seat.isMySeat ? 'bg-[#060A14]' : seat.isOccupied ? 'bg-[#F43F5E]' : 'bg-[#10B981]'
//                 }`}
//               />
//             </span>
//             <span className="flex items-center gap-1 font-semibold truncate leading-none">
//               {seat.isMySeat && (
//                 <span className="text-[7.5px] bg-[#060A14] text-[#13b8c8] px-0.5 rounded font-sans uppercase font-bold">
//                   YOU
//                 </span>
//               )}
//               <span>{seat.seatNumber}</span>
//             </span>
//           </>
//         )}
//       </button>
//     );
//   };

//   return (
//     <div className={`w-full bg-[#0b1d2e] text-[#f4f9fc] rounded-2xl border border-[#13b8c8]/30 shadow-xl overflow-hidden ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>
//       {/* 1. Ultra-Compact Top Bar with Live Counts */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
//         <div className="flex items-center gap-2">
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#13b8c8]/15 text-[#087d99] font-[family-name:var(--font-ui)] text-[9.5px] font-bold uppercase tracking-wider border border-[#13b8c8]/30">
//             <Sparkles className="w-3 h-3 text-[#13b8c8]" />
//             64-Seat Layout
//           </span>
//           <h2 className="text-sm sm:text-base font-[family-name:var(--font-ui)] font-bold text-white tracking-wide">
//             Library Study Hall Layout
//           </h2>
//         </div>

//         {/* Live Status Indicators */}
//         <div className="flex items-center gap-2 flex-wrap text-xs">
//           <div className="flex items-center gap-1.5 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10 text-[11px]">
//             <span className="w-2 h-2 rounded-full bg-[#10B981]" />
//             <span className="text-[#8E9DB5]">Avail:</span>
//             <strong className="text-white font-mono">{availableCount}</strong>
//           </div>
//           <div className="flex items-center gap-1.5 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10 text-[11px]">
//             <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
//             <span className="text-[#8E9DB5]">Allocated:</span>
//             <strong className="text-white font-mono">{occupiedCount}</strong>
//           </div>
//           {mySeat && (
//             <div className="flex items-center gap-1.5 bg-[#13b8c8]/20 border border-[#13b8c8] px-2 py-0.5 rounded text-[11px] font-bold text-[#087d99]">
//               <Sparkles className="w-2.5 h-2.5 text-[#13b8c8]" />
//               <span>Your Seat: #{mySeat.seatNumber}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 2. Streamlined Controls (Filters, Search, View Toggle) */}
//       {showControls && (
//         <div className="flex items-center justify-between gap-2 my-2 bg-white/[0.02] p-1.5 rounded-lg border border-white/10 text-xs">
//           <div className="flex items-center gap-1">
//             <button
//               type="button"
//               onClick={() => setFilterMode('all')}
//               className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
//                 filterMode === 'all'
//                   ? 'bg-[#13b8c8] text-[#060A14] font-bold'
//                   : 'text-[#8E9DB5] hover:text-white'
//               }`}
//             >
//               All (64)
//             </button>
//             <button
//               type="button"
//               onClick={() => setFilterMode('available')}
//               className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
//                 filterMode === 'available'
//                   ? 'bg-[#10B981] text-[#060A14] font-bold'
//                   : 'text-[#8E9DB5] hover:text-white'
//               }`}
//             >
//               Available ({availableCount})
//             </button>
//             <button
//               type="button"
//               onClick={() => setFilterMode('occupied')}
//               className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
//                 filterMode === 'occupied'
//                   ? 'bg-[#334155] text-white font-bold'
//                   : 'text-[#8E9DB5] hover:text-white'
//               }`}
//             >
//               Allocated ({occupiedCount})
//             </button>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="relative w-28 sm:w-36">
//               <Search className="w-3 h-3 text-[#8E9DB5] absolute left-2 top-1/2 -translate-y-1/2" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search #..."
//                 className="w-full bg-[#060A14] text-white text-[11px] pl-6 pr-2 py-0.5 rounded border border-white/15 focus:outline-none focus:border-[#13b8c8] placeholder-[#8E9DB5]/50"
//               />
//             </div>

//             {/* View Mode Switch */}
//             <div className="flex items-center bg-[#060A14] rounded border border-white/15 p-0.5">
//               <button
//                 type="button"
//                 onClick={() => setViewMode('twocol')}
//                 className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors ${
//                   viewMode === 'twocol' ? 'bg-[#13b8c8] text-[#060A14] font-bold' : 'text-[#8E9DB5] hover:text-white'
//                 }`}
//                 title="Exact 2-Column Room Sketch (Seats 1-31 & 32-64)"
//               >
//                 <Columns className="w-3 h-3" />
//                 <span className="hidden sm:inline">2-Col</span>
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setViewMode('matrix')}
//                 className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors ${
//                   viewMode === 'matrix' ? 'bg-[#13b8c8] text-[#060A14] font-bold' : 'text-[#8E9DB5] hover:text-white'
//                 }`}
//                 title="Matrix View"
//               >
//                 <LayoutGrid className="w-3 h-3" />
//                 <span className="hidden sm:inline">Grid</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 3. THE 2-COLUMN STUDY HALL BLUEPRINT (Without Scrolling) */}
//       {viewMode === 'twocol' ? (
//         <div className="relative bg-[#060A14] rounded-xl border border-[#13b8c8]/30 p-2 sm:p-3 overflow-hidden shadow-inner">
//           {/* Main 2-Column Grid with Integrated Door & Wall Walkway */}
//           <div className="grid grid-cols-11 gap-1.5 sm:gap-3 items-stretch max-w-3xl mx-auto">
//             {/* ==================================================== */}
//             {/* LEFT COLUMN: West Wing (Desks 1 to 31) - 5 cols wide */}
//             {/* Rendered from Row 33 (Top/Back) down to Row 1 (Door) */}
//             {/* ==================================================== */}
//             <div className="col-span-5 flex flex-col justify-between">
//               {/* Header Label */}
//               <div className="text-center pb-1 mb-1 border-b border-white/10 flex items-center justify-between text-[10px]">
//                 <span className="font-[family-name:var(--font-ui)] font-bold text-[#087d99]">West Wing (1 – 31)</span>
//                 <span className="text-[#8E9DB5] font-mono text-[9px]">Left Wall</span>
//               </div>

//               {/* 33 rows: Row 33 & 32 are spacer pillars, Rows 31 down to 1 are Desks 31 down to 1 */}
//               <div className="flex flex-col gap-[1.5px]">
//                 {/* Spacer 2: Pillar / AC Vent near back wall */}
//                 <div className="h-[14.5px] sm:h-[15px] px-2 rounded-[4px] border border-dashed border-white/10 flex items-center justify-center text-[9px] text-[#8E9DB5]/40 font-mono">
//                   — Stair Up Bathroom —
//                 </div>
//                 {/* Spacer 1: Pillar / Fire Safety */}
//                 <div className="h-[14.5px] sm:h-[15px] px-2 rounded-[4px] border border-dashed border-white/10 flex items-center justify-center text-[9px] text-[#8E9DB5]/40 font-mono">
//                   — Quiet Station —
//                 </div>

//                 {/* Render Seats 31 down to 1 */}
//                 {Array.from(leftSeats)
//                   .reverse()
//                   .map((seat) => renderTwoColRow(seat, 'left'))}
//               </div>
//             </div>

//             {/* ==================================================== */}
//             {/* CENTRAL WALKWAY WITH INTEGRATED WALL & DOOR (1 col)  */}
//             {/* Makes full use of door & wall space inside the aisle */}
//             {/* ==================================================== */}
//             <div className="col-span-1 flex flex-col items-center justify-between py-1 relative">
//               {/* Top: BACK WALL INTEGRATED BADGE */}
//               <div className="z-10 bg-[#060A14] px-1 py-1 rounded border border-[#13b8c8]/40 text-center shadow-sm w-full">
//                 <span className="font-[family-name:var(--font-ui)] text-[8px] sm:text-[9px] uppercase tracking-wider text-[#087d99] font-bold block leading-none">
//                   BACK WALL
//                 </span>
//                 <span className="text-[7.5px] text-[#8E9DB5] block mt-0.5 leading-none">Silent</span>
//               </div>

//               {/* Center Pathway with Vertical Aisle Text */}
//               <div className="relative my-auto flex flex-col items-center justify-center">
//                 <div className="w-0.5 h-full border-r border-dashed border-[#13b8c8]/30 absolute inset-y-0" />
//                 <div className="z-10 bg-[#060A14] py-3 px-0.5 rounded-full border border-white/10 [writing-mode:vertical-rl] rotate-180 font-[family-name:var(--font-ui)] text-[8.5px] uppercase tracking-[0.2em] text-[#8E9DB5]">
//                   Walkway Aisle
//                 </div>
//                 <span className="text-[#13b8c8] text-[10px] mt-1.5 animate-bounce">↓</span>
//               </div>

//               {/* Bottom: MAIN ENTRANCE DOOR INTEGRATED BADGE (Flanked by Seat 1 & Seat 32) */}
//               <div className="z-10 bg-gradient-to-r from-[#087d99] via-[#13b8c8] to-[#075a70] text-[#060A14] px-1 py-1 rounded border border-white/20 text-center shadow-md w-full">
//                 <div className="flex items-center justify-center gap-1 leading-none">
//                   <DoorOpen className="w-2.5 h-2.5" />
//                   <span className="font-[family-name:var(--font-ui)] text-[8px] sm:text-[8.5px] uppercase tracking-wider font-extrabold leading-none">
//                     DOOR
//                   </span>
//                 </div>
//                 <span className="text-[7px] text-[#060A14]/80 font-bold block mt-0.5 leading-none">Entry</span>
//               </div>
//             </div>

//             {/* ==================================================== */}
//             {/* RIGHT COLUMN: East Wing (Desks 32 to 64) - 5 cols    */}
//             {/* Rendered from Row 33 (Seat 64) down to Row 1 (Seat 32)*/}
//             {/* ==================================================== */}
//             <div className="col-span-5 flex flex-col justify-between">
//               {/* Header Label */}
//               <div className="text-center pb-1 mb-1 border-b border-white/10 flex items-center justify-between text-[10px]">
//                 <span className="text-[#8E9DB5] font-mono text-[9px]">Right Wall</span>
//                 <span className="font-[family-name:var(--font-ui)] font-bold text-[#087d99]">East Wing (32 – 64)</span>
//               </div>

//               {/* 33 rows: Desks 64 down to 32 */}
//               <div className="flex flex-col gap-[1.5px]">
//                 {Array.from(rightSeats)
//                   .reverse()
//                   .map((seat) => renderTwoColRow(seat, 'right'))}
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* Alternative Matrix View (4-col banks) */
//         <div className="bg-[#060A14] rounded-xl border border-[#13b8c8]/20 p-2 sm:p-3">
//           <div className="grid grid-cols-11 gap-2 items-center max-w-4xl mx-auto">
//             <div className="col-span-5">
//               <span className="text-[10px] text-[#087d99] font-bold block mb-1">West Wing (1–31)</span>
//               <div className="grid grid-cols-4 gap-1">
//                 {leftSeats.map((seat) => (
//                   <button
//                     key={seat.seatNumber}
//                     type="button"
//                     onClick={() => {
//                       if (interactive) {
//                         setSelectedSeat(seat);
//                         onSelectSeat?.(seat.seatNumber);
//                       }
//                     }}
//                     className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border ${
//                       seat.isMySeat
//                         ? 'bg-[#13b8c8] text-[#060A14]'
//                         : seat.isOccupied
//                         ? 'bg-[#182335] text-[#94A3B8] border-white/10'
//                         : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
//                     }`}
//                   >
//                     {seat.seatNumber}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="col-span-1 text-center font-[family-name:var(--font-ui)] text-[8px] text-[#8E9DB5] [writing-mode:vertical-rl] rotate-180 py-4 mx-auto">
//               Aisle
//             </div>

//             <div className="col-span-5">
//               <span className="text-[10px] text-[#087d99] font-bold block mb-1">East Wing (32–64)</span>
//               <div className="grid grid-cols-4 gap-1">
//                 {rightSeats.map((seat) => (
//                   <button
//                     key={seat.seatNumber}
//                     type="button"
//                     onClick={() => {
//                       if (interactive) {
//                         setSelectedSeat(seat);
//                         onSelectSeat?.(seat.seatNumber);
//                       }
//                     }}
//                     className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border ${
//                       seat.isMySeat
//                         ? 'bg-[#13b8c8] text-[#060A14]'
//                         : seat.isOccupied
//                         ? 'bg-[#182335] text-[#94A3B8] border-white/10'
//                         : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
//                     }`}
//                   >
//                     {seat.seatNumber}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 4. Compact Selected Desk Inspector (Floating underneath, no height push) */}
//       <AnimatePresence>
//         {selectedSeat && (
//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 6 }}
//             className="mt-2 p-2 bg-white/[0.04] rounded-lg border border-[#13b8c8]/40 flex items-center justify-between gap-2 text-xs"
//           >
//             <div className="flex items-center gap-2.5">
//               <div
//                 className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
//                   selectedSeat.isMySeat
//                     ? 'bg-[#13b8c8] text-[#060A14]'
//                     : selectedSeat.isOccupied
//                     ? 'bg-[#334155] text-white'
//                     : 'bg-[#10B981] text-[#060A14]'
//                 }`}
//               >
//                 #{selectedSeat.seatNumber}
//               </div>

//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="font-[family-name:var(--font-ui)] font-bold text-white text-xs">
//                   Desk #{selectedSeat.seatNumber} ({selectedSeat.side === 'left' ? 'West Wing' : 'East Wing'})
//                 </span>
//                 {selectedSeat.isMySeat ? (
//                   <span className="text-[9px] font-bold bg-[#13b8c8] text-[#060A14] px-1.5 py-0.5 rounded">
//                     Your Assigned Desk
//                   </span>
//                 ) : selectedSeat.isOccupied ? (
//                   <span className="text-[9px] font-medium bg-[#334155] text-[#CBD5E1] px-1.5 py-0.5 rounded flex items-center gap-1">
//                     <UserCheck className="w-2.5 h-2.5" /> Allocated to other person
//                   </span>
//                 ) : (
//                   <span className="text-[9px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 px-1.5 py-0.5 rounded flex items-center gap-1">
//                     <CheckCircle2 className="w-2.5 h-2.5" /> Available for Allocation
//                   </span>
//                 )}
//                 <span className="text-[10px] text-[#8E9DB5] hidden md:inline">
//                   • 220V Universal Power • LED Reading Lamp • Fiber Wi-Fi
//                 </span>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() => setSelectedSeat(null)}
//               className="p-1 rounded text-[#8E9DB5] hover:text-white"
//               title="Close Preview"
//             >
//               <X className="w-3.5 h-3.5" />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* 5. Minimalist Legend Bar */}
//       <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8E9DB5]">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-1">
//             <span className="w-2 h-2 rounded bg-[#10B981]/30 border border-[#10B981]" />
//             <span>Available</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="w-2 h-2 rounded bg-[#182335] border border-white/20 flex items-center justify-center">
//               <span className="w-1 h-1 rounded-full bg-[#F43F5E]" />
//             </span>
//             <span>Allocated to other person</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="w-2 h-2 rounded bg-[#13b8c8] shadow-[0_0_6px_#13b8c8]" />
//             <span className="text-[#087d99] font-semibold">Your Assigned Desk</span>
//           </div>
//         </div>

//         <span className="font-mono text-[9px] text-[#8E9DB5]/60 hidden sm:inline">
//           Door at bottom &bull; Back Wall at top
//         </span>
//       </div>
//     </div>
//   );
// };

// export default SeatMap;


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
  const [seatDays, setSeatDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
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

  // Split into Left (1–31) and Right (32–64)
  const leftSeats = seats.filter((s) => s.seatNumber >= 1 && s.seatNumber <= 31);
  const rightSeats = seats.filter((s) => s.seatNumber >= 32 && s.seatNumber <= 64);

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
        title={`Seat ${seat.seatNumber}\n${side === 'left' ? 'West Wing' : 'East Wing'}\n${seat.isMySeat ? 'Your Reserved Seat' : seat.isOccupied ? 'Allocated to other person' : 'Available'}`}
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
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/65">
              Availability for selected days and hours
            </p>
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
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <label className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-white/65">
              Start
              <input
                type="time"
                value={seatStartTime}
                onChange={(event) => setSeatStartTime(event.target.value)}
                className="w-[108px] rounded-lg border border-white/10 bg-[#091827] px-2 py-1.5 text-xs text-white"
              />
            </label>
            <label className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-white/65">
              End
              <input
                type="time"
                value={seatEndTime}
                onChange={(event) => setSeatEndTime(event.target.value)}
                className="w-[108px] rounded-lg border border-white/10 bg-[#091827] px-2 py-1.5 text-xs text-white"
              />
            </label>
            <div className="mx-0.5 h-6 shrink-0 border-l border-white/10" aria-hidden="true" />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-full px-2 py-1 text-[11px] transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#7ef9ff] font-bold text-[#071521]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                All (64)
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
            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1 text-[10px]">
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#8fe7ff]">West Wing (1–31)</span>
                <span className="font-mono text-[#8aa7c6]">Left wall</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-white/10 px-2 text-[9px] font-mono text-white/25">
                  — stair up bathroom —
                </div>
                <div className="flex h-[18px] items-center justify-center rounded-xl border border-dashed border-white/10 px-2 text-[9px] font-mono text-white/25">
                  — quiet station —
                </div>

                {Array.from(leftSeats)
                  .reverse()
                  .map((seat) => renderTwoColRow(seat, 'left'))}
              </div>
            </div>

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

            <div className="col-span-5 flex flex-col justify-between">
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1 text-[10px]">
                <span className="font-mono text-[#8aa7c6]">Right wall</span>
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#8fe7ff]">East Wing (32–64)</span>
              </div>

              <div className="flex flex-col gap-1">
                {Array.from(rightSeats)
                  .reverse()
                  .map((seat) => renderTwoColRow(seat, 'right'))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#7ef9ff]/20 bg-[#040d18] p-2 sm:p-3">
          <div className="mx-auto grid max-w-4xl grid-cols-11 items-center gap-2">
            <div className="col-span-5">
              <span className="mb-1 block text-[10px] font-bold text-[#8fe7ff]">West Wing (1–31)</span>
              <div className="grid grid-cols-3 justify-items-center gap-1.5 sm:grid-cols-4">
                {leftSeats.map((seat) => (
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

            <div className="col-span-5">
              <span className="mb-1 block text-[10px] font-bold text-[#8fe7ff]">East Wing (32–64)</span>
              <div className="grid grid-cols-3 justify-items-center gap-1.5 sm:grid-cols-4">
                {rightSeats.map((seat) => (
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
                  Seat {selectedSeat.seatNumber} ({selectedSeat.side === 'left' ? 'West Wing' : 'East Wing'})
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

        <span className="hidden font-mono text-[9px] text-white/35 sm:inline">
          Door at bottom • back wall at top
        </span>
      </div>
    </div>
  );
};

export default SeatMap;