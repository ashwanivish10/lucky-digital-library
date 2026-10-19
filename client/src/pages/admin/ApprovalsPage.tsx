import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Check, X, Phone, Mail, Clock } from 'lucide-react';
import { studentsApi, plansApi, membershipsApi } from '../../lib/api';
import { formatDate, formatINR } from '../../lib/utils';
import ColumnPicker, { useColumnVisibility } from '../../components/admin/ColumnPicker';
import { IMembershipPlan } from '../../types/public';
import toast from 'react-hot-toast';

const APPROVAL_COLUMNS = [
  { id: 'code', label: 'Provisional ID' },
  { id: 'applicant', label: 'Applicant' },
  { id: 'contact', label: 'Contact' },
  { id: 'applied', label: 'Applied Date' },
  { id: 'note', label: 'Aspirant Note' },
  { id: 'actions', label: 'Actions' },
];

export const ApprovalsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useColumnVisibility('ldl.columns.approvals', APPROVAL_COLUMNS);

  // Approval modal state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState('');
  const [availableSeatNumbers, setAvailableSeatNumbers] = useState<number[]>([]);
  const [seatAvailabilityLoading, setSeatAvailabilityLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsApi.list({ registrationStatus: 'pending' });
      setStudents(res.data?.data || []);
    } catch {
      toast.error('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
    plansApi.list()
      .then((res) => {
        const allPlans = res.data?.data || [];
        const activePlans = allPlans.filter((p: any) => p.isActive);
        const finalPlans = activePlans.length > 0 ? activePlans : allPlans;
        setPlans(finalPlans);
        if (finalPlans.length > 0) setSelectedPlanId(finalPlans[0]._id);
      })
      .catch(console.error);
  }, []);

  const openApproveModal = async (student: any) => {
    setSelectedStudent(student);
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setSelectedSeatNumber('');
    setModalOpen(true);
    setSeatAvailabilityLoading(true);
    try {
      const schedule = {
        days: student.seatDays?.length
          ? student.seatDays.join(',')
          : 'Monday,Tuesday,Wednesday,Thursday,Friday',
        startTime: student.seatStartTime || '06:00',
        endTime: student.seatEndTime || '14:00',
      };
      const res = await studentsApi.getSeatMap(schedule);
      const available = (res.data?.data?.seats || [])
        .filter((seat: { isOccupied: boolean }) => !seat.isOccupied)
        .map((seat: { seatNumber: number }) => seat.seatNumber);
      setAvailableSeatNumbers(available);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Unable to check seat availability.');
      setAvailableSeatNumbers([]);
    } finally {
      setSeatAvailabilityLoading(false);
    }
    setModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedStudent) return;
    setIsProcessing(true);
    try {
      // 1. Approve student
      await studentsApi.approve(selectedStudent._id, {
        action: 'approve',
        joiningDate,
        planId: selectedPlanId,
        ...(selectedSeatNumber ? {
          seatNumber: String(selectedSeatNumber),
          seatDays: selectedStudent.seatDays?.length
            ? selectedStudent.seatDays
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          seatStartTime: selectedStudent.seatStartTime || '06:00',
          seatEndTime: selectedStudent.seatEndTime || '14:00',
        } : {}),
      });

      // 2. If a plan was selected, create initial membership
      if (selectedPlanId) {
        await membershipsApi.create({
          studentId: selectedStudent._id,
          planId: selectedPlanId,
          startDate: joiningDate,
        });
      }

      toast.success(`${selectedStudent.name} approved successfully!`);
      setModalOpen(false);
      setSelectedStudent(null);
      fetchPendingStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Approval failed';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (student: any) => {
    if (!window.confirm(`Are you sure you want to reject registration for ${student.name}?`)) {
      return;
    }

    try {
      await studentsApi.approve(student._id, { action: 'reject' });
      toast.success(`Registration for ${student.name} rejected.`);
      fetchPendingStudents();
    } catch {
      toast.error('Failed to reject registration.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-2xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e]">
            Pending Student Registrations
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Review public online registration submissions and formally enroll verified students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ColumnPicker columns={columns.columns} visible={columns.visible} onToggle={columns.toggle} />
          <span className="badge badge-pending">
            {students.length} Pending Application{students.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#64748B]">Loading pending registrations...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] mb-1">Queue is Clear</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              There are no pending student applications awaiting review right now.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (md:hidden) */}
            <div className="md:hidden p-3 space-y-3">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="rounded-2xl border border-[#e8dcc8] bg-[#f8fbfd]/60 p-4 shadow-xs space-y-3"
                >
                  {/* Top row: Applicant Name + Provisional Student ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-[#2c1f0e]">{student.name}</div>
                    <span className="font-mono font-bold text-xs text-[#2c1f0e] bg-[#faf6f0] border border-[#e8dcc8] px-2 py-0.5 rounded">
                      {student.studentCode}
                    </span>
                  </div>

                  {/* Address (if present) */}
                  {student.address && (
                    <div className="text-xs text-[#64748B]">{student.address}</div>
                  )}

                  {/* Contact row: Phone + Email */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] pt-2 border-t border-[#f5ead4]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-[#c2a66e]" />
                      <a href={`tel:${student.phone}`} className="hover:underline font-mono">{student.phone}</a>
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-1.5 text-[#64748B]">
                        <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{student.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Applied Date & Notes */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f5ead4]">
                    <div className="text-[#64748B]">
                      Applied: <span className="text-[#2c1f0e] font-medium">{formatDate(student.createdAt || student.joiningDate)}</span>
                    </div>
                    {student.notes && (
                      <div className="text-right text-[11px] text-[#334155] italic max-w-[55%] truncate">
                        &quot;{student.notes}&quot;
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Approve & Reject (min 44px touch targets) */}
                  <div className="pt-2 border-t border-[#f5ead4] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openApproveModal(student)}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2c1f0e] hover:bg-[#c2a66e] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4 text-[#e8d5a8]" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(student)}
                      className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#DC2626] text-xs font-semibold border border-rose-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2c1f0e] text-white text-[11px] font-semibold uppercase tracking-wider">
                  {APPROVAL_COLUMNS.filter((column) => columns.visible(column.id)).map((column) => (
                    <th
                      key={column.id}
                      className={`py-3.5 px-4 ${column.id === 'actions' ? 'text-right' : ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ead4] text-sm">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-[#faf6f0]/50 transition-colors">
                    {columns.visible('code') && (
                    <td className="py-4 px-4 font-mono font-bold text-[#2c1f0e]">
                      {student.studentCode}
                    </td>
                    )}
                    {columns.visible('applicant') && (
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#2c1f0e]">{student.name}</div>
                      {student.address && (
                        <div className="text-[11px] text-[#64748B] truncate max-w-xs">{student.address}</div>
                      )}
                    </td>
                    )}
                    {columns.visible('contact') && (
                    <td className="py-4 px-4 text-xs text-[#475569]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-[#c2a66e]" />
                        <a href={`tel:${student.phone}`} className="hover:underline">{student.phone}</a>
                      </div>
                      {student.email && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[#64748B]">
                          <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{student.email}</span>
                        </div>
                      )}
                    </td>
                    )}
                    {columns.visible('applied') && (
                    <td className="py-4 px-4 text-xs text-[#64748B]">
                      {formatDate(student.createdAt || student.joiningDate)}
                    </td>
                    )}
                    {columns.visible('note') && (
                    <td className="py-4 px-4 text-xs text-[#334155] max-w-xs">
                      <span className="italic">{student.notes || '—'}</span>
                    </td>
                    )}
                    {columns.visible('actions') && (
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openApproveModal(student)}
                          className="btn btn-primary btn-sm text-xs py-1.5 px-3"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(student)}
                          className="btn btn-secondary btn-sm text-xs py-1.5 px-3 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

      {/* Approval Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-[#e8dcc8] shadow-2xl relative"
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#f5ead4]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#c2a66e]">Registration Review</span>
                <h3 className="text-xl font-[family-name:var(--font-ui)] font-bold text-[#2c1f0e] mt-0.5">
                  Enroll {selectedStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#64748B] hover:text-[#2c1f0e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#faf6f0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Applicant:</span>
                  <strong className="text-[#2c1f0e]">{selectedStudent.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Phone:</span>
                  <strong className="text-[#2c1f0e]">{selectedStudent.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Student Code:</span>
                  <strong className="font-mono text-[#2c1f0e]">{selectedStudent.studentCode}</strong>
                </div>
              </div>

              <div className="rounded-xl border border-[#e8dcc8] bg-[#f8fbfd] p-3.5">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#2c1f0e]">
                  <Clock className="h-3.5 w-3.5 text-[#c2a66e]" />
                  Requested study schedule
                </div>
                <p className="text-xs text-[#475569]">
                  {(selectedStudent.seatDays?.length
                    ? selectedStudent.seatDays
                    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                  ).map((day: string) => day.slice(0, 3)).join(', ')}
                  {' · '}{selectedStudent.seatStartTime || '06:00'}–{selectedStudent.seatEndTime || '14:00'}
                </p>
                <label className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-[#2c1f0e]">
                  Assign a seat (optional)
                  <select
                    value={selectedSeatNumber}
                    onChange={(event) => setSelectedSeatNumber(event.target.value)}
                    disabled={seatAvailabilityLoading}
                    className="mt-1.5 w-full rounded-xl border border-[#e8dcc8] bg-white px-3.5 py-2.5 text-base md:text-sm font-normal focus:border-[#c2a66e] focus:outline-none"
                  >
                    <option value="">
                      {seatAvailabilityLoading
                        ? 'Checking availability…'
                        : availableSeatNumbers.length > 0
                          ? 'Approve without assigning a seat'
                          : 'No seats available for this schedule'}
                    </option>
                    {availableSeatNumbers.map((seatNumber) => (
                      <option key={seatNumber} value={seatNumber}>Seat {seatNumber}</option>
                    ))}
                  </select>
                </label>
                <p className="mt-1.5 text-[11px] text-[#64748B]">
                  Seat availability is checked for the requested days and hours. The server rechecks conflicts during enrollment.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Actual Library Joining Date *
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dcc8] text-base md:text-sm focus:outline-none focus:border-[#c2a66e]"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Stored distinctly from application date for strict audit tracking.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2c1f0e] mb-1.5">
                  Initial Membership Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dcc8] text-base md:text-sm focus:outline-none focus:border-[#c2a66e]"
                >
                  <option value="">-- Assign Later --</option>
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {formatINR(p.baseFee)} ({p.durationValue} {p.durationUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#c2a66e]/30 text-[11px] text-[#92400E] leading-relaxed">
                Approving this application activates the student's credentials. They will now be able to log in to the student portal.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f5ead4]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary btn-sm min-h-[44px] md:min-h-0 flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  disabled={isProcessing}
                  className="btn btn-primary btn-sm min-h-[44px] md:min-h-0 flex items-center justify-center"
                >
                  {isProcessing ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
