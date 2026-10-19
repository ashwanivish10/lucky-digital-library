import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Armchair,
  FileText,
  Home,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentsApi, paymentsApi } from '../../lib/api';
import { formatINR, formatDate, getStatusBadgeClass, getStatusLabel, getPaymentMethodLabel, downloadBlob } from '../../lib/utils';
import { SeatMap } from '../../components/common/SeatMap';
import MobileBottomNav from '../../components/public/MobileBottomNav';
import toast from 'react-hot-toast';

export const PortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'student' || !user.studentId) {
      setLoading(false);
      return;
    }

    studentsApi.get(user.studentId)
      .then((res) => {
        setStudentData(res.data?.data);
      })
      .catch((err) => {
        console.error('Failed to load student portal data:', err);
        toast.error('Unable to retrieve membership record.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDownloadReceipt = async (paymentId: string, receiptNo: string) => {
    setDownloadingId(paymentId);
    try {
      const res = await paymentsApi.receipt(paymentId);
      downloadBlob(res.data, `Receipt-${receiptNo}.pdf`);
      toast.success('Receipt downloaded successfully');
    } catch {
      toast.error('Could not generate PDF receipt.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const student = studentData?.student || user?.studentProfile;
  const memberships = studentData?.memberships || [];
  const payments = studentData?.payments || [];
  const outstanding = studentData?.outstanding || 0;

  const activeMembership = memberships.find((m: any) =>
    ['active', 'expiring_soon'].includes(m.status)
  ) || memberships[0];

  const calculateDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = activeMembership ? calculateDaysRemaining(activeMembership.endDate) : null;
  const isExpiringSoon = activeMembership?.status === 'expiring_soon' || (daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0);

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2c1f0e]">
      {/* Top Navigation Bar */}
      <header className="bg-[#2c1f0e] text-white border-b border-[#c2a66e]/20 sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#a38b52] to-[#c2a66e] text-[#2c1f0e] flex items-center justify-center font-[family-name:var(--font-ui)] font-bold text-lg shadow-sm">
                L
              </div>
              <div className="hidden sm:block">
                <span className="font-[family-name:var(--font-ui)] font-bold text-base tracking-wide block leading-tight">
                  Lucky Digital Library
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#c2a66e]">
                  Student Portal
                </span>
              </div>
            </Link>

            {/* Back to Homepage Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8a7a60] hover:text-[#a38b52] transition-colors ml-2 pl-3 border-l border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Homepage</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[11px] font-mono text-[#c2a66e]">{student?.studentCode || 'Member'}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container with Desktop Centering & Mobile Bottom Clearance */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8 w-full">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 card border-[#e8dcc8] p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2a66e] block mb-1">
              Scholar Dashboard
            </span>
            <h1 className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl text-[#2c1f0e] leading-tight">
              <span className="text-[#c2a66e]">Welcome back,</span> {user?.name || 'Scholar'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8a7a60] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Student ID: <strong className="font-mono text-[#2c1f0e]">{student?.studentCode || 'N/A'}</strong></span>
              <span>&bull;</span>
              <span>Joined: {student?.joiningDate ? formatDate(student.joiningDate) : 'Active Member'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-[#faf6f0] rounded-lg border border-[#e8dcc8] text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8a7a60]">Assigned Seat</div>
              <div className="text-base font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] flex items-center justify-center gap-1.5 mt-0.5">
                <Armchair className="w-4 h-4 text-[#c2a66e]" />
                {student?.seatNumber ? `Seat ${student.seatNumber}` : 'Flex / Open Desk'}
              </div>
              {student?.shiftTimings ? (
                <div className="mt-1 max-w-52 text-[10px] font-semibold text-[#a38b52]">
                  {student.shiftTimings}
                </div>
              ) : student?.seatNumber && student?.seatDays?.length > 0 ? (
                <div className="mt-1.5 max-w-52 text-[10px] leading-relaxed text-[#8a7a60]">
                  {student.seatDays.map((day: string) => day.slice(0, 3)).join(', ')}
                  {' · '}{student.seatStartTime}–{student.seatEndTime}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* TOP ROW: 3 Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {/* Stat 1: Membership Status */}
          <div className="card border-[#e8dcc8] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7a60]">Membership Status</span>
                {activeMembership && (
                  <span className={`badge ${getStatusBadgeClass(activeMembership.status)}`}>
                    {getStatusLabel(activeMembership.status)}
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#2c1f0e] mb-1">
                {activeMembership?.planNameSnapshot || (loading ? 'Loading...' : 'No Active Plan')}
              </div>
            </div>
            <div className="text-xs text-[#8a7a60] mt-3 pt-3 border-t border-[#f5f0e6] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#c2a66e]" />
              <span>{activeMembership ? `Valid until ${formatDate(activeMembership.endDate)}` : 'Contact reception'}</span>
            </div>
          </div>

          {/* Stat 2: Days Remaining */}
          <div className="card border-[#e8dcc8] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7a60]">Days Remaining</span>
                <Clock className="w-4 h-4 text-[#c2a66e]" />
              </div>
              <div className="font-[family-name:var(--font-ui)] font-bold text-3xl text-[#2c1f0e] mb-1">
                {daysRemaining !== null ? `${daysRemaining} Days` : '—'}
              </div>
            </div>
            <div className="text-xs text-[#8a7a60] mt-3 pt-3 border-t border-[#f5f0e6]">
              {daysRemaining !== null
                ? isExpiringSoon
                  ? <span className="text-[#d4b87a] font-semibold">Expiring soon &bull; Renew at desk</span>
                  : 'Active membership tenure'
                : 'No active tenure record'}
            </div>
          </div>

          {/* Stat 3: Outstanding Balance */}
          <div className={`card flex flex-col justify-between transition-colors ${
            outstanding > 0 ? 'border-[#8B1A1A]/30 bg-[#8B1A1A]/5' : 'border-[#e8dcc8]'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7a60]">Outstanding Balance</span>
                <CreditCard className={`w-4 h-4 ${outstanding > 0 ? 'text-[#8B1A1A]' : 'text-[#1A5C3B]'}`} />
              </div>
              <div className={`font-[family-name:var(--font-ui)] font-bold text-3xl mb-1 ${
                outstanding > 0 ? 'text-[#8B1A1A]' : 'text-[#1A5C3B]'
              }`}>
                {formatINR(outstanding)}
              </div>
            </div>
            <div className="text-xs mt-3 pt-3 border-t border-[#f5f0e6]">
              {outstanding > 0 ? (
                <span className="text-[#8B1A1A] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Dues Pending Settlement
                </span>
              ) : (
                <span className="text-[#1A5C3B] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> All Dues Cleared
                </span>
              )}
            </div>
          </div>
        </div>

        {/* OUTSTANDING BALANCE HIGHLIGHTED CARD (if balance > 0) */}
        {outstanding > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-lg bg-[#8B1A1A]/10 border border-[#8B1A1A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#8B1A1A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#8B1A1A] leading-tight">
                  Outstanding Balance Notice: {formatINR(outstanding)}
                </h4>
                <p className="text-xs text-[#8a7a60] mt-1">
                  Please clear your pending fee balance at the library reception desk or via UPI to maintain uninterrupted seat reservations.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-[#8B1A1A] bg-white px-3 py-1.5 rounded border border-[#8B1A1A]/20 shrink-0">
              Payment Pending
            </div>
          </motion.div>
        )}

        {/* MEMBERSHIP CARD */}
        {activeMembership && (
          <div className="card border-[#e8dcc8] mb-8 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#f5f0e6]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c2a66e]">
                  Enrolled Plan Details
                </span>
                <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#2c1f0e] mt-0.5">
                  {activeMembership.planNameSnapshot}
                </h3>
              </div>
              <div>
                <span className={`badge ${getStatusBadgeClass(activeMembership.status)}`}>
                  {getStatusLabel(activeMembership.status)}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded bg-[#faf6f0] border border-[#e8dcc8]">
                <span className="text-[#8a7a60] block mb-1">Start Date</span>
                <strong className="text-sm text-[#2c1f0e] font-medium">{formatDate(activeMembership.startDate)}</strong>
              </div>
              <div className="p-3.5 rounded bg-[#faf6f0] border border-[#e8dcc8]">
                <span className="text-[#8a7a60] block mb-1">End Date</span>
                <strong className="text-sm text-[#2c1f0e] font-medium">{formatDate(activeMembership.endDate)}</strong>
              </div>
              <div className="p-3.5 rounded bg-[#faf6f0] border border-[#e8dcc8]">
                <span className="text-[#8a7a60] block mb-1">Fee Agreed</span>
                <strong className="text-sm text-[#2c1f0e] font-medium">{formatINR(activeMembership.baseFeeSnapshot)}</strong>
              </div>
            </div>

            {/* Renewal Notice if expiring */}
            {isExpiringSoon && (
              <div className="mt-5 p-3.5 rounded bg-[#d4b87a]/10 border border-[#d4b87a]/25 flex items-start gap-2.5 text-xs text-[#d4b87a]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Renewal Notice:</strong> Your membership is expiring within {daysRemaining} days. Please visit the reception desk to renew your subscription and retain your assigned seat.
                </div>
              </div>
            )}
          </div>
        )}

        {/* 58-Seat Interactive Floor Plan & Allocated Seat */}
        <div className="mb-8">
          <SeatMap highlightSeat={student?.seatNumber} />
        </div>

        {/* PAYMENT HISTORY TABLE (clean striped table with receipt download) */}
        <div className="card border-[#e8dcc8] p-6 sm:p-8 mb-8">
          <div className="mb-6 pb-4 border-b border-[#f5f0e6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#2c1f0e]">Payment History & Receipts</h3>
              <p className="text-xs text-[#8a7a60] mt-0.5">
                Official computer-generated fee transaction receipts
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-10 bg-[#faf6f0] rounded-lg border border-dashed border-[#e8dcc8]">
              <FileText className="w-10 h-10 text-[#8a7a60]/50 mx-auto mb-2" />
              <p className="text-sm text-[#8a7a60] font-medium">No payment transactions recorded yet.</p>
              <p className="text-xs text-[#8a7a60]/70 mt-1">Receipts will appear here as fees are processed by administration.</p>
            </div>
          ) : (
            <div>
              {/* Mobile Card List (md:hidden) */}
              <div className="md:hidden space-y-3">
                {payments.map((p: any) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-2xl bg-white border border-[#e8dcc8] shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-xs text-[#2c1f0e] bg-[#faf6f0] border border-[#e8dcc8] px-2 py-0.5 rounded">
                        {p.receiptNumber}
                      </span>
                      <span className="font-bold text-sm text-[#1A5C3B]">
                        {formatINR(p.amountReceived)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8a7a60]">
                      <span>{formatDate(p.paymentDate)}</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#faf6f0] border border-[#e8dcc8] text-[#2c1f0e]">
                        {getPaymentMethodLabel(p.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f5f0e6]">
                      <span className="text-[#8a7a60] font-medium">{p.periodLabel || 'Membership Fee'}</span>
                      <button
                        onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                        disabled={downloadingId === p._id}
                        className="btn btn-secondary text-xs py-2 px-3.5 min-h-[44px] border-[#c2a66e] text-[#2c1f0e] hover:bg-[#c2a66e] hover:text-[#2c1f0e] inline-flex items-center"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        <span>{downloadingId === p._id ? 'Downloading...' : 'PDF Receipt'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-[#e8dcc8]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#2c1f0e] text-white text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Receipt Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8dcc8]">
                    {payments.map((p: any, idx: number) => (
                      <tr
                        key={p._id}
                        className={idx % 2 === 0 ? 'bg-white hover:bg-[#faf6f0]/60 transition-colors' : 'bg-[#faf6f0]/40 hover:bg-[#faf6f0] transition-colors'}
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#2c1f0e]">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-[#2c1f0e]">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#8a7a60]">
                          {p.periodLabel || 'Membership Fee'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#faf6f0] border border-[#e8dcc8] text-[#2c1f0e]">
                            {getPaymentMethodLabel(p.paymentMethod)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#1A5C3B]">
                          {formatINR(p.amountReceived)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                            disabled={downloadingId === p._id}
                            className="btn btn-secondary btn-sm text-xs py-1 px-3 border-[#c2a66e] text-[#2c1f0e] hover:bg-[#c2a66e] hover:text-[#2c1f0e]"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            {downloadingId === p._id ? 'Downloading...' : 'PDF'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Membership Tenure Records */}
        {memberships.length > 0 && (
          <div className="card border-[#e8dcc8] p-6 sm:p-8">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#2c1f0e] mb-4">Membership Tenure Records</h3>
            <div className="space-y-3">
              {memberships.map((m: any) => (
                <div
                  key={m._id}
                  className="p-4 rounded-lg bg-[#faf6f0] border border-[#e8dcc8] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#2c1f0e]">{m.planNameSnapshot}</span>
                      <span className={`badge ${getStatusBadgeClass(m.status)}`}>
                        {getStatusLabel(m.status)}
                      </span>
                      {m.isRenewal && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c2a66e] bg-[#c2a66e]/10 border border-[#c2a66e]/30 px-2 py-0.5 rounded">
                          Renewal
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8a7a60]">
                      {formatDate(m.startDate)} &mdash; {formatDate(m.endDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8a7a60] block">Base Fee</span>
                    <span className="text-sm font-semibold text-[#2c1f0e]">{formatINR(m.baseFeeSnapshot)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default PortalPage;
