import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Clock,
  Calendar,
  CreditCard,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Check,
  Zap,
} from 'lucide-react';
import { studentsApi, paymentsApi } from '../../lib/api';
import { downloadBlob } from '../../lib/utils';
import { SeatSelector } from '../../components/admin/SeatSelector';
import FormSteps from '../../components/admin/FormSteps';
import toast from 'react-hot-toast';

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

export const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const getFutureDate = (months = 1, days = 0): string => {
    const d = new Date();
    if (months) d.setMonth(d.getMonth() + months);
    if (days) d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Timing selection by self (Time From & Time To)
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

  const cleanDigits = phone.replace(/\D/g, '');
  const parsedTotalFee = Number(totalFee) || 0;
  const parsedReceivedToday = Number(amountReceivedToday) || 0;
  const balanceDue = Math.max(0, parsedTotalFee - parsedReceivedToday);

  const calculatedShift =
    timeFrom && timeTo ? `${formatTo12Hr(timeFrom)} to ${formatTo12Hr(timeTo)}` : '';

  // Calculate duration days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const durationDays =
    !isNaN(startD.getTime()) && !isNaN(endD.getTime()) && endD >= startD
      ? Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const applyDuration = (months: number, days = 0) => {
    const base = startDate ? new Date(startDate) : new Date();
    const d = new Date(base);
    if (months) d.setMonth(d.getMonth() + months);
    if (days) d.setDate(d.getDate() + days);
    setEndDate(d.toISOString().split('T')[0]);
  };

  const setPresetTiming = (from: string, to: string) => {
    setTimeFrom(from);
    setTimeTo(to);
  };

  const handlePayFull = () => {
    setAmountReceivedToday(parsedTotalFee);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the student full name');
      return;
    }

    if (cleanDigits.length < 10) {
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
        phone: cleanDigits,
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
          downloadBlob(receiptRes.data, `Receipt-${receiptNumber || 'LDL'}.pdf`);
          const blobUrl = URL.createObjectURL(
            new Blob([receiptRes.data], { type: 'application/pdf' })
          );
          window.open(blobUrl, '_blank');
        } catch {
          // ignore popup blocker
        }
      }

      toast.success(
        `Enrolled ${name}! Phone number ${cleanDigits} is their initial password.`,
        { duration: 5000 }
      );

      navigate('/admin/students');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete enrollment.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 font-sans max-w-3xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col gap-1.5 pt-1">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a38b52] hover:text-[#8b7340] w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Students Directory</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] flex items-center gap-2">
              <Sparkles className="text-[#c2a66e] h-6 w-6 sm:h-7 sm:w-7" />
              <span>Student Enrollment</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8a7a60] mt-0.5">
              Instant registration, floor seat selection, custom timings & receipt
            </p>
          </div>
        </div>
      </div>

      {/* Main Enrollment Card Form */}
      <form noValidate onSubmit={handleSubmit} className="card bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#e8dcc8] shadow-sm">
        <FormSteps
          steps={['Student', 'Shift', 'Dates', 'Payment']}
          canContinue={(index) => {
            if (index === 0) {
              if (!name.trim()) {
                toast.error('Please enter the student full name');
                return false;
              }
              if (cleanDigits.length < 10) {
                toast.error('Please enter a valid 10-digit mobile number');
                return false;
              }
            }
            if (index === 1 && (!timeFrom || !timeTo)) {
              toast.error('Please select both Time From and Time To');
              return false;
            }
            if (index === 2) {
              if (!startDate || !endDate) {
                toast.error('Please specify both Start Date and End Date');
                return false;
              }
              if (new Date(endDate) < new Date(startDate)) {
                toast.error('End Date cannot be before Start Date');
                return false;
              }
            }
            return true;
          }}
          footer={
            <div className="sticky bottom-[4.5rem] z-30 -mx-4 -mb-4 border-t border-[#e8dcc8] bg-white/95 px-4 py-3 backdrop-blur-md md:static md:m-0 md:border-t md:border-[#e2edf3] md:bg-transparent md:p-0 md:pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold text-[#8a7a60]">
                  <span>
                    Total: <strong className="text-[#2c1f0e]">₹{parsedTotalFee}</strong>
                  </span>
                  <span>
                    Paid: <strong className="text-emerald-700">₹{parsedReceivedToday}</strong>
                  </span>
                  {balanceDue > 0 && (
                    <span>
                      Due: <strong className="text-amber-700">₹{balanceDue}</strong>
                    </span>
                  )}
                </div>
                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <Link
                    to="/admin/students"
                    className="hidden sm:inline-flex rounded-xl border border-[#cfdce6] bg-white px-5 py-2.5 text-xs font-bold text-[#8a7a60] hover:bg-[#f1f7fa] hover:text-[#2c1f0e] transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl py-3 px-7 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50"
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
              </div>
            </div>
          }
        >
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#f8fbfd] p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a38b52]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5ead4] text-[11px] font-black text-[#a38b52]">
                1
              </span>
              <span>Student Details</span>
            </div>

            {cleanDigits.length === 10 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Check size={12} className="text-emerald-600" />
                Valid Phone
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  autoCapitalize="words"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full rounded-xl border border-[#cfdce6] bg-white py-3 pl-10 pr-3.5 text-base sm:text-sm text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={15}
                  className="w-full rounded-xl border border-[#cfdce6] bg-white py-3 pl-10 pr-3.5 text-base sm:text-sm font-semibold text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#cbe4ed] bg-[#eef8fb] p-3 text-xs text-[#096a82]">
            <CheckCircle2 size={16} className="shrink-0 text-[#c2a66e]" />
            <span>
              <strong>Zero-friction credentials:</strong> Student's phone number is automatically set as their initial login password. On their first login, they will be required to set a new password.
            </span>
          </div>
        </div>

        {/* Section 2: Shift Timings & Seat Assignment */}
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#f8fbfd] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a38b52]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5ead4] text-[11px] font-black text-[#a38b52]">
                2
              </span>
              <span>Shift Timings & Desk Allocation</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSeatMap(!showSeatMap)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a38b52] hover:text-[#8b7340] bg-white border border-[#cbe4ed] px-3 py-1.5 rounded-xl shadow-xs hover:bg-[#eef8fb] transition-all self-start sm:self-auto min-h-[36px] sm:min-h-0"
            >
              <Armchair size={14} className="text-[#c2a66e]" />
              <span>{showSeatMap ? 'Hide Map' : 'Floor Map (1–58)'}</span>
            </button>
          </div>

          {/* Timing Selection by Self: Time From & Time To (NO PRESETS REQUIRED) */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#294055]">
                Custom Shift Timings <span className="text-rose-500">*</span>
              </label>

              {/* 1-tap quick timing buttons for speed without restriction */}
              <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
                <span className="text-[#8a7a60] font-medium hidden xs:inline shrink-0">Quick fill:</span>
                <button
                  type="button"
                  onClick={() => setPresetTiming('08:00', '16:00')}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  8 AM – 4 PM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTiming('08:00', '20:00')}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  8 AM – 8 PM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTiming('06:00', '14:00')}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  6 AM – 2 PM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTiming('14:00', '22:00')}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  2 PM – 10 PM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <span className="block text-[11px] font-bold text-[#8a7a60] mb-1">
                  Time From (Start Time)
                </span>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                  <input
                    type="time"
                    required
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="shift-time w-full min-w-0 rounded-xl border border-[#cfdce6] bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#8a7a60] mb-1">
                  Time To (End Time)
                </span>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                  <input
                    type="time"
                    required
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="shift-time w-full min-w-0 rounded-xl border border-[#cfdce6] bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                  />
                </div>
              </div>
            </div>

            {calculatedShift && (
              <div className="flex flex-col items-start gap-1.5 rounded-xl border border-[#cbe4ed] bg-[#f5ead4] px-3.5 py-2 text-xs text-[#a38b52] sm:flex-row sm:items-center sm:justify-between">
                <span className="flex min-w-0 items-start gap-1.5 font-semibold leading-snug">
                  <Clock size={13} className="mt-0.5 shrink-0 text-[#c2a66e]" />
                  <span>Shift slot: <strong>{calculatedShift}</strong></span>
                </span>
                <span className="shrink-0 rounded-md border border-[#cbe4ed] bg-white/80 px-2 py-0.5 text-[11px] font-bold">
                  {timeFrom} → {timeTo}
                </span>
              </div>
            )}
          </div>

          {/* Seat input / selected badge */}
          <div className="border-t border-[#e2edf3] pt-4 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#294055] mb-1">
                  Seat Number (1–58)
                </label>
                <div className="relative">
                  <Armchair className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={58}
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full rounded-xl border border-[#cfdce6] bg-white py-2.5 pl-10 pr-3.5 text-base sm:text-sm font-bold text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeatMap(!showSeatMap)}
                  className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                    seatNumber
                      ? 'border-[#a38b52] bg-[#071521] text-[#e8d5a8]'
                      : 'border-[#e8dcc8] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Armchair size={15} className={`shrink-0 ${seatNumber ? 'text-[#e8d5a8]' : 'text-[#c2a66e]'}`} />
                    <span className="min-w-0 leading-snug">
                      {seatNumber
                        ? `Assigned Desk: Seat ${seatNumber}`
                        : calculatedShift
                        ? `Pick seat for ${calculatedShift}`
                        : 'Tap to pick a seat on the floor map'}
                    </span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[11px] underline">
                    {showSeatMap ? 'Close' : 'Choose'}
                  </span>
                </button>

                {seatNumber && (
                  <button
                    type="button"
                    onClick={() => setSeatNumber('')}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Floor Map with Live Shift Timing Overlap Filtering */}
            {showSeatMap && (
              <div className="pt-1 animate-fade-in">
                <SeatSelector
                  selectedSeat={seatNumber}
                  onSelectSeat={(num) => setSeatNumber(num)}
                  startTime={timeFrom}
                  endTime={timeTo}
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8dcc8] bg-[#f8fbfd] p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a38b52]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5ead4] text-[11px] font-black text-[#a38b52]">
              3
            </span>
            <span>Membership Dates</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#294055]">
                Membership Tenure (Start & End Date) <span className="text-rose-500">*</span>
              </label>

              {/* 1-tap quick duration chips */}
              <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
                <span className="text-[#8a7a60] font-medium hidden xs:inline shrink-0">Quick pick:</span>
                <button
                  type="button"
                  onClick={() => applyDuration(0, 15)}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  15 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(1)}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-0.5 rounded-md border border-[#a38b52] bg-[#f5ead4] text-[#a38b52] font-bold shadow-2xs whitespace-nowrap shrink-0"
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(2)}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  2 Mos
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(3)}
                  className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2.5 sm:py-0.5 rounded-md border border-[#cfdce6] bg-white text-[#2c1f0e] hover:border-[#c2a66e] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap shrink-0"
                >
                  3 Mos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <span className="block text-[11px] font-bold text-[#8a7a60] mb-1">
                  Start Date
                </span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-[#cfdce6] bg-white py-2.5 pl-10 pr-3.5 text-base sm:text-sm text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-[#8a7a60] mb-1">
                  End Date
                </span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7b90a3]" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[#cfdce6] bg-white py-2.5 pl-10 pr-3.5 text-base sm:text-sm text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                  />
                </div>
              </div>
            </div>

            {durationDays > 0 && (
              <div className="text-[11px] text-[#8a7a60] flex items-center gap-1.5 pt-0.5">
                <Calendar size={13} className="text-[#c2a66e]" />
                <span>
                  Total Tenure: <strong className="text-[#2c1f0e]">{durationDays} Days</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Custom Billing & Payment */}
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#f8fbfd] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a38b52]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f5ead4] text-[11px] font-black text-[#a38b52]">
                4
              </span>
              <span>Billing & Instant Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#294055]">
                  Agreed Fee (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
                  <button
                    type="button"
                    onClick={() => {
                      setTotalFee(1000);
                      if (!amountReceivedToday || Number(amountReceivedToday) === parsedTotalFee) {
                        setAmountReceivedToday(1000);
                      }
                    }}
                    className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-1.5 sm:py-0.5 rounded bg-white border border-[#cfdce6] text-[#2c1f0e] hover:border-[#c2a66e] whitespace-nowrap shrink-0"
                  >
                    ₹1k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTotalFee(1500);
                      if (!amountReceivedToday || Number(amountReceivedToday) === parsedTotalFee) {
                        setAmountReceivedToday(1500);
                      }
                    }}
                    className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-1.5 sm:py-0.5 rounded bg-white border border-[#cfdce6] text-[#2c1f0e] hover:border-[#c2a66e] whitespace-nowrap shrink-0"
                  >
                    ₹1.5k
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTotalFee(2000);
                      if (!amountReceivedToday || Number(amountReceivedToday) === parsedTotalFee) {
                        setAmountReceivedToday(2000);
                      }
                    }}
                    className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-1.5 sm:py-0.5 rounded bg-white border border-[#cfdce6] text-[#2c1f0e] hover:border-[#c2a66e] whitespace-nowrap shrink-0"
                  >
                    ₹2k
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7b90a3]">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
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
                  className="w-full rounded-xl border border-[#cfdce6] bg-white py-3 pl-8 pr-3.5 text-base sm:text-sm font-bold text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#294055]">
                  Amount Paid Today (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar py-1 -mx-1 px-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none]">
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-2 sm:py-0.5 rounded font-bold bg-[#f5ead4] border border-[#cbe4ed] text-[#a38b52] hover:bg-[#d8f6fd] whitespace-nowrap shrink-0"
                  >
                    Full Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountReceivedToday(Math.round(parsedTotalFee / 2))}
                    className="min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:px-1.5 sm:py-0.5 rounded bg-white border border-[#cfdce6] text-[#2c1f0e] hover:border-[#c2a66e] whitespace-nowrap shrink-0"
                  >
                    50%
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7b90a3]">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  required
                  value={amountReceivedToday}
                  onChange={(e) => setAmountReceivedToday(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full rounded-xl border border-[#cfdce6] bg-white py-3 pl-8 pr-3.5 text-base sm:text-sm font-bold text-[#2c1f0e] placeholder-[#a0b3c6] focus:border-[#25b8d0] focus:outline-none focus:ring-2 focus:ring-[#25b8d0]/15"
                />
              </div>
            </div>
          </div>

          {/* Automatic Outstanding Balance Alert */}
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium border ${
              balanceDue > 0
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {balanceDue > 0 ? (
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              )}
              <span>
                {balanceDue > 0 ? (
                  <>
                    <strong>Balance Due:</strong> ₹{balanceDue.toLocaleString('en-IN')}{' '}
                    will be tracked as pending dues.
                  </>
                ) : (
                  <>
                    <strong>Paid in Full:</strong> ₹0 Due balance.
                  </>
                )}
              </span>
            </div>
            <span className="font-black text-sm">
              {balanceDue > 0 ? `Due: ₹${balanceDue}` : '✓ Fully Paid'}
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
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-[#a38b52] bg-[#a38b52] text-white shadow-sm ring-2 ring-[#a38b52]/20'
                    : 'border-[#cfdce6] bg-white text-[#294055] hover:bg-[#f1f7fa]'
                }`}
              >
                <span className="font-bold text-sm">₹</span>
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#a38b52] bg-[#a38b52] text-white shadow-sm ring-2 ring-[#a38b52]/20'
                    : 'border-[#cfdce6] bg-white text-[#294055] hover:bg-[#f1f7fa]'
                }`}
              >
                <CreditCard size={15} />
                <span>UPI / QR Scan</span>
              </button>
            </div>
          </div>

          {/* Optional UPI Ref / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-xs font-semibold text-[#8a7a60] mb-1">
                  UPI Ref / UTR (Optional)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. 4028472910"
                  className="w-full rounded-xl border border-[#cfdce6] bg-white py-2.5 sm:py-2 px-3 text-base sm:text-xs text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none min-h-[44px] sm:min-h-0"
                />
              </div>
            )}

            <div className={paymentMethod === 'upi' ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-[#8a7a60] mb-1">
                Admin Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Walk-in student, UPSC aspirant"
                className="w-full rounded-xl border border-[#cfdce6] bg-white py-2.5 sm:py-2 px-3 text-base sm:text-xs text-[#2c1f0e] focus:border-[#25b8d0] focus:outline-none min-h-[44px] sm:min-h-0"
              />
            </div>
          </div>
        </div>
        </FormSteps>
      </form>
    </div>
  );
};

export default AddStudentPage;