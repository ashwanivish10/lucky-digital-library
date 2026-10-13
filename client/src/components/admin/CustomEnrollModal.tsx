import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Clock,
  Calendar,
  IndianRupee,
  CreditCard,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Armchair,
} from 'lucide-react';
import { studentsApi, paymentsApi } from '../../lib/api';
import { downloadBlob } from '../../lib/utils';
import { SeatSelector } from './SeatSelector';
import toast from 'react-hot-toast';

interface CustomEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export const CustomEnrollModal: React.FC<CustomEnrollModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const getFutureDate = (months = 1, days = 0): string => {
    const d = new Date();
    if (months) d.setMonth(d.getMonth() + months);
    if (days) d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Timing selection by self (NO pre-defined presets)
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('16:00');
  const [seatNumber, setSeatNumber] = useState('');
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(getFutureDate(1, 0));
  const [totalFee, setTotalFee] = useState<number | string>(1500);
  const [amountReceivedToday, setAmountReceivedToday] = useState<number | string>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedTotalFee = Number(totalFee) || 0;
  const parsedReceivedToday = Number(amountReceivedToday) || 0;
  const balanceDue = Math.max(0, parsedTotalFee - parsedReceivedToday);

  const calculatedShift =
    timeFrom && timeTo ? `${formatTo12Hr(timeFrom)} to ${formatTo12Hr(timeTo)}` : '';

