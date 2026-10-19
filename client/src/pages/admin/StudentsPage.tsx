import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Archive,
  Filter,
  AlertCircle,
  Users,
  X,
  Clock,
} from 'lucide-react';
import { studentsApi } from '../../lib/api';
import TablePagination from '../../components/admin/TablePagination';
import ColumnPicker, { useColumnVisibility } from '../../components/admin/ColumnPicker';
import FilterDialog from '../../components/admin/FilterDialog';
import { formatDate, formatINR, getStatusBadgeClass, getStatusLabel } from '../../lib/utils';
import toast from 'react-hot-toast';

interface StudentItem {
  _id: string;
  studentCode: string;
  name: string;
  phone: string;
  email?: string;
  joiningDate: string;
  status: string;
  registrationStatus: string;
  seatNumber?: string;
  seatDays?: string[];
  seatStartTime?: string;
  seatEndTime?: string;
  activeMembership?: {
    _id: string;
    planNameSnapshot: string;
    status: string;
    endDate: string;
  } | null;
  outstanding?: number;
}

function FeeDue({ student }: { student: StudentItem }) {
  const due = student.outstanding || 0;
  if (due > 0) {
    return (
      <Link
        to={`/admin/payments/record?studentId=${student._id}`}
        className="inline-flex whitespace-nowrap items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-[#b42336] ring-1 ring-inset ring-rose-200"
        title="Collect the remaining fee"
      >
        {formatINR(due)} due
      </Link>
    );
  }
  if (student.activeMembership) {
    return (
      <span className="inline-flex whitespace-nowrap items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#1B5E3C] ring-1 ring-inset ring-emerald-200">
        Paid
      </span>
    );
  }
  return <span className="text-xs text-[#65788c]">—</span>;
}

const STUDENT_COLUMNS = [
  { id: 'code', label: 'Student ID' },
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'joining', label: 'Joining Date' },
  { id: 'status', label: 'Status' },
  { id: 'membership', label: 'Membership' },
  { id: 'fee', label: 'Fee due' },
  { id: 'seat', label: 'Seat' },
  { id: 'shift', label: 'Shift' },
  { id: 'actions', label: 'Actions' },
];

