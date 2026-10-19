import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  PlusCircle,
  Download,
  Filter,
  Search,
  TrendingUp,
  Receipt,
  X,
} from 'lucide-react';
import { paymentsApi } from '../../lib/api';
import TablePagination from '../../components/admin/TablePagination';
import ColumnPicker, { useColumnVisibility } from '../../components/admin/ColumnPicker';
import FilterDialog from '../../components/admin/FilterDialog';
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

const PAYMENT_COLUMNS = [
  { id: 'receipt', label: 'Receipt No' },
  { id: 'student', label: 'Student' },
  { id: 'amount', label: 'Amount' },
  { id: 'method', label: 'Method' },
  { id: 'date', label: 'Date' },
  { id: 'category', label: 'Category / Period' },
  { id: 'actions', label: 'Actions' },
];

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [draftMethod, setDraftMethod] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const columns = useColumnVisibility('ldl.columns.payments', PAYMENT_COLUMNS);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: pageSize,
      };
      if (fromFilter) params.from = fromFilter;
      if (toFilter) params.to = toFilter;
      if (methodFilter) params.method = methodFilter;

      const res = await paymentsApi.list(params);
      if (res.data.success) {
        setPayments(res.data.data);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, fromFilter, toFilter, methodFilter]);

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
          <h2 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
            Fee Payments & Receipts
          </h2>
          <p className="text-sm text-[#8a7a60] mt-0.5">
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
      <div className="card bg-white p-4 rounded-lg border border-[#e8dcc8] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          {/* Student/Receipt search */}
          <div className="relative flex min-w-0 flex-1 items-center rounded-md border border-[#e8dcc8] bg-[#faf6f0] px-3 py-2 transition-colors focus-within:border-[#c2a66e] sm:w-auto sm:min-w-[240px]">
            <Search size={15} className="text-[#8a7a60] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search student or receipt..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="text-base md:text-xs w-full bg-transparent text-[#2c1f0e] placeholder-[#8a7a60] focus:outline-none"
            />
            {studentSearch && (
              <button
                type="button"
                onClick={() => setStudentSearch('')}
                className="text-[#8a7a60] hover:text-[#2c1f0e]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <FilterDialog
            open={filtersOpen}
            activeCount={[fromFilter, toFilter, methodFilter].filter(Boolean).length}
            onOpen={() => {
              setDraftFrom(fromFilter);
              setDraftTo(toFilter);
              setDraftMethod(methodFilter);
              setFiltersOpen(true);
            }}
            onClose={() => setFiltersOpen(false)}
            onClear={() => {
              setDraftFrom('');
              setDraftTo('');
              setDraftMethod('');
            }}
            onApply={() => {
              setFromFilter(draftFrom);
              setToFilter(draftTo);
              setMethodFilter(draftMethod);
              setPage(1);
              setFiltersOpen(false);
            }}
          >
            <label className="block text-xs font-semibold text-[#294055]">
              From
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#e8dcc8] bg-[#faf6f0] px-3 py-3 text-sm text-[#2c1f0e]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#294055]">
              To
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#e8dcc8] bg-[#faf6f0] px-3 py-3 text-sm text-[#2c1f0e]"
              />
            </label>
            <label className="block text-xs font-semibold text-[#294055]">
              Payment method
              <select
                value={draftMethod}
                onChange={(e) => setDraftMethod(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#e8dcc8] bg-[#faf6f0] px-3 py-3 text-sm text-[#2c1f0e]"
              >
                <option value="">All Payment Methods</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </label>
          </FilterDialog>
          </div>

          {/* Date from */}
          <div className="hidden items-center gap-1.5 text-xs text-[#8a7a60] bg-[#faf6f0] border border-[#e8dcc8] rounded-md px-2.5 py-1.5 md:flex">
            <span className="font-medium text-[#2c1f0e]">From:</span>
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => {
                setFromFilter(e.target.value);
                setPage(1);
              }}
              className="text-base md:text-xs bg-transparent text-[#2c1f0e] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Date to */}
          <div className="hidden items-center gap-1.5 text-xs text-[#8a7a60] bg-[#faf6f0] border border-[#e8dcc8] rounded-md px-2.5 py-1.5 md:flex">
            <span className="font-medium text-[#2c1f0e]">To:</span>
            <input
              type="date"
              value={toFilter}
              onChange={(e) => {
                setToFilter(e.target.value);
                setPage(1);
              }}
              className="text-base md:text-xs bg-transparent text-[#2c1f0e] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Payment Method */}
          <div className="hidden bg-[#faf6f0] border border-[#e8dcc8] rounded-md px-2.5 py-1.5 md:flex items-center gap-1.5">
            <Filter size={13} className="text-[#8a7a60]" />
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-[#2c1f0e] font-medium focus:outline-none cursor-pointer"
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
              className="hidden text-xs text-[#8B1A1A] hover:underline px-2 py-1 font-semibold transition-colors md:inline"
            >
              Reset filters
            </button>
          )}
          <ColumnPicker columns={columns.columns} visible={columns.visible} onToggle={columns.toggle} />
        </div>
      </div>

      {/* Totals Summary Card */}
      <div className="bg-[#2c1f0e] text-[#faf6f0] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#c2a66e]/30 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#c2a66e]/20 border border-[#c2a66e]/40 text-[#c2a66e] flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#c2a66e] font-eyebrow font-semibold">
              Period Collection Volume
            </div>
            <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#faf6f0] mt-0.5 tracking-tight">
              {formatINR(totalAmountPaise)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#faf6f0]/70 font-sans bg-white/5 px-3 py-2 rounded border border-white/10">
          <Receipt size={15} className="text-[#c2a66e]" />
          <span>Showing <strong className="text-[#faf6f0]">{filteredPayments.length}</strong> payment transactions</span>
        </div>
      </div>

      {/* Mobile Card View (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          // Mobile Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#e8dcc8] bg-white p-4 shadow-sm space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-[#f5f0e6] rounded"></div>
                <div className="h-5 w-20 bg-[#f5f0e6] rounded"></div>
              </div>
              <div className="h-4 w-36 bg-[#f5f0e6] rounded"></div>
              <div className="h-4 w-full bg-[#f5f0e6] rounded"></div>
              <div className="h-10 w-full bg-[#f5f0e6] rounded-xl pt-2"></div>
            </div>
          ))
        ) : filteredPayments.length === 0 ? (
          // Mobile Empty state
          <div className="rounded-2xl border border-[#e8dcc8] bg-white p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#c2a66e]/10 flex items-center justify-center text-[#c2a66e] mx-auto mb-3">
              <CreditCard size={28} />
            </div>
            <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
              No payments found
            </p>
            <p className="text-xs text-[#8a7a60] mt-1 max-w-sm mx-auto">
              Try adjusting your date range or payment filter parameters.
            </p>
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl border border-[#e8dcc8] bg-white p-4 shadow-sm space-y-3"
            >
              {/* Top row: Receipt # (mono bold) + Amount (INR) */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#2c1f0e] bg-[#faf6f0] border border-[#e8dcc8] px-2.5 py-1 rounded-md">
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
                    className="font-semibold text-sm text-[#2c1f0e] hover:text-[#c2a66e] transition-colors"
                  >
                    {p.studentId.name}
                    <span className="ml-1.5 font-mono text-xs text-[#8a7a60] font-normal">
                      ({p.studentId.studentCode})
                    </span>
                  </Link>
                ) : (
                  <span className="text-[#8a7a60] italic text-xs">Unknown Student</span>
                )}
                {p.status && (
                  <span className="badge badge-success text-[10px] uppercase font-bold tracking-wider shrink-0">
                    {p.status}
                  </span>
                )}
              </div>

              {/* Third row: Payment method + Category & Period */}
              <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f0f5f9]">
                <span className="px-2.5 py-1 rounded bg-[#f5f0e6] border border-[#e8dcc8] text-[#2c1f0e] font-medium text-[10px] uppercase font-eyebrow tracking-wider">
                  {getPaymentMethodLabel(p.paymentMethod)}
                </span>

                <div className="text-right">
                  <div className="font-semibold text-xs text-[#2c1f0e]">{p.feeCategory}</div>
                  {p.periodLabel && (
                    <div className="text-[11px] text-[#8a7a60]">{p.periodLabel}</div>
                  )}
                </div>
              </div>

              {/* Fourth row: Date + Download Receipt Button (min 44px touch target) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f5f9]">
                <div className="text-xs text-[#8a7a60]">
                  Date: <span className="font-medium text-[#2c1f0e]">{formatDate(p.paymentDate)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#e8dcc8] hover:border-[#c2a66e] text-[#2c1f0e] inline-flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Download Tax Receipt"
                >
                  <Download size={14} className="text-[#c2a66e]" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {PAYMENT_COLUMNS.filter((column) => columns.visible(column.id)).map((column) => (
                <th
                  key={column.id}
                  className={`py-3 px-4 ${column.id === 'actions' ? 'text-right' : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dcc8]/70 text-xs text-[#2c1f0e]">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.shownCount} className="py-4 px-4">
                    <div className="h-5 w-full bg-[#f5f0e6] animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={columns.shownCount} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-[#8a7a60]">
                    <div className="w-14 h-14 rounded-full bg-[#c2a66e]/10 flex items-center justify-center text-[#c2a66e] mb-3">
                      <CreditCard size={28} />
                    </div>
                    <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">No payments found</p>
                    <p className="text-xs text-[#8a7a60] mt-1">
                      Try adjusting your date range or payment filter parameters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p._id} className="hover:bg-[#faf6f0]/60 transition-colors">
                  {columns.visible('receipt') && (
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2c1f0e] text-xs">
                    {p.receiptNumber}
                  </td>
                  )}

                  {columns.visible('student') && (
                  <td className="py-3.5 px-4">
                    {p.studentId ? (
                      <Link
                        to={`/admin/students/${p.studentId._id}`}
                        className="font-semibold text-[#2c1f0e] hover:text-[#c2a66e] transition-colors"
                      >
                        {p.studentId.name}
                        <span className="block text-[11px] font-mono text-[#8a7a60] font-normal">
                          {p.studentId.studentCode}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-[#8a7a60] italic">Unknown</span>
                    )}
                  </td>
                  )}

                  {columns.visible('amount') && (
                  <td className="py-3.5 px-4 font-[family-name:var(--font-ui)] font-bold text-[#1A5C3B] text-sm">
                    {formatINR(p.amountReceived)}
                  </td>
                  )}

                  {columns.visible('method') && (
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-[#f5f0e6] border border-[#e8dcc8] text-[#2c1f0e] font-medium text-[10px] uppercase font-eyebrow tracking-wider">
                      {getPaymentMethodLabel(p.paymentMethod)}
                    </span>
                  </td>
                  )}

                  {columns.visible('date') && (
                  <td className="py-3.5 px-4 text-[#8a7a60]">
                    {formatDate(p.paymentDate)}
                  </td>
                  )}

                  {columns.visible('category') && (
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#2c1f0e]">{p.feeCategory}</div>
                    {p.periodLabel && (
                      <div className="text-[11px] text-[#8a7a60]">{p.periodLabel}</div>
                    )}
                  </td>
                  )}

                  {columns.visible('actions') && (
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                      className="btn btn-secondary py-1 px-2.5 text-xs bg-white border-[#e8dcc8] hover:border-[#c2a66e] text-[#2c1f0e] inline-flex items-center gap-1.5"
                      title="Download Tax Receipt"
                    >
                      <Download size={13} className="text-[#c2a66e]" />
                      <span>Receipt</span>
                    </button>
                  </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={totalCount}
          shown={filteredPayments.length}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default PaymentsPage;