  const applyDuration = (months: number, days = 0) => {
    const base = startDate ? new Date(startDate) : new Date();
    const d = new Date(base);
    if (months) d.setMonth(d.getMonth() + months);
    if (days) d.setDate(d.getDate() + days);
    setEndDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the student name');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please specify both Start Date and End Date');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End Date cannot be before Start Date');
      return;
    }

    if (!timeFrom || !timeTo) {
      toast.error('Please select both Time From and Time To');
      return;
    }

    if (parsedTotalFee < 0) {
      toast.error('Total fee cannot be negative');
      return;
    }

    if (parsedReceivedToday > parsedTotalFee) {
      toast.error('Amount received cannot exceed the total agreed fee');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: cleanPhone,
        shiftTimings: calculatedShift || undefined,
        seatStartTime: timeFrom || undefined,
        seatEndTime: timeTo || undefined,
        seatNumber: seatNumber.trim() || undefined,
        startDate,
        endDate,
        totalFee: parsedTotalFee,
        amountReceivedToday: parsedReceivedToday,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await studentsApi.customEnroll(payload);
      const { paymentId, receiptNumber } = res.data.data;

      // Print/Download Receipt if a payment was recorded
      if (paymentId) {
        try {
          const receiptRes = await paymentsApi.receipt(paymentId);
          downloadBlob(receiptRes.data, `Receipt-${receiptNumber || 'WalkIn'}.pdf`);
          const blobUrl = URL.createObjectURL(
            new Blob([receiptRes.data], { type: 'application/pdf' })
          );
          window.open(blobUrl, '_blank');
        } catch {
          // If popup blocked, file is already downloaded
        }
      }

      toast.success(
        `Enrolled ${name}! Phone number ${cleanPhone} is their default password.`,
        { duration: 5000 }
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete walk-in enrollment.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#dce8f0] text-[#0b1d2e]"
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e2edf3] bg-gradient-to-r from-[#071521] via-[#0c2032] to-[#122e44] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7ef9ff]/30 bg-[#7ef9ff]/15 text-[#7ef9ff] shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-lg font-black tracking-[-0.03em] text-white">
                  Student Enrollment
                </h3>
                <p className="text-xs text-[#a0cadb]">
                  Seat selection, custom timings, fee calculation & instant receipt
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section 1: Student Details */}
            <div className="rounded-xl border border-[#dce8f0] bg-[#f8fbfd] p-4.5 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087d99]">
                <User size={15} />
                <span>Section 1: Student Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      maxLength={15}
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-[#cbe4ed] bg-[#eef8fb] px-3 py-2 text-xs text-[#096a82]">
                <CheckCircle2 size={15} className="shrink-0 text-[#13b8c8]" />
                <span>
                  <strong>Automatic Password:</strong> The student's mobile number will silently be their initial login password. On their first login, they will be prompted to set their private password.
                </span>
              </div>
            </div>

            {/* Section 2: Seat & Custom Timing Duration */}
            <div className="rounded-xl border border-[#dce8f0] bg-[#f8fbfd] p-4.5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087d99]">
                  <Clock size={15} />
                  <span>Section 2: Seat & Timing Selection</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeatMap(!showSeatMap)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087d99] hover:text-[#075a70] bg-white border border-[#cbe4ed] px-3 py-1 rounded-lg shadow-2xs hover:bg-[#eef8fb] transition-all"
                >
                  <Armchair size={14} className="text-[#13b8c8]" />
                  <span>{showSeatMap ? 'Hide Seat Map' : 'Select Seat from Floor Map'}</span>
                </button>
              </div>

              {/* Direct Seat input and quick selector button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                    Assigned Seat (1–58)
                  </label>
                  <div className="relative">
                    <Armchair className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                    <input
                      type="number"
                      min={1}
                      max={58}
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      placeholder="e.g. 14 (Optional)"
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm font-bold text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSeatMap(true)}
                    className="flex-1 py-2 px-3 rounded-lg border border-[#dce8f0] bg-white text-xs font-semibold text-[#0b1d2e] hover:border-[#13b8c8] hover:bg-[#f0fbfd] transition-all text-left flex items-center justify-between"
                  >
                    <span>
                      {seatNumber ? `Selected: Seat ${seatNumber}` : 'Click to pick seat on map (1–58)'}
                    </span>
                    <span className="text-[#087d99] font-bold text-[11px]">View Map &rarr;</span>
                  </button>

                  {seatNumber && (
                    <button
                      type="button"
                      onClick={() => setSeatNumber('')}
                      className="py-2 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                      title="Clear seat selection"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Interactive Floor Map when opened */}
              {showSeatMap && (
                <div className="pt-1">
                  <SeatSelector
                    selectedSeat={seatNumber}
                    onSelectSeat={(num) => setSeatNumber(num)}
                    startTime={timeFrom}
                    endTime={timeTo}
                  />
                </div>
              )}

              {/* Timing Selection by Self: Time From & Time To (NO PRESETS) */}
              <div className="border-t border-[#e2edf3] pt-3.5 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#294055]">
                  Timing Selection (Time From & Time To) <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-[#65788c] mb-1">
                      Time From (Start Time)
                    </span>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                      <input
                        type="time"
                        required
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm font-semibold text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-[#65788c] mb-1">
                      Time To (End Time)
                    </span>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                      <input
                        type="time"
                        required
                        value={timeTo}
                        onChange={(e) => setTimeTo(e.target.value)}
                        className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm font-semibold text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                      />
                    </div>
                  </div>
                </div>

                {calculatedShift && (
                  <div className="flex items-center justify-between rounded-lg bg-[#e7faff] border border-[#cbe4ed] px-3 py-1.5 text-xs text-[#087d99]">
                    <span className="font-medium">
                      Calculated Shift: <strong>{calculatedShift}</strong>
                    </span>
                    <span className="font-semibold text-[11px]">
                      {timeFrom} &rarr; {timeTo}
                    </span>
                  </div>
                )}
              </div>

              {/* Custom Duration Dates */}
              <div className="border-t border-[#e2edf3] pt-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#294055]">
                    Duration Period (Start & End Date) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-[#65788c] font-medium">Quick duration:</span>
                    <button
                      type="button"
                      onClick={() => applyDuration(0, 15)}
                      className="px-2 py-0.5 rounded border border-[#cfdce6] bg-white text-[#0b1d2e] hover:bg-[#eaf5f9] hover:border-[#13b8c8] transition-colors"
                    >
                      15 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDuration(1)}
                      className="px-2 py-0.5 rounded border border-[#cfdce6] bg-white text-[#0b1d2e] hover:bg-[#eaf5f9] hover:border-[#13b8c8] transition-colors font-semibold"
                    >
                      1 Month
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDuration(3)}
                      className="px-2 py-0.5 rounded border border-[#cfdce6] bg-white text-[#0b1d2e] hover:bg-[#eaf5f9] hover:border-[#13b8c8] transition-colors"
                    >
                      3 Months
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-[#65788c] mb-1">
                      Start Date
                    </span>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-[#65788c] mb-1">
                      End Date
                    </span>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-9 pr-3 text-sm text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Custom Billing & Payment */}
            <div className="rounded-xl border border-[#dce8f0] bg-[#f8fbfd] p-4.5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087d99]">
                <IndianRupee size={15} />
                <span>Section 3: Custom Billing & Payment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                    Total Decided Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7b90a3]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      required
                      value={totalFee}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTotalFee(val);
                        if (!amountReceivedToday || Number(amountReceivedToday) === parsedTotalFee) {
                          setAmountReceivedToday(val);
                        }
                      }}
                      placeholder="e.g. 1500"
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-8 pr-3 text-sm font-semibold text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                    Amount Received Today (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7b90a3]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      required
                      value={amountReceivedToday}
                      onChange={(e) => setAmountReceivedToday(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-2 pl-8 pr-3 text-sm font-semibold text-[#0b1d2e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Outstanding Balance Alert */}
              <div
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-xs font-medium border ${
                  balanceDue > 0
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {balanceDue > 0 ? (
                    <AlertCircle size={16} className="text-amber-600" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                  <span>
                    {balanceDue > 0 ? (
                      <>
                        <strong>Outstanding Balance:</strong> ₹{balanceDue.toLocaleString('en-IN')}{' '}
                        will be automatically tracked as pending dues.
                      </>
                    ) : (
                      <>
                        <strong>Full Payment:</strong> ₹0 Due balance. Membership is fully paid.
                      </>
                    )}
                  </span>
                </div>
                <span className="font-bold text-sm">
                  {balanceDue > 0 ? `Due: ₹${balanceDue}` : 'Paid in Full'}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-4 text-xs font-bold transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#087d99] bg-[#087d99] text-white shadow-sm'
                        : 'border-[#cfdce6] bg-white text-[#294055] hover:bg-[#f1f7fa]'
                    }`}
                  >
                    <IndianRupee size={15} />
                    <span>Cash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-4 text-xs font-bold transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#087d99] bg-[#087d99] text-white shadow-sm'
                        : 'border-[#cfdce6] bg-white text-[#294055] hover:bg-[#f1f7fa]'
                    }`}
                  >
                    <CreditCard size={15} />
                    <span>UPI / QR Transfer</span>
                  </button>
                </div>
              </div>

              {/* Optional UPI Ref / Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-xs font-medium text-[#65788c] mb-1">
                      UPI Reference / UTR (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="e.g. 4028472910"
                      className="w-full rounded-lg border border-[#cfdce6] bg-white py-1.5 px-3 text-xs text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none"
                    />
                  </div>
                )}

                <div className={paymentMethod === 'upi' ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-medium text-[#65788c] mb-1">
                    Internal Admin Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Walk-in student, civil services aspirant"
                    className="w-full rounded-lg border border-[#cfdce6] bg-white py-1.5 px-3 text-xs text-[#0b1d2e] focus:border-[#25b8d0] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2edf3]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-[#cfdce6] bg-white px-5 py-2.5 text-xs font-bold text-[#65788c] hover:bg-[#f1f7fa] hover:text-[#0b1d2e] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Enrollment...</span>
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    <span>Save & Print Receipt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomEnrollModal;
