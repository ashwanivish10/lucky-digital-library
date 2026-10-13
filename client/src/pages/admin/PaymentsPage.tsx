import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  PlusCircle,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  X,
} from 'lucide-react';
import { paymentsApi } from '../../lib/api';
import {
  formatINR,
  formatDate,
  getPaymentMethodLabel,
  downloadBlob,
} from '../../lib/utils';
import toast from 'react-hot-toast';

interface PaymentItem {
  _id: string;
  receiptNumber: string;
  studentId: {
    _id: string;
    name: string;
    studentCode: string;
    phone: string;
  };
  membershipId: string;
  amountReceived: number; // in paise
  paymentMethod: string;
  paymentDate: string;
  feeCategory: string;
  periodLabel?: string;
  status: string;
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 20,
      };
      if (fromFilter) params.from = fromFilter;
      if (toFilter) params.to = toFilter;
      if (methodFilter) params.method = methodFilter;

      const res = await paymentsApi.list(params);
      if (res.data.success) {
        setPayments(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, fromFilter, toFilter, methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Client-side filter for student search if needed, or matched in list
  const filteredPayments = React.useMemo(() => {
    if (!studentSearch.trim()) return payments;
    const q = studentSearch.toLowerCase();
    return payments.filter(
      (p) =>
        p.studentId?.name?.toLowerCase().includes(q) ||
        p.studentId?.studentCode?.toLowerCase().includes(q) ||
        p.receiptNumber?.toLowerCase().includes(q)
    );
  }, [payments, studentSearch]);

  // Calculate total for filtered period / current list
  const totalAmountPaise = React.useMemo(() => {
    return filteredPayments.reduce((acc, curr) => acc + (curr.amountReceived || 0), 0);
  }, [filteredPayments]);

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    try {
      const res = await paymentsApi.receipt(paymentId);
      downloadBlob(res.data, `Receipt-${receiptNumber}.pdf`);
      toast.success(`Receipt ${receiptNumber} downloaded`);
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-eyebrow">Financial Ledger</span>
          <h2 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
            Fee Payments & Receipts
          </h2>
          <p className="text-sm text-[#65788c] mt-0.5">
            Track student fee collections, revenue journals, and export digital tax invoices.
          </p>
        </div>
        <div>
          <Link
            to="/admin/payments/record"
            className="btn btn-primary inline-flex items-center gap-2 text-sm shadow-sm"
          >
            <PlusCircle size={16} />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card bg-white p-4 rounded-lg border border-[#dce8f0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Student/Receipt search */}
          <div className="relative min-w-[240px] flex items-center bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-3 py-2 focus-within:border-[#13b8c8] transition-colors">
            <Search size={15} className="text-[#65788c] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search student or receipt..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="text-base md:text-xs w-full bg-transparent text-[#0b1d2e] placeholder-[#65788c] focus:outline-none"
            />
            {studentSearch && (
              <button
                type="button"
                onClick={() => setStudentSearch('')}
                className="text-[#65788c] hover:text-[#0b1d2e]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date from */}
          <div className="flex items-center gap-1.5 text-xs text-[#65788c] bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5">
            <span className="font-medium text-[#0b1d2e]">From:</span>
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => {
                setFromFilter(e.target.value);
                setPage(1);
              }}
              className="text-base md:text-xs bg-transparent text-[#0b1d2e] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-1.5 text-xs text-[#65788c] bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5">
            <span className="font-medium text-[#0b1d2e]">To:</span>
            <input
              type="date"
              value={toFilter}
              onChange={(e) => {
                setToFilter(e.target.value);
                setPage(1);
              }}
              className="text-base md:text-xs bg-transparent text-[#0b1d2e] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
            <Filter size={13} className="text-[#65788c]" />
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-[#0b1d2e] font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Payment Methods</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(fromFilter || toFilter || methodFilter || studentSearch) && (
            <button
              type="button"
              onClick={() => {
                setFromFilter('');
                setToFilter('');
                setMethodFilter('');
                setStudentSearch('');
                setPage(1);
              }}
              className="text-xs text-[#8B1A1A] hover:underline px-2 py-1 font-semibold transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Totals Summary Card */}
      <div className="bg-[#0b1d2e] text-[#f4f9fc] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#13b8c8]/30 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#13b8c8]/20 border border-[#13b8c8]/40 text-[#13b8c8] flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#13b8c8] font-eyebrow font-semibold">
              Period Collection Volume
            </div>
            <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#f4f9fc] mt-0.5 tracking-tight">
              {formatINR(totalAmountPaise)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#f4f9fc]/70 font-sans bg-white/5 px-3 py-2 rounded border border-white/10">
          <Receipt size={15} className="text-[#13b8c8]" />
          <span>Showing <strong className="text-[#f4f9fc]">{filteredPayments.length}</strong> payment transactions</span>
        </div>
      </div>

      {/* Mobile Card View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          // Mobile Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-[#edf4f8] rounded"></div>
                <div className="h-5 w-20 bg-[#edf4f8] rounded"></div>
              </div>
              <div className="h-4 w-36 bg-[#edf4f8] rounded"></div>
              <div className="h-4 w-full bg-[#edf4f8] rounded"></div>
              <div className="h-10 w-full bg-[#edf4f8] rounded-xl pt-2"></div>
            </div>
          ))
        ) : filteredPayments.length === 0 ? (
          // Mobile Empty state
          <div className="rounded-2xl border border-[#dce8f0] bg-white p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 flex items-center justify-center text-[#13b8c8] mx-auto mb-3">
              <CreditCard size={28} />
            </div>
            <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
              No payments found
            </p>
            <p className="text-xs text-[#65788c] mt-1 max-w-sm mx-auto">
              Try adjusting your date range or payment filter parameters.
            </p>
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-sm space-y-3"
            >
              {/* Top row: Receipt # (mono bold) + Amount (INR) */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#0b1d2e] bg-[#f4f9fc] border border-[#dce8f0] px-2.5 py-1 rounded-md">
                  #{p.receiptNumber}
                </span>
                <span className="font-[family-name:var(--font-ui)] font-bold text-[#1A5C3B] text-base">
                  {formatINR(p.amountReceived)}
                </span>
              </div>

              {/* Second row: Student name & code */}
              <div className="flex items-center justify-between gap-2 text-xs">
                {p.studentId ? (
                  <Link
                    to={`/admin/students/${p.studentId._id}`}
                    className="font-semibold text-sm text-[#0b1d2e] hover:text-[#13b8c8] transition-colors"
                  >
                    {p.studentId.name}
                    <span className="ml-1.5 font-mono text-xs text-[#65788c] font-normal">
                      ({p.studentId.studentCode})
                    </span>
                  </Link>
                ) : (
                  <span className="text-[#65788c] italic text-xs">Unknown Student</span>
                )}
                {p.status && (
                  <span className="badge badge-success text-[10px] uppercase font-bold tracking-wider shrink-0">
                    {p.status}
                  </span>
                )}
              </div>

              {/* Third row: Payment method + Category & Period */}
              <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f0f5f9]">
                <span className="px-2.5 py-1 rounded bg-[#edf4f8] border border-[#dce8f0] text-[#0b1d2e] font-medium text-[10px] uppercase font-eyebrow tracking-wider">
                  {getPaymentMethodLabel(p.paymentMethod)}
                </span>

                <div className="text-right">
                  <div className="font-semibold text-xs text-[#0b1d2e]">{p.feeCategory}</div>
                  {p.periodLabel && (
                    <div className="text-[11px] text-[#65788c]">{p.periodLabel}</div>
                  )}
                </div>
              </div>

              {/* Fourth row: Date + Download Receipt Button (min 44px touch target) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f5f9]">
                <div className="text-xs text-[#65788c]">
                  Date: <span className="font-medium text-[#0b1d2e]">{formatDate(p.paymentDate)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#dce8f0] hover:border-[#13b8c8] text-[#0b1d2e] inline-flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Download Tax Receipt"
                >
                  <Download size={14} className="text-[#13b8c8]" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payments Table */}
      <div className="table-container shadow-sm border border-[#dce8f0] rounded-2xl md:rounded-lg overflow-hidden bg-white">
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4">Receipt No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category / Period</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce8f0]/70 text-xs text-[#0b1d2e]">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-5 w-full bg-[#edf4f8] animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-[#65788c]">
                    <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 flex items-center justify-center text-[#13b8c8] mb-3">
                      <CreditCard size={28} />
                    </div>
                    <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">No payments found</p>
                    <p className="text-xs text-[#65788c] mt-1">
                      Try adjusting your date range or payment filter parameters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p._id} className="hover:bg-[#f4f9fc]/60 transition-colors">
                  {/* Receipt */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0b1d2e] text-xs">
                    {p.receiptNumber}
                  </td>

                  {/* Student */}
                  <td className="py-3.5 px-4">
                    {p.studentId ? (
                      <Link
                        to={`/admin/students/${p.studentId._id}`}
                        className="font-semibold text-[#0b1d2e] hover:text-[#13b8c8] transition-colors"
                      >
                        {p.studentId.name}
                        <span className="block text-[11px] font-mono text-[#65788c] font-normal">
                          {p.studentId.studentCode}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-[#65788c] italic">Unknown</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-[family-name:var(--font-ui)] font-bold text-[#1A5C3B] text-sm">
                    {formatINR(p.amountReceived)}
                  </td>

                  {/* Method */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-[#edf4f8] border border-[#dce8f0] text-[#0b1d2e] font-medium text-[10px] uppercase font-eyebrow tracking-wider">
                      {getPaymentMethodLabel(p.paymentMethod)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-[#65788c]">
                    {formatDate(p.paymentDate)}
                  </td>

                  {/* Category & Period */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#0b1d2e]">{p.feeCategory}</div>
                    {p.periodLabel && (
                      <div className="text-[11px] text-[#65788c]">{p.periodLabel}</div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                      className="btn btn-secondary py-1 px-2.5 text-xs bg-white border-[#dce8f0] hover:border-[#13b8c8] text-[#0b1d2e] inline-flex items-center gap-1.5"
                      title="Download Tax Receipt"
                    >
                      <Download size={13} className="text-[#13b8c8]" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t-0 md:border-t border-[#dce8f0] bg-[#f4f9fc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#65788c]">
          <div>
            Showing Page <span className="font-semibold text-[#0b1d2e]">{page}</span> of{' '}
            <span className="font-semibold text-[#0b1d2e]">{totalPages}</span> (Total {totalCount} transactions)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary py-1 px-3 text-xs bg-white border-[#dce8f0] disabled:opacity-40 disabled:pointer-events-none min-h-[44px] md:min-h-0 flex items-center justify-center"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary py-1 px-3 text-xs bg-white border-[#dce8f0] disabled:opacity-40 disabled:pointer-events-none min-h-[44px] md:min-h-0 flex items-center justify-center"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
