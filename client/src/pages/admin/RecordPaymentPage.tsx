import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  CheckCircle,
  Download,
  AlertCircle,
  DollarSign,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { studentsApi, paymentsApi } from '../../lib/api';
import { formatINR, formatDate, downloadBlob } from '../../lib/utils';
import toast from 'react-hot-toast';

export const RecordPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  // Search & Student Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);

  // Form Fields
  const [amountINR, setAmountINR] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer' | 'card' | 'other'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeCategory, setFeeCategory] = useState('Monthly Membership Fee');
  const [periodLabel, setPeriodLabel] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State
  const [recordedPayment, setRecordedPayment] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load preselected student if present in URL query
  useEffect(() => {
    if (preselectedStudentId) {
      loadStudentDetails(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  // Set default period label based on current month
  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    setPeriodLabel(month);
  }, []);

  // Search debouncing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await studentsApi.list({ search: searchTerm.trim(), limit: 8 });
        setSearchResults(res.data?.data || []);
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStudentDetails = async (id: string) => {
    try {
      const res = await studentsApi.get(id);
      setSelectedStudent(res.data?.data?.student);
      setStudentDetails(res.data?.data);

      // Pre-fill amount with outstanding or plan base fee
      const activeM = res.data?.data?.memberships?.find((m: any) =>
        ['active', 'expiring_soon'].includes(m.status)
      );
      if (activeM) {
        const due = res.data?.data?.outstanding > 0 ? res.data?.data?.outstanding / 100 : activeM.baseFeeSnapshot / 100;
        setAmountINR(due);
      }
      setSearchResults([]);
      setSearchTerm('');
    } catch {
      toast.error('Could not load student profile.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student.');
      return;
    }

    if (!amountINR || amountINR <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const activeMembership = studentDetails?.memberships?.find((m: any) =>
      ['active', 'expiring_soon'].includes(m.status)
    ) || studentDetails?.memberships?.[0];

    if (!activeMembership) {
      toast.error('This student has no membership record to attach payment to. Please create a membership first.');
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `LDL-${Date.now()}-${Math.random()}`;

    try {
      const res = await paymentsApi.record({
        studentId: selectedStudent._id,
        membershipId: activeMembership._id,
        amountReceived: Number(amountINR),
        paymentMethod,
        paymentDate,
        feeCategory,
        periodLabel,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
        idempotencyKey,
      });

      toast.success('Payment recorded successfully!');
      setRecordedPayment(res.data?.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record payment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!recordedPayment) return;
    setIsDownloading(true);
    try {
      const res = await paymentsApi.receipt(recordedPayment._id);
      downloadBlob(res.data, `Receipt-${recordedPayment.receiptNumber}.pdf`);
      toast.success('Receipt downloaded');
    } catch {
      toast.error('Receipt generation failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setRecordedPayment(null);
    setSelectedStudent(null);
    setStudentDetails(null);
    setAmountINR('');
    setTransactionReference('');
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="page-header">
        <div>
          <h1 className="page-title text-2xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
            Record Fee Payment
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Generate official payment transactions and printable PDF receipts with immutable audit trails.
          </p>
        </div>
      </div>

      {recordedPayment ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-[#dce8f0] shadow-lg text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#13b8c8]">Transaction Successful</span>
          <h2 className="text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mt-1 mb-2">
            Payment Recorded & Ledger Updated
          </h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
            The fee received has been added to the library ledger under unique receipt ID:
          </p>

          <div className="bg-[#f4f9fc] p-6 rounded-2xl border border-[#dce8f0] max-w-sm mx-auto mb-8 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B]">Receipt Number:</span>
              <strong className="font-mono text-[#0b1d2e]">{recordedPayment.receiptNumber}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B]">Amount Received:</span>
              <strong className="font-semibold text-[#2D6A4F]">{formatINR(recordedPayment.amountReceived)}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B]">Payment Method:</span>
              <span className="uppercase text-[11px] font-bold text-[#0b1d2e]">{recordedPayment.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B]">Payment Date:</span>
              <span className="text-[#0b1d2e]">{formatDate(recordedPayment.paymentDate)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="btn btn-primary w-full sm:w-auto px-6 min-h-[48px] justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Generating PDF...' : 'Download PDF Receipt'}
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary w-full sm:w-auto px-6 min-h-[48px] justify-center"
            >
              Record Another Payment
            </button>
            <button
              onClick={() => navigate('/admin/payments')}
              className="btn btn-secondary border-transparent text-[#64748B] w-full sm:w-auto min-h-[48px] sm:min-h-0 justify-center"
            >
              View Payments List
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 border border-[#dce8f0] shadow-sm space-y-6 sm:space-y-8">
          {/* Section 1: Student Selection */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0b1d2e] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#13b8c8]" />
              1. Select Student
            </h2>

            {selectedStudent ? (
              <div className="p-4 bg-[#f4f9fc] rounded-2xl border border-[#13b8c8]/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">{selectedStudent.name}</span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-[#0b1d2e] border">
                      {selectedStudent.studentCode}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Phone: {selectedStudent.phone} &bull; Joined: {formatDate(selectedStudent.joiningDate)} &bull; Seat: {selectedStudent.seatNumber || 'Unassigned'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] block">Current Due</span>
                    <span className={`text-base font-bold ${studentDetails?.outstanding > 0 ? 'text-[#DC2626]' : 'text-[#2D6A4F]'}`}>
                      {studentDetails?.outstanding > 0 ? formatINR(studentDetails.outstanding) : 'Nil'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedStudent(null); setStudentDetails(null); }}
                    className="text-xs text-[#DC2626] hover:underline font-semibold px-2 py-1"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search student by name, student code, or phone number..."
                    className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] bg-[#f4f9fc]/40 text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                  />
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#dce8f0] rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-[#e7faff]">
                    {searchResults.map((s) => (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => loadStudentDetails(s._id)}
                        className="w-full px-4 py-3 text-left hover:bg-[#f4f9fc] flex justify-between items-center transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-sm text-[#0b1d2e]">{s.name}</div>
                          <div className="text-xs text-[#64748B] font-mono">{s.studentCode} &bull; {s.phone}</div>
                        </div>
                        <span className="text-xs font-semibold text-[#087d99] flex items-center gap-1">
                          Select <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Payment Details */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0b1d2e] mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#13b8c8]" />
              2. Transaction Particulars
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Amount Received (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] pointer-events-none">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amountINR}
                    onChange={(e) => setAmountINR(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1200"
                    className="w-full pl-9 pr-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] bg-white text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                >
                  <option value="cash">Cash (In-person)</option>
                  <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                  <option value="bank_transfer">Direct Bank Transfer (NEFT / IMPS)</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="other">Other Configured Method</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Fee Category
                </label>
                <input
                  type="text"
                  value={feeCategory}
                  onChange={(e) => setFeeCategory(e.target.value)}
                  placeholder="e.g. Monthly Fee"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Period Label
                </label>
                <input
                  type="text"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. November 2026"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Transaction Reference / UTR (Optional)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. UPI Ref 324158912389"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0b1d2e] mb-2">
                  Internal Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received partial payment; balance to follow"
                  className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-[#dce8f0] text-[#0b1d2e] focus:outline-none focus:border-[#13b8c8] text-base sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#dce8f0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-[#64748B] flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>Generates audit-verified sequential receipt code</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/admin/payments')}
                className="btn btn-secondary w-full sm:w-auto min-h-[48px] sm:min-h-0 justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedStudent}
                className="btn btn-primary w-full sm:w-auto px-8 min-h-[48px] justify-center"
              >
                {isSubmitting ? 'Recording...' : 'Confirm & Generate Receipt'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecordPaymentPage;
