import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Award,
  IndianRupee,
  TrendingUp,
  XCircle,
  ArrowRight,
  RefreshCw,
  UserPlus,
  PlusCircle,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import toast from 'react-hot-toast';

interface SummaryData {
  totalStudents: number;
  activeStudents: number;
  pendingApprovals: number;
  activeMemberships: number;
  expiredMemberships: number;
  expiringSoon: number;
  monthlyCollected: number; // in INR
  yearlyCollected: number; // in INR
}

interface MonthlyFeeItem {
  _id: { year: number; month: number };
  total: number; // in paise
  count: number;
}

interface MonthlyRegItem {
  _id: { year: number; month: number };
  count: number;
}

interface StatusItem {
  _id: string;
  count: number;
}

interface PaymentMethodItem {
  _id: string;
  total: number;
  count: number;
}

interface AnalyticsData {
  monthlyFees: MonthlyFeeItem[];
  monthlyRegistrations: MonthlyRegItem[];
  membershipStatusBreakdown: StatusItem[];
  paymentMethodBreakdown: PaymentMethodItem[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PIE_COLORS: Record<string, string> = {
  active: '#13b8c8',
  expiring_soon: '#5dc4ff',
  expired: '#f87171',
  suspended: '#73849d',
  inactive: '#b6c6d5',
};

const BAR_COLORS = ['#13b8c8', '#5dc4ff', '#7f8cff', '#6ee7b7', '#17344a'];

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, anaRes] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.analytics(),
      ]);
      setSummary(sumRes.data.data);
      setAnalytics(anaRes.data.data);
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format monthly fee data for BarChart
  const formattedFeeData = React.useMemo(() => {
    if (!analytics?.monthlyFees) return [];
    return analytics.monthlyFees.map((item) => ({
      name: `${MONTH_NAMES[item._id.month - 1]} '${String(item._id.year).slice(-2)}`,
      amount: item.total / 100, // paise to INR
      transactions: item.count,
    }));
  }, [analytics]);

  // Format registrations data for LineChart
  const formattedRegData = React.useMemo(() => {
    if (!analytics?.monthlyRegistrations) return [];
    return analytics.monthlyRegistrations.map((item) => ({
      name: `${MONTH_NAMES[item._id.month - 1]} '${String(item._id.year).slice(-2)}`,
      registrations: item.count,
    }));
  }, [analytics]);

  // Format membership status breakdown for PieChart
  const formattedStatusData = React.useMemo(() => {
    if (!analytics?.membershipStatusBreakdown) return [];
    return analytics.membershipStatusBreakdown.map((item) => {
      const label = item._id.replace('_', ' ').toUpperCase();
      return {
        name: label,
        statusKey: item._id,
        value: item.count,
      };
    });
  }, [analytics]);

  // Format payment methods for BarChart
  const formattedMethodData = React.useMemo(() => {
    if (!analytics?.paymentMethodBreakdown) return [];
    return analytics.paymentMethodBreakdown.map((item) => ({
      name: item._id ? item._id.toUpperCase() : 'UNKNOWN',
      amount: item.total / 100,
      count: item.count,
    }));
  }, [analytics]);

  return (
    <div className="admin-dashboard animate-fade-in space-y-7 pb-10">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-eyebrow">Library operations</span>
          <h2 className="page-title font-[family-name:var(--font-ui)] text-2xl font-black tracking-[-0.05em] text-[#0b1d2e] md:text-3xl">
            Dashboard overview
          </h2>
          <p className="mt-1 text-sm text-[#65788c]">
            A live snapshot of student activity, memberships, and library revenue.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2 self-start rounded-xl border-[#d7e3ec] bg-white px-3.5 py-2 text-xs text-[#294055] shadow-sm hover:border-[#25b8d0] sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#087d99]' : 'text-[#65788c]'} />
          <span>Refresh data</span>
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="dashboard-actions flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 font-[family-name:var(--font-ui)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#294055]">
          <span className="h-2 w-2 rounded-full bg-[#13b8c8] shadow-[0_0_10px_rgba(19,184,200,0.5)]"></span>
          Quick actions
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/students/add"
            className="dashboard-action inline-flex items-center gap-1.5 rounded-xl border border-[#dce8f0] bg-[#f8fbfd] px-3 py-2 text-xs font-semibold text-[#294055] transition-colors hover:border-[#25b8d0] hover:bg-[#e9faff] hover:text-[#087d99]"
          >
            <UserPlus size={14} className="text-[#087d99]" />
            Add Student
          </Link>
          <Link
            to="/admin/payments/record"
            className="dashboard-action inline-flex items-center gap-1.5 rounded-xl border border-[#dce8f0] bg-[#f8fbfd] px-3 py-2 text-xs font-semibold text-[#294055] transition-colors hover:border-[#25b8d0] hover:bg-[#e9faff] hover:text-[#087d99]"
          >
            <PlusCircle size={14} className="text-[#087d99]" />
            Record Payment
          </Link>
          <Link
            to="/admin/approvals"
            className="dashboard-action inline-flex items-center gap-1.5 rounded-xl border border-[#dce8f0] bg-[#f8fbfd] px-3 py-2 text-xs font-semibold text-[#294055] transition-colors hover:border-[#25b8d0] hover:bg-[#e9faff] hover:text-[#087d99]"
          >
            <Clock size={14} className="text-[#5dc4ff]" />
            Review Approvals
          </Link>
          <Link
            to="/admin/plans"
            className="dashboard-action inline-flex items-center gap-1.5 rounded-xl border border-[#dce8f0] bg-[#f8fbfd] px-3 py-2 text-xs font-semibold text-[#294055] transition-colors hover:border-[#25b8d0] hover:bg-[#e9faff] hover:text-[#087d99]"
          >
            <Layers size={14} className="text-[#73849d]" />
            Membership Plans
          </Link>
        </div>
      </div>

      {/* 8 StatCards Grid (2 col mobile, 4 col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Students */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Total Students
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mt-1.5 tracking-tight">
                  {summary?.totalStudents ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Registered in library</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0b1d2e]/5 text-[#0b1d2e] flex items-center justify-center border border-[#0b1d2e]/10">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* 2. Active Members */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Active Members
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#1A5C3B] mt-1.5 tracking-tight">
                  {summary?.activeStudents ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Currently seated / enrolled</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1A5C3B]/10 text-[#1A5C3B] flex items-center justify-center border border-[#1A5C3B]/20">
              <UserCheck size={20} />
            </div>
          </div>
        </div>

        {/* 3. Pending Approvals */}
        <Link
          to="/admin/students?registrationStatus=pending"
          className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden hover:border-[#13b8c8] hover:shadow-md transition-all group block"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#5dc4ff] flex items-center gap-1">
                Pending Approvals
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#5dc4ff] mt-1.5 tracking-tight">
                  {summary?.pendingApprovals ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Awaiting verification</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#5dc4ff]/10 text-[#5dc4ff] flex items-center justify-center border border-[#5dc4ff]/20">
              <Clock size={20} />
            </div>
          </div>
        </Link>

        {/* 4. Expiring Soon */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Expiring Soon
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#5dc4ff] mt-1.5 tracking-tight">
                  {summary?.expiringSoon ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Within warning window</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        {/* 5. Active Memberships */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Active Subscriptions
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mt-1.5 tracking-tight">
                  {summary?.activeMemberships ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Valid memberships</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#13b8c8]/15 text-[#13b8c8] flex items-center justify-center border border-[#13b8c8]/30">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* 6. Monthly Collection */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Monthly Collection
              </span>
              {loading ? (
                <div className="h-8 w-24 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#1A5C3B] mt-1.5 tracking-tight">
                  ₹{(summary?.monthlyCollected ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Current calendar month</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1A5C3B]/10 text-[#1A5C3B] flex items-center justify-center border border-[#1A5C3B]/20">
              <IndianRupee size={20} />
            </div>
          </div>
        </div>

        {/* 7. Yearly Collection */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Yearly Collection
              </span>
              {loading ? (
                <div className="h-8 w-24 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e] mt-1.5 tracking-tight">
                  ₹{(summary?.yearlyCollected ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Fiscal year accumulated</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#13b8c8]/10 text-[#13b8c8] flex items-center justify-center border border-[#13b8c8]/20">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* 8. Expired Memberships */}
        <div className="stat-card bg-white rounded-lg p-5 border border-[#dce8f0] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-eyebrow uppercase tracking-wider font-semibold text-[#65788c] block">
                Expired Memberships
              </span>
              {loading ? (
                <div className="h-8 w-16 bg-[#edf4f8] animate-pulse rounded mt-2"></div>
              ) : (
                <div className="text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#8B1A1A] mt-1.5 tracking-tight">
                  {summary?.expiredMemberships ?? 0}
                </div>
              )}
              <span className="text-[11px] text-[#65788c] mt-1 block">Require renewal notice</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A] flex items-center justify-center border border-[#8B1A1A]/20">
              <XCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Fee Collection */}
        <div className="card bg-white p-6 rounded-lg border border-[#dce8f0] shadow-sm">
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Monthly Fee Collection</h3>
            <p className="text-xs text-[#65788c]">Last 6 months revenue distribution in INR (₹)</p>
          </div>
          {loading ? (
            <div className="h-64 bg-[#edf4f8] animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedFeeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#65788c' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#65788c' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${(val ?? 0).toLocaleString('en-IN')}`, 'Fees Collected']}
                    contentStyle={{ backgroundColor: '#071521', color: '#f4f9fc', borderRadius: '12px', border: '1px solid rgba(126,249,255,0.3)' }}
                  />
                  <Bar dataKey="amount" fill="#13b8c8" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: New Student Registrations */}
        <div className="card bg-white p-6 rounded-lg border border-[#dce8f0] shadow-sm">
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">New Student Registrations</h3>
            <p className="text-xs text-[#65788c]">Trend of enrollments across the last 6 months</p>
          </div>
          {loading ? (
            <div className="h-64 bg-[#edf4f8] animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedRegData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#65788c' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#65788c' }} />
                  <Tooltip
                    formatter={(val: any) => [val ?? 0, 'New Students']}
                    contentStyle={{ backgroundColor: '#071521', color: '#f4f9fc', borderRadius: '12px', border: '1px solid rgba(126,249,255,0.3)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    stroke="#13b8c8"
                    strokeWidth={2.5}
                    dot={{ fill: '#13b8c8', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Membership Status Breakdown */}
        <div className="card bg-white p-6 rounded-lg border border-[#dce8f0] shadow-sm">
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Membership Status Breakdown</h3>
            <p className="text-xs text-[#65788c]">Proportion of active, expiring, and expired accounts</p>
          </div>
          {loading ? (
            <div className="h-64 bg-[#edf4f8] animate-pulse rounded-lg"></div>
          ) : formattedStatusData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#65788c] text-sm">
              No membership data recorded yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[entry.statusKey] || BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#071521', color: '#f4f9fc', borderRadius: '12px', border: '1px solid rgba(126,249,255,0.3)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4: Payment Method Breakdown */}
        <div className="card bg-white p-6 rounded-lg border border-[#dce8f0] shadow-sm">
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Payment Method Breakdown</h3>
            <p className="text-xs text-[#65788c]">Transaction breakdown across UPI, Cash, and Online channels</p>
          </div>
          {loading ? (
            <div className="h-64 bg-[#edf4f8] animate-pulse rounded-lg"></div>
          ) : formattedMethodData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#65788c] text-sm">
              No payment transactions yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedMethodData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6eef3" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#65788c' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#294055' }} />
                  <Tooltip
                    formatter={(val: any) => [`₹${(val ?? 0).toLocaleString('en-IN')}`, 'Total Volume']}
                    contentStyle={{ backgroundColor: '#071521', color: '#f4f9fc', borderRadius: '12px', border: '1px solid rgba(126,249,255,0.3)' }}
                  />
                  <Bar dataKey="amount" fill="#5dc4ff" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
