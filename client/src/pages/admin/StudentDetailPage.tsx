import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Award,
  CreditCard,
  Edit2,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Download,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { studentsApi, membershipsApi, paymentsApi, plansApi } from '../../lib/api';
import {
  formatINR,
  formatDate,
  getStatusBadgeClass,
  getStatusLabel,
  getPaymentMethodLabel,
  downloadBlob,
} from '../../lib/utils';
import toast from 'react-hot-toast';
import { WEEK_DAYS } from '../../types/public';

interface StudentData {
  _id: string;
  studentCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  seatNumber?: string;
  seatDays?: string[];
  seatStartTime?: string;
  seatEndTime?: string;
  notes?: string;
  status: string;
  registrationStatus: string;
}

interface MembershipData {
  _id: string;
  planId?: { _id: string; name: string };
  planNameSnapshot: string;
  baseFeeSnapshot: number;
  registrationFeeSnapshot: number;
  durationValueSnapshot: number;
  durationUnitSnapshot: string;
  discountAmount: number;
  additionalCharges: number;
  discountReason?: string;
  startDate: string;
  endDate: string;
  status: string;
  isRenewal: boolean;
  notes?: string;
}

interface PaymentData {
  _id: string;
  receiptNumber: string;
  membershipId: string;
  amountReceived: number; // in paise
  paymentMethod: string;
  paymentDate: string;
  feeCategory: string;
  periodLabel?: string;
  transactionReference?: string;
  notes?: string;
}