export const StudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [regFilter, setRegFilter] = useState(searchParams.get('registrationStatus') || '');
  const [feeFilter, setFeeFilter] = useState(searchParams.get('feeStatus') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [draftFee, setDraftFee] = useState(feeFilter);
  const [draftReg, setDraftReg] = useState(regFilter);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(10);
  const columns = useColumnVisibility('ldl.columns.students', STUDENT_COLUMNS);
  const [totalStudents, setTotalStudents] = useState(0);

  // Archive modal state
  const [studentToArchive, setStudentToArchive] = useState<StudentItem | null>(null);
  const [archiving, setArchiving] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: pageSize,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (regFilter) params.registrationStatus = regFilter;
      if (feeFilter) params.feeStatus = feeFilter;

      const res = await studentsApi.list(params);
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalStudents(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter, regFilter, feeFilter]);

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, regFilter, feeFilter, page, fetchStudents]);

  // Sync state into URL params
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (searchTerm) newParams.search = searchTerm;
    if (statusFilter) newParams.status = statusFilter;
    if (regFilter) newParams.registrationStatus = regFilter;
    if (feeFilter) newParams.feeStatus = feeFilter;
    if (page > 1) newParams.page = String(page);
    setSearchParams(newParams, { replace: true });
  }, [searchTerm, statusFilter, regFilter, feeFilter, page, setSearchParams]);

  const handleArchiveConfirm = async () => {
    if (!studentToArchive) return;
    setArchiving(true);
    try {
      await studentsApi.updateStatus(studentToArchive._id, 'archived', 'Archived by admin from directory');
      toast.success(`${studentToArchive.name} has been archived`);
      setStudentToArchive(null);
      fetchStudents();
    } catch {
      toast.error('Could not archive student');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Top Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-eyebrow">Student Registry</span>
          <h2 className="page-title text-2xl md:text-3xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
            Student Directory
          </h2>
          <p className="text-sm text-[#65788c] mt-0.5">
            Manage registrations, credentials, active seats, and membership lifecycle ({totalStudents} enrolled).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students/add"
            className="btn btn-primary inline-flex items-center gap-2 text-sm shadow-sm"
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card bg-white p-4 rounded-lg border border-[#dce8f0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Debounced Search */}
        <div className="relative max-w-md flex-1 flex items-center bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-3 py-2 focus-within:border-[#13b8c8] transition-colors">
          <Search size={16} className="text-[#65788c] flex-shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search by name, student ID, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full text-base md:text-sm text-[#0b1d2e] bg-transparent placeholder-[#65788c] focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="text-[#65788c] hover:text-[#0b1d2e]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <FilterDialog
          open={filtersOpen}
          activeCount={[statusFilter, feeFilter, regFilter].filter(Boolean).length}
          onOpen={() => {
            setDraftStatus(statusFilter);
            setDraftFee(feeFilter);
            setDraftReg(regFilter);
            setFiltersOpen(true);
          }}
          onClose={() => setFiltersOpen(false)}
          onClear={() => {
            setDraftStatus('');
            setDraftFee('');
            setDraftReg('');
          }}
          onApply={() => {
            setStatusFilter(draftStatus);
            setFeeFilter(draftFee);
            setRegFilter(draftReg);
            setPage(1);
            setFiltersOpen(false);
          }}
        >
          <label className="block text-xs font-semibold text-[#294055]">
            Status
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce8f0] bg-[#f4f9fc] px-3 py-3 text-sm text-[#0b1d2e]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#294055]">
            Fees
            <select
              value={draftFee}
              onChange={(e) => setDraftFee(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce8f0] bg-[#f4f9fc] px-3 py-3 text-sm text-[#0b1d2e]"
            >
              <option value="">All fees</option>
              <option value="due">Fee due</option>
              <option value="clear">Paid in full</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#294055]">
            Registration
            <select
              value={draftReg}
              onChange={(e) => setDraftReg(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#dce8f0] bg-[#f4f9fc] px-3 py-3 text-sm text-[#0b1d2e]"
            >
              <option value="">All Registrations</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </FilterDialog>
        </div>

        {/* Filter Dropdowns */}
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <div className="flex items-center gap-2 bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5">
            <Filter size={14} className="text-[#65788c]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-[#0b1d2e] font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5">
            <select
              value={feeFilter}
              onChange={(e) => {
                setFeeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-[#0b1d2e] font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All fees</option>
              <option value="due">Fee due</option>
              <option value="clear">Paid in full</option>
            </select>
          </div>

          <div className="bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-2.5 py-1.5">
            <select
              value={regFilter}
              onChange={(e) => {
                setRegFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-[#0b1d2e] font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Registrations</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {(searchTerm || statusFilter || regFilter || feeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setRegFilter('');
                setFeeFilter('');
                setPage(1);
              }}
              className="text-xs text-[#8B1A1A] hover:underline px-2 py-1 font-semibold transition-colors"
            >
              Clear filters
            </button>
          )}
          <ColumnPicker columns={columns.columns} visible={columns.visible} onToggle={columns.toggle} />
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
                <div className="h-5 w-36 bg-[#edf4f8] rounded"></div>
                <div className="h-5 w-16 bg-[#edf4f8] rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-[#edf4f8] rounded"></div>
                <div className="h-4 w-28 bg-[#edf4f8] rounded"></div>
              </div>
              <div className="h-4 w-full bg-[#edf4f8] rounded"></div>
              <div className="h-4 w-3/4 bg-[#edf4f8] rounded"></div>
              <div className="h-10 w-full bg-[#edf4f8] rounded-xl pt-2"></div>
            </div>
          ))
        ) : students.length === 0 ? (
          // Mobile Empty state
          <div className="rounded-2xl border border-[#dce8f0] bg-white p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 flex items-center justify-center text-[#13b8c8] mx-auto mb-3">
              <Users size={28} />
            </div>
            <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
              No students found
            </p>
            <p className="text-xs text-[#65788c] mt-1 max-w-sm mx-auto">
              Try modifying your search or filter settings, or enroll a new student.
            </p>
            <Link
              to="/admin/students/add"
              className="btn btn-primary mt-4 text-xs py-2.5 px-4 min-h-[44px] inline-flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} /> <span>Add Student</span>
            </Link>
          </div>
        ) : (
          students.map((student) => {
            const isPending = student.registrationStatus === 'pending';
            const activeMem = student.activeMembership;

            return (
              <div
                key={student._id}
                className="rounded-2xl border border-[#dce8f0] bg-white p-4 shadow-sm space-y-3"
              >
                {/* Top row: Student name (bold, left) + Status badge (right) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      to={`/admin/students/${student._id}`}
                      className="font-semibold text-sm text-[#0b1d2e] hover:text-[#13b8c8] truncate transition-colors"
                    >
                      {student.name}
                    </Link>
                    {isPending && (
                      <span className="badge badge-pending text-[10px] py-0.5 px-1.5 font-bold shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className={`badge ${getStatusBadgeClass(student.status)} text-[10px] shrink-0`}>
                    {getStatusLabel(student.status)}
                  </span>
                </div>

                {/* Second row: Student code (mono) + phone number */}
                <div className="flex items-center justify-between gap-2 text-xs text-[#65788c]">
                  <span className="font-mono font-medium text-[#0b1d2e] bg-[#f4f9fc] border border-[#dce8f0] px-2 py-0.5 rounded">
                    {student.studentCode}
                  </span>
                  <a
                    href={`tel:${student.phone}`}
                    className="font-mono text-xs hover:text-[#13b8c8] transition-colors"
                  >
                    {student.phone}
                  </a>
                </div>

                {/* Third row: Seat number + Timing/Shift (if available) */}
                <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f0f5f9]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#65788c] text-[11px]">Seat:</span>
                    {student.seatNumber ? (
                      <span className="px-2 py-0.5 bg-[#edf4f8] border border-[#dce8f0] rounded text-[#0b1d2e] font-mono font-semibold text-xs">
                        {student.seatNumber}
                      </span>
                    ) : (
                      <span className="text-[#65788c]">—</span>
                    )}
                  </div>

                  <div className="text-right">
                    {student.seatStartTime && student.seatEndTime ? (
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e7faff] text-[#075a70] border border-[#13b8c8]/30 font-semibold font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-[#13b8c8]" />
                          <span>{student.seatStartTime} – {student.seatEndTime}</span>
                        </span>
                        {student.seatDays && student.seatDays.length > 0 && (
                          <span className="text-[10px] text-[#65788c] mt-0.5 font-medium">
                            {student.seatDays.length === 7
                              ? 'All 7 days'
                              : student.seatDays.map((d: string) => d.slice(0, 3)).join(', ')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#65788c] text-[11px] font-medium">Full Day (24×7)</span>
                    )}
                  </div>
                </div>

                {/* Fourth row: Membership plan name + expiry date */}
                <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f0f5f9]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#65788c] text-[11px]">Plan:</span>
                    {activeMem ? (
                      <span className={`badge ${getStatusBadgeClass(activeMem.status)} text-[10px]`}>
                        {activeMem.planNameSnapshot}
                      </span>
                    ) : (
                      <span className="text-xs text-[#65788c] italic">No Active Plan</span>
                    )}
                  </div>

                  {activeMem && (
                    <div className="text-[11px] text-[#65788c]">
                      Exp: <span className="font-medium text-[#0b1d2e]">{formatDate(activeMem.endDate)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#f0f5f9]">
                  <span className="text-[#65788c] text-[11px]">Fee due</span>
                  <FeeDue student={student} />
                </div>

                {/* Bottom row: Action buttons (View, Edit, Archive) as icon buttons with labels, min 44px touch targets */}
                <div className="pt-2 border-t border-[#f0f5f9] flex items-center gap-2">
                  <Link
                    to={`/admin/students/${student._id}`}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4f9fc] hover:bg-[#edf4f8] text-[#0b1d2e] text-xs font-semibold border border-[#dce8f0] transition-colors"
                  >
                    <Eye size={15} className="text-[#13b8c8]" />
                    <span>View</span>
                  </Link>

                  <Link
                    to={`/admin/students/${student._id}#profile`}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4f9fc] hover:bg-[#edf4f8] text-[#0b1d2e] text-xs font-semibold border border-[#dce8f0] transition-colors"
                  >
                    <Edit2 size={15} className="text-[#087d99]" />
                    <span>Edit</span>
                  </Link>

                  {student.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => setStudentToArchive(student)}
                      className="min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#8B1A1A] text-xs font-semibold border border-rose-200 transition-colors"
                    >
                      <Archive size={15} />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#dce8f0] bg-white shadow-sm">
        <div className="student-directory hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {STUDENT_COLUMNS.filter((column) => columns.visible(column.id)).map((column) => (
                <th
                  key={column.id}
                  className={`py-3 whitespace-nowrap ${column.id === 'actions' ? 'text-right' : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce8f0]/70 text-sm text-[#0b1d2e]">
            {loading ? (
              // Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.shownCount} className="py-4 px-4">
                    <div className="h-5 w-full bg-[#edf4f8] animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.shownCount} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-[#65788c]">
                    <div className="w-14 h-14 rounded-full bg-[#13b8c8]/10 flex items-center justify-center text-[#13b8c8] mb-3">
                      <Users size={28} />
                    </div>
                    <p className="text-base font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">No students found</p>
                    <p className="text-xs text-[#65788c] mt-1 max-w-sm">
                      Try modifying your search or filter settings, or enroll a new student.
                    </p>
                    <Link
                      to="/admin/students/add"
                      className="btn btn-primary mt-4 text-xs py-2 px-4"
                    >
                      <UserPlus size={14} /> Add Student
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isPending = student.registrationStatus === 'pending';
                const activeMem = student.activeMembership;

                return (
                  <tr
                    key={student._id}
                    className={`transition-colors ${(student.outstanding || 0) > 0 ? 'is-due bg-rose-50/70 hover:bg-rose-50' : 'hover:bg-[#f4f9fc]/60'}`}
                  >
                    {columns.visible('code') && (
                    <td className="py-3 whitespace-nowrap font-mono font-medium text-xs text-[#0b1d2e]">
                      {student.studentCode}
                    </td>
                    )}

                    {columns.visible('name') && (
                    <td className="py-3 font-medium text-[#0b1d2e]">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="hover:text-[#13b8c8] font-semibold transition-colors"
                        >
                          {student.name}
                        </Link>
                        {isPending && (
                          <span className="badge badge-pending text-[10px] py-0.5 px-1.5 font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      {student.email && (
                        <div className="text-xs text-[#65788c] font-normal">{student.email}</div>
                      )}
                    </td>
                    )}

                    {columns.visible('phone') && (
                    <td className="py-3 whitespace-nowrap text-[#65788c] font-mono text-xs">
                      {student.phone}
                    </td>
                    )}

                    {columns.visible('joining') && (
                    <td className="py-3 whitespace-nowrap text-[#65788c] text-xs">
                      {formatDate(student.joiningDate)}
                    </td>
                    )}

                    {columns.visible('status') && (
                    <td className="py-3">
                      <span className={`badge ${getStatusBadgeClass(student.status)} text-[10px]`}>
                        {getStatusLabel(student.status)}
                      </span>
                    </td>
                    )}

                    {columns.visible('membership') && (
                    <td className="py-3">
                      {activeMem ? (
                        <div className="max-w-[11rem]">
                          <span className={`badge membership-chip ${getStatusBadgeClass(activeMem.status)} text-[10px]`}>
                            {activeMem.planNameSnapshot}
                          </span>
                          <div className="text-[11px] text-[#65788c] mt-0.5">
                            Exp: {formatDate(activeMem.endDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#65788c] italic">No Active Plan</span>
                      )}
                    </td>
                    )}

                    {columns.visible('fee') && (
                    <td className="py-3 whitespace-nowrap">
                      <FeeDue student={student} />
                    </td>
                    )}

                    {columns.visible('seat') && (
                    <td className="py-3 text-xs font-semibold text-[#0b1d2e]">
                      {student.seatNumber ? (
                        <span className="px-2 py-0.5 bg-[#edf4f8] border border-[#dce8f0] rounded text-[#0b1d2e] font-mono text-xs">
                          {student.seatNumber}
                        </span>
                      ) : (
                        <span className="text-[#65788c]">—</span>
                      )}
                    </td>
                    )}

                    {columns.visible('shift') && (
                    <td className="py-3 text-xs">
                      {student.seatStartTime && student.seatEndTime ? (
                        <div>
                          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#e7faff] text-[#075a70] border border-[#13b8c8]/30 font-semibold font-mono text-[11px]">
                            <Clock className="w-3 h-3 shrink-0 text-[#13b8c8]" />
                            <span>{student.seatStartTime} – {student.seatEndTime}</span>
                          </span>
                          {student.seatDays && student.seatDays.length > 0 && (
                            <div className="whitespace-nowrap text-[10px] text-[#65788c] mt-0.5 font-medium">
                              {student.seatDays.length === 7
                                ? 'All 7 days'
                                : student.seatDays.map((d: string) => d.slice(0, 3)).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#65788c] text-xs font-medium">Full Day (24×7)</span>
                      )}
                    </td>
                    )}

                    {columns.visible('actions') && (
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-0.5 rounded-lg border border-[#dce8f0] bg-white p-0.5">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#087d99] hover:bg-[#e7faff] transition-colors"
                          title="View Student"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          to={`/admin/students/${student._id}#profile`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#294055] hover:bg-[#f4f9fc] transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 size={16} />
                        </Link>

                        {student.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => setStudentToArchive(student)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#b42336] hover:bg-rose-50 transition-colors"
                            title="Archive Student"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={totalStudents}
          shown={students.length}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Confirmation Modal for Archiving */}
      {studentToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060A14]/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-[#dce8f0] space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-[#8B1A1A]">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={22} className="text-[#8B1A1A]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-ui)] font-bold text-lg text-[#0b1d2e]">Archive Student</h3>
                <span className="text-xs text-[#65788c]">Status transition confirmation</span>
              </div>
            </div>
            <p className="text-sm text-[#0b1d2e]">
              Are you sure you want to archive <strong>{studentToArchive.name}</strong> (
              {studentToArchive.studentCode})? Their account status will transition to archived.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToArchive(null)}
                className="btn btn-secondary text-xs py-2 px-4 min-h-[44px] md:min-h-0 flex items-center justify-center"
                disabled={archiving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                className="btn bg-[#8B1A1A] hover:bg-[#6b1414] text-white text-xs py-2 px-4 rounded border-none font-semibold transition-colors min-h-[44px] md:min-h-0 flex items-center justify-center"
                disabled={archiving}
              >
                {archiving ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
