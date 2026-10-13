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
    <div className="min-h-screen bg-[#f4f9fc] text-[#0b1d2e]">
      {/* Top Navigation Bar */}
      <header className="bg-[#0b1d2e] text-white border-b border-[#13b8c8]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#087d99] to-[#13b8c8] text-[#0b1d2e] flex items-center justify-center font-[family-name:var(--font-ui)] font-bold text-lg shadow-sm">
                L
              </div>
              <div className="hidden sm:block">
                <span className="font-[family-name:var(--font-ui)] font-bold text-base tracking-wide block leading-tight">
                  Lucky Digital Library
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#13b8c8]">
                  Student Portal
                </span>
              </div>
            </Link>

            {/* Back to Homepage Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#65788c] hover:text-[#087d99] transition-colors ml-2 pl-3 border-l border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Homepage</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[11px] font-mono text-[#13b8c8]">{student?.studentCode || 'Member'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary border-white/20 text-white hover:bg-white/10 btn-sm text-xs py-1.5 px-3"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container with Desktop Centering & Mobile Bottom Clearance */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8 w-full">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 card border-[#dce8f0] p-6 sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#13b8c8] block mb-1">
              Scholar Dashboard
            </span>
            <h1 className="font-[family-name:var(--font-ui)] font-bold text-3xl sm:text-4xl text-[#0b1d2e] leading-tight">
              <span className="text-[#13b8c8]">Welcome back,</span> {user?.name || 'Scholar'}
            </h1>
            <p className="text-xs sm:text-sm text-[#65788c] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Student ID: <strong className="font-mono text-[#0b1d2e]">{student?.studentCode || 'N/A'}</strong></span>
              <span>&bull;</span>
              <span>Joined: {student?.joiningDate ? formatDate(student.joiningDate) : 'Active Member'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-[#f4f9fc] rounded-lg border border-[#dce8f0] text-center min-w-[120px]">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#65788c]">Assigned Seat</div>
              <div className="text-base font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] flex items-center justify-center gap-1.5 mt-0.5">
                <Armchair className="w-4 h-4 text-[#13b8c8]" />
                {student?.seatNumber ? `Seat ${student.seatNumber}` : 'Flex / Open Desk'}
              </div>
              {student?.shiftTimings ? (
                <div className="mt-1 max-w-52 text-[10px] font-semibold text-[#087d99]">
                  {student.shiftTimings}
                </div>
              ) : student?.seatNumber && student?.seatDays?.length > 0 ? (
                <div className="mt-1.5 max-w-52 text-[10px] leading-relaxed text-[#65788c]">
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
          <div className="card border-[#dce8f0] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c]">Membership Status</span>
                {activeMembership && (
                  <span className={`badge ${getStatusBadgeClass(activeMembership.status)}`}>
                    {getStatusLabel(activeMembership.status)}
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#0b1d2e] mb-1">
                {activeMembership?.planNameSnapshot || (loading ? 'Loading...' : 'No Active Plan')}
              </div>
            </div>
            <div className="text-xs text-[#65788c] mt-3 pt-3 border-t border-[#edf4f8] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#13b8c8]" />
              <span>{activeMembership ? `Valid until ${formatDate(activeMembership.endDate)}` : 'Contact reception'}</span>
            </div>
          </div>

          {/* Stat 2: Days Remaining */}
          <div className="card border-[#dce8f0] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c]">Days Remaining</span>
                <Clock className="w-4 h-4 text-[#13b8c8]" />
              </div>
              <div className="font-[family-name:var(--font-ui)] font-bold text-3xl text-[#0b1d2e] mb-1">
                {daysRemaining !== null ? `${daysRemaining} Days` : '—'}
              </div>
            </div>
            <div className="text-xs text-[#65788c] mt-3 pt-3 border-t border-[#edf4f8]">
              {daysRemaining !== null
                ? isExpiringSoon
                  ? <span className="text-[#5dc4ff] font-semibold">Expiring soon &bull; Renew at desk</span>
                  : 'Active membership tenure'
                : 'No active tenure record'}
            </div>
          </div>

          {/* Stat 3: Outstanding Balance */}
          <div className={`card flex flex-col justify-between transition-colors ${
            outstanding > 0 ? 'border-[#8B1A1A]/30 bg-[#8B1A1A]/5' : 'border-[#dce8f0]'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#65788c]">Outstanding Balance</span>
                <CreditCard className={`w-4 h-4 ${outstanding > 0 ? 'text-[#8B1A1A]' : 'text-[#1A5C3B]'}`} />
              </div>
              <div className={`font-[family-name:var(--font-ui)] font-bold text-3xl mb-1 ${
                outstanding > 0 ? 'text-[#8B1A1A]' : 'text-[#1A5C3B]'
              }`}>
                {formatINR(outstanding)}
              </div>
            </div>
            <div className="text-xs mt-3 pt-3 border-t border-[#edf4f8]">
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
                <p className="text-xs text-[#65788c] mt-1">
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
          <div className="card border-[#dce8f0] mb-8 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#edf4f8]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#13b8c8]">
                  Enrolled Plan Details
                </span>
                <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#0b1d2e] mt-0.5">
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
              <div className="p-3.5 rounded bg-[#f4f9fc] border border-[#dce8f0]">
                <span className="text-[#65788c] block mb-1">Start Date</span>
                <strong className="text-sm text-[#0b1d2e] font-medium">{formatDate(activeMembership.startDate)}</strong>
              </div>
              <div className="p-3.5 rounded bg-[#f4f9fc] border border-[#dce8f0]">
                <span className="text-[#65788c] block mb-1">End Date</span>
                <strong className="text-sm text-[#0b1d2e] font-medium">{formatDate(activeMembership.endDate)}</strong>
              </div>
              <div className="p-3.5 rounded bg-[#f4f9fc] border border-[#dce8f0]">
                <span className="text-[#65788c] block mb-1">Fee Agreed</span>
                <strong className="text-sm text-[#0b1d2e] font-medium">{formatINR(activeMembership.baseFeeSnapshot)}</strong>
              </div>
            </div>

            {/* Renewal Notice if expiring */}
            {isExpiringSoon && (
              <div className="mt-5 p-3.5 rounded bg-[#5dc4ff]/10 border border-[#5dc4ff]/25 flex items-start gap-2.5 text-xs text-[#5dc4ff]">
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
        <div className="card border-[#dce8f0] p-6 sm:p-8 mb-8">
          <div className="mb-6 pb-4 border-b border-[#edf4f8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#0b1d2e]">Payment History & Receipts</h3>
              <p className="text-xs text-[#65788c] mt-0.5">
                Official computer-generated fee transaction receipts
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-10 bg-[#f4f9fc] rounded-lg border border-dashed border-[#dce8f0]">
              <FileText className="w-10 h-10 text-[#65788c]/50 mx-auto mb-2" />
              <p className="text-sm text-[#65788c] font-medium">No payment transactions recorded yet.</p>
              <p className="text-xs text-[#65788c]/70 mt-1">Receipts will appear here as fees are processed by administration.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#dce8f0]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0b1d2e] text-white text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Receipt Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dce8f0]">
                  {payments.map((p: any, idx: number) => (
                    <tr
                      key={p._id}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-[#f4f9fc]/60 transition-colors' : 'bg-[#f4f9fc]/40 hover:bg-[#f4f9fc] transition-colors'}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0b1d2e]">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#0b1d2e]">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#65788c]">
                        {p.periodLabel || 'Membership Fee'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#f4f9fc] border border-[#dce8f0] text-[#0b1d2e]">
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
                          className="btn btn-secondary btn-sm text-xs py-1 px-3 border-[#13b8c8] text-[#0b1d2e] hover:bg-[#13b8c8] hover:text-[#0b1d2e]"
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
          )}
        </div>

        {/* Membership Tenure Records */}
        {memberships.length > 0 && (
          <div className="card border-[#dce8f0] p-6 sm:p-8">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-2xl text-[#0b1d2e] mb-4">Membership Tenure Records</h3>
            <div className="space-y-3">
              {memberships.map((m: any) => (
                <div
                  key={m._id}
                  className="p-4 rounded-lg bg-[#f4f9fc] border border-[#dce8f0] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#0b1d2e]">{m.planNameSnapshot}</span>
                      <span className={`badge ${getStatusBadgeClass(m.status)}`}>
                        {getStatusLabel(m.status)}
                      </span>
                      {m.isRenewal && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#13b8c8] bg-[#13b8c8]/10 border border-[#13b8c8]/30 px-2 py-0.5 rounded">
                          Renewal
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#65788c]">
                      {formatDate(m.startDate)} &mdash; {formatDate(m.endDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#65788c] block">Base Fee</span>
                    <span className="text-sm font-semibold text-[#0b1d2e]">{formatINR(m.baseFeeSnapshot)}</span>
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