interface PlanOption {
  _id: string;
  name: string;
  durationValue: number;
  durationUnit: string;
  baseFee: number; // paise
  registrationFee: number;
  isActive: boolean;
}

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'membership' | 'payments'>('profile');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [outstanding, setOutstanding] = useState<number>(0); // in paise

  // Edit Student Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    seatNumber: '',
    seatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    seatStartTime: '06:00',
    seatEndTime: '14:00',
    status: 'active',
    notes: '',
  });

  // Add / Renew Membership Modal state
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [membershipModalMode, setMembershipModalMode] = useState<'create' | 'renew'>('create');
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [membershipStartDate, setMembershipStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [membershipNotes, setMembershipNotes] = useState<string>('');
  const [submittingMembership, setSubmittingMembership] = useState(false);

  // Fetch Student details
  const fetchStudentData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentsApi.get(id);
      if (res.data.success) {
        const { student, memberships, payments, outstanding } = res.data.data;
        setStudent(student);
        setMemberships(memberships || []);
        setPayments(payments || []);
        setOutstanding(outstanding || 0);

        setEditForm({
          name: student.name || '',
          phone: student.phone || '',
          email: student.email || '',
          address: student.address || '',
          emergencyContact: student.emergencyContact || '',
          seatNumber: student.seatNumber || '',
          seatDays: student.seatDays?.length
            ? student.seatDays
            : student.seatNumber
              ? []
              : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          seatStartTime: student.seatStartTime || (student.seatNumber ? '' : '06:00'),
          seatEndTime: student.seatEndTime || (student.seatNumber ? '' : '14:00'),
          status: student.status || 'active',
          notes: student.notes || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not find student details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudentData();
    // Fetch available plans for dropdowns
    plansApi.list().then((res) => {
      if (res.data.success) {
        setPlans(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedPlanId(res.data.data[0]._id);
        }
      }
    }).catch(() => {});
  }, [fetchStudentData]);

  // Handle Edit Student submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await studentsApi.update(id, editForm);
      toast.success('Student updated successfully');
      setEditModalOpen(false);
      fetchStudentData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update student');
    }
  };

  // Open Membership Modal
  const openMembershipModal = (mode: 'create' | 'renew', membershipId?: string) => {
    setMembershipModalMode(mode);
    setSelectedMembershipId(membershipId || null);
    setDiscountAmount(0);
    setDiscountReason('');
    setMembershipNotes('');
    setMembershipStartDate(new Date().toISOString().split('T')[0]);
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0]._id);
    }
    if (mode === 'renew' && membershipId) {
      const target = memberships.find((m) => m._id === membershipId);
      if (target) {
        if (target.planId?._id) setSelectedPlanId(target.planId._id);
        const end = new Date(target.endDate);
        const today = new Date();
        const start = end > today ? end : today;
        setMembershipStartDate(start.toISOString().split('T')[0]);
      }
    }
    setMembershipModalOpen(true);
  };

  // Submit Membership (Create or Renew)
  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!selectedPlanId) {
      toast.error('Please select a membership plan');
      return;
    }
    setSubmittingMembership(true);
    try {
      if (membershipModalMode === 'create') {
        await membershipsApi.create({
          studentId: id,
          planId: selectedPlanId,
          startDate: membershipStartDate,
          discountAmount: Number(discountAmount),
          discountReason,
          notes: membershipNotes,
        });
        toast.success('New membership added successfully');
      } else if (selectedMembershipId) {
        await membershipsApi.renew(selectedMembershipId, {
          planId: selectedPlanId,
          startDate: membershipStartDate,
          discountAmount: Number(discountAmount),
          discountReason,
          notes: membershipNotes,
        });
        toast.success('Membership renewed successfully');
      }
      setMembershipModalOpen(false);
      fetchStudentData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save membership');
    } finally {
      setSubmittingMembership(false);
    }
  };

  // Download Receipt
  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    try {
      const res = await paymentsApi.receipt(paymentId);
      downloadBlob(res.data, `Receipt-${receiptNumber}.pdf`);
      toast.success(`Receipt ${receiptNumber} downloaded`);
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <div className="skeleton h-8 w-48 rounded"></div>
        <div className="skeleton h-40 w-full rounded-xl"></div>
        <div className="skeleton h-64 w-full rounded-xl"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-[#0b1d2e]">Student not found</h3>
        <button
          type="button"
          onClick={() => navigate('/admin/students')}
          className="btn btn-secondary mt-4 text-xs"
        >
          <ArrowLeft size={14} /> Back to directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/students')}
            className="p-2 text-slate-500 hover:text-[#0b1d2e] hover:bg-[#e7faff]/50 rounded-lg transition-colors"
            title="Back to Students"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">{student.name}</h2>
              <span className={`badge ${getStatusBadgeClass(student.status)} text-[11px]`}>
                {getStatusLabel(student.status)}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {student.studentCode} | Joined: {formatDate(student.joiningDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="btn btn-secondary text-xs py-2 px-3.5 border border-[#dce8f0] hover:border-[#13b8c8]"
          >
            <Edit2 size={14} /> Edit Profile
          </button>

          <Link
            to={`/admin/payments/record?studentId=${student._id}`}
            className="btn btn-primary text-xs py-2 px-3.5 shadow-sm"
          >
            <PlusCircle size={14} /> Record Payment
          </Link>
        </div>
      </div>

      {/* Prominent Outstanding Balance Card (if > 0) */}
      {outstanding > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800">
                Outstanding Balance Due
              </div>
              <div className="text-2xl font-[family-name:var(--font-ui)] font-bold text-amber-900">
                {formatINR(outstanding)}
              </div>
            </div>
          </div>
          <Link
            to={`/admin/payments/record?studentId=${student._id}`}
            className="btn bg-[#13b8c8] text-[#0b1d2e] hover:bg-[#087d99] text-xs font-semibold py-2 px-4 shadow"
          >
            Clear Balance
          </Link>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-[#dce8f0] flex gap-8 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-[#13b8c8] text-[#0b1d2e]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <User size={16} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('membership')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'membership'
              ? 'border-[#13b8c8] text-[#0b1d2e]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Award size={16} />
          Memberships ({memberships.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-[#13b8c8] text-[#0b1d2e]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard size={16} />
          Payment History ({payments.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="card bg-white p-6 rounded-xl border border-[#dce8f0] shadow-sm md:col-span-2 space-y-6">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e] border-b border-[#e7faff] pb-3">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Full Name</span>
                <span className="text-base font-semibold text-[#0b1d2e] mt-0.5 block">{student.name}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Phone Number</span>
                <span className="text-base font-mono text-[#0b1d2e] mt-0.5 block flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" /> {student.phone}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Email Address</span>
                <span className="text-sm text-slate-700 mt-0.5 block flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" /> {student.email || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Emergency Contact</span>
                <span className="text-sm font-mono text-slate-700 mt-0.5 block">
                  {student.emergencyContact || '—'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Address</span>
                <span className="text-sm text-slate-700 mt-0.5 block flex items-start gap-1.5">
                  <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  {student.address || '—'}
                </span>
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e] border-b border-[#e7faff] pb-3 pt-2">
              Library Details & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Assigned Seat</span>
                <span className="text-base font-semibold text-[#0b1d2e] mt-0.5 block">
                  {student.seatNumber ? `Seat #${student.seatNumber}` : 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Joining Date</span>
                <span className="text-sm text-slate-700 mt-0.5 block">
                  {formatDate(student.joiningDate, 'long')}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">Staff Notes</span>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap bg-[#FDFBF7] p-3 rounded-lg border border-[#dce8f0]">
                  {student.notes || 'No administrative notes recorded.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="space-y-6">
            <div className="card bg-white p-6 rounded-xl border border-[#dce8f0] shadow-sm space-y-4">
              <h3 className="font-[family-name:var(--font-ui)] font-bold text-base text-[#0b1d2e]">Account Overview</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-[#e7faff]">
                  <span className="text-slate-500">Registration Status:</span>
                  <span className={`badge ${getStatusBadgeClass(student.registrationStatus)}`}>
                    {student.registrationStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e7faff]">
                  <span className="text-slate-500">Active Membership:</span>
                  <span className="font-semibold text-[#0b1d2e]">
                    {memberships.find((m) => ['active', 'expiring_soon'].includes(m.status))
                      ?.planNameSnapshot || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e7faff]">
                  <span className="text-slate-500">Total Payments Made:</span>
                  <span className="font-semibold text-[#2D6A4F]">
                    {formatINR(
                      payments.reduce((acc, curr) => acc + curr.amountReceived, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Pending Dues:</span>
                  <span className={`font-bold ${outstanding > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {formatINR(outstanding)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Membership Tab */}
      {activeTab === 'membership' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Membership Timeline</h3>
            <button
              type="button"
              onClick={() => openMembershipModal('create')}
              className="btn btn-primary text-xs py-2 px-3.5 shadow-sm"
            >
              <PlusCircle size={15} /> Add Membership
            </button>
          </div>

          {memberships.length === 0 ? (
            <div className="card bg-white p-12 text-center rounded-xl border border-[#dce8f0] text-slate-400">
              <Award size={40} className="mx-auto mb-3 text-[#13b8c8]/60" />
              <p className="text-base font-semibold text-[#0b1d2e]">No Memberships Assigned</p>
              <p className="text-xs text-slate-500 mt-1">Enroll this student in a membership plan.</p>
              <button
                type="button"
                onClick={() => openMembershipModal('create')}
                className="btn btn-primary text-xs mt-4 py-2 px-4"
              >
                Enroll Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {memberships.map((m) => {
                const isActive = ['active', 'expiring_soon'].includes(m.status);
                return (
                  <div
                    key={m._id}
                    className={`card bg-white p-5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-emerald-300 ring-2 ring-emerald-50 shadow-md'
                        : 'border-[#dce8f0] opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">
                            {m.planNameSnapshot}
                          </h4>
                          <span className={`badge ${getStatusBadgeClass(m.status)} text-[11px]`}>
                            {getStatusLabel(m.status)}
                          </span>
                          {isActive && (
                            <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Current Active
                            </span>
                          )}
                          {m.isRenewal && (
                            <span className="badge bg-blue-50 text-blue-700 text-[10px]">
                              Renewal
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                          <div>
                            <span className="text-slate-400">Start:</span> {formatDate(m.startDate)}
                          </div>
                          <div>
                            <span className="text-slate-400">End:</span> {formatDate(m.endDate)}
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span> {m.durationValueSnapshot}{' '}
                            {m.durationUnitSnapshot}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs mt-2">
                          <span className="font-semibold text-slate-700">
                            Base Fee: {formatINR(m.baseFeeSnapshot)}
                          </span>
                          {m.discountAmount > 0 && (
                            <span className="text-emerald-700">
                              Discount: -{formatINR(m.discountAmount)}{' '}
                              {m.discountReason ? `(${m.discountReason})` : ''}
                            </span>
                          )}
                          {m.additionalCharges > 0 && (
                            <span className="text-amber-700">
                              Charges: +{formatINR(m.additionalCharges)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openMembershipModal('renew', m._id)}
                          className="btn btn-secondary text-xs py-1.5 px-3 border border-[#dce8f0] hover:border-[#13b8c8]"
                        >
                          <RefreshCw size={13} /> Renew Plan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Payment Receipts</h3>
            <Link
              to={`/admin/payments/record?studentId=${student._id}`}
              className="btn btn-primary text-xs py-2 px-3.5 shadow-sm"
            >
              <PlusCircle size={15} /> Record Payment
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="card bg-white p-12 text-center rounded-xl border border-[#dce8f0] text-slate-400">
              <CreditCard size={40} className="mx-auto mb-3 text-[#13b8c8]/60" />
              <p className="text-base font-semibold text-[#0b1d2e]">No Payments Recorded</p>
              <p className="text-xs text-slate-500 mt-1">Record the first fee payment for this student.</p>
              <Link
                to={`/admin/payments/record?studentId=${student._id}`}
                className="btn btn-primary text-xs mt-4 py-2 px-4"
              >
                Record Payment
              </Link>
            </div>
          ) : (
            <div className="card bg-white rounded-xl border border-[#dce8f0] shadow-sm overflow-hidden">
              <div className="table-container">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b1d2e] text-[#f4f9fc] text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7faff] text-xs">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-[#f8fbfd]">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#0b1d2e]">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#2D6A4F] text-sm">
                          {formatINR(p.amountReceived)}
                        </td>
                        <td className="py-3.5 px-4 capitalize">
                          {getPaymentMethodLabel(p.paymentMethod)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {p.feeCategory}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {p.periodLabel || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(p._id, p.receiptNumber)}
                            className="btn btn-secondary py-1 px-2.5 text-xs border border-[#dce8f0] hover:border-[#13b8c8]"
                            title="Download PDF Receipt"
                          >
                            <Download size={13} /> PDF
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
      )}

      {/* Edit Student Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dce8f0] space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Edit Student Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label text-xs">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="form-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Assigned Seat</label>
                  <select
                    value={editForm.seatNumber}
                    onChange={(e) => setEditForm({ ...editForm, seatNumber: e.target.value })}
                    className="form-input text-xs"
                  >
                    <option value="">Unassigned</option>
                    {Array.from({ length: 58 }, (_, index) => String(index + 1)).map((seatNumber) => (
                      <option key={seatNumber} value={seatNumber}>
                        Seat {seatNumber} ({Number(seatNumber) <= 30 ? 'East Wing' : 'West Wing'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="form-select text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <fieldset className="space-y-3 rounded-xl border border-[#dce8f0] bg-[#f8fbfd] p-3">
                <legend className="px-1 text-xs font-bold text-[#0b1d2e]">Recurring seat schedule</legend>
                {editForm.seatNumber && editForm.seatDays.length === 0 && (
                  <p className="text-[11px] font-medium text-amber-700">
                    This existing seat has no recorded hours and is treated as occupied all week. Enter its real schedule before saving so no availability is assumed incorrectly.
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {WEEK_DAYS.map((day) => (
                    <label key={day} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#294055]">
                      <input
                        type="checkbox"
                        checked={editForm.seatDays.includes(day)}
                        onChange={(event) => setEditForm({
                          ...editForm,
                          seatDays: event.target.checked
                            ? [...editForm.seatDays, day]
                            : editForm.seatDays.filter((selectedDay) => selectedDay !== day),
                        })}
                        className="rounded border-[#dce8f0] text-[#13b8c8] focus:ring-[#13b8c8]"
                      />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-[11px] font-semibold text-[#294055]">
                    Start
                    <input
                      type="time"
                      value={editForm.seatStartTime}
                      onChange={(event) => setEditForm({ ...editForm, seatStartTime: event.target.value })}
                      className="form-input text-xs"
                    />
                  </label>
                  <label className="grid gap-1 text-[11px] font-semibold text-[#294055]">
                    End
                    <input
                      type="time"
                      value={editForm.seatEndTime}
                      onChange={(event) => setEditForm({ ...editForm, seatEndTime: event.target.value })}
                      className="form-input text-xs"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-[#64748B]">
                  The server checks opening hours and prevents overlapping assignments on the same seat.
                </p>
              </fieldset>

              <div>
                <label className="form-label text-xs">Address</label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="form-textarea text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Emergency Contact</label>
                <input
                  type="text"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="form-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="form-label text-xs">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="form-textarea text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Renew Membership Modal */}
      {membershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dce8f0] space-y-4 animate-fade-in">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">
              {membershipModalMode === 'create' ? 'Add New Membership' : 'Renew Membership'}
            </h3>
            <form onSubmit={handleMembershipSubmit} className="space-y-4 text-sm">
              <div>
                <label className="form-label text-xs">Select Plan</label>
                {plans.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No membership plans found.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/admin/memberships')}
                      className="font-bold underline text-[#087d99]"
                    >
                      Configure plans here
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="form-select text-xs"
                  >
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {formatINR(p.baseFee)} ({p.durationValue} {p.durationUnit})
                        {!p.isActive ? ' (Draft)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="form-label text-xs">Start Date</label>
                <input
                  type="date"
                  required
                  value={membershipStartDate}
                  onChange={(e) => setMembershipStartDate(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Discount Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Student Concession"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Notes</label>
                <textarea
                  rows={2}
                  value={membershipNotes}
                  onChange={(e) => setMembershipNotes(e.target.value)}
                  className="form-textarea text-xs"
                  placeholder="Optional membership notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMembershipModalOpen(false)}
                  className="btn btn-secondary text-xs py-2 px-4"
                  disabled={submittingMembership}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs py-2 px-4"
                  disabled={submittingMembership}
                >
                  {submittingMembership
                    ? 'Saving...'
                    : membershipModalMode === 'create'
                    ? 'Create Membership'
                    : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailPage;
