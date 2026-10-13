import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  Users,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { studentsApi } from '../../lib/api';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../../lib/utils';
import { CustomEnrollModal } from '../../components/admin/CustomEnrollModal';
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
}

export const StudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [regFilter, setRegFilter] = useState(searchParams.get('registrationStatus') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Archive modal state
  const [studentToArchive, setStudentToArchive] = useState<StudentItem | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [isCustomEnrollOpen, setIsCustomEnrollOpen] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 15,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (regFilter) params.registrationStatus = regFilter;

      const res = await studentsApi.list(params);
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalStudents(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, regFilter]);

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, regFilter, page, fetchStudents]);

  // Sync state into URL params
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (searchTerm) newParams.search = searchTerm;
    if (statusFilter) newParams.status = statusFilter;
    if (regFilter) newParams.registrationStatus = regFilter;
    if (page > 1) newParams.page = String(page);
    setSearchParams(newParams, { replace: true });
  }, [searchTerm, statusFilter, regFilter, page, setSearchParams]);

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCustomEnrollOpen(true)}
            className="btn btn-primary inline-flex items-center gap-2 text-sm shadow-sm"
          >
            <Sparkles size={16} />
            <span>Custom Walk-in Enroll</span>
          </button>
          <Link
            to="/admin/students/add"
            className="btn btn-secondary inline-flex items-center gap-2 text-sm shadow-sm"
          >
            <UserPlus size={16} />
            <span>Standard Add</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card bg-white p-4 rounded-lg border border-[#dce8f0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Debounced Search */}
        <div className="relative flex-1 max-w-md flex items-center bg-[#f4f9fc] border border-[#dce8f0] rounded-md px-3 py-2 focus-within:border-[#13b8c8] transition-colors">
          <Search size={16} className="text-[#65788c] flex-shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search by name, student ID, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full text-sm text-[#0b1d2e] bg-transparent placeholder-[#65788c] focus:outline-none"
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

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
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

          {(searchTerm || statusFilter || regFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setRegFilter('');
                setPage(1);
              }}
              className="text-xs text-[#8B1A1A] hover:underline px-2 py-1 font-semibold transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container shadow-sm border border-[#dce8f0] rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Joining Date</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Membership</th>
              <th className="py-3 px-4">Seat</th>
              <th className="py-3 px-4">Timing / Shift</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce8f0]/70 text-sm text-[#0b1d2e]">
            {loading ? (
              // Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9} className="py-4 px-4">
                    <div className="h-5 w-full bg-[#edf4f8] animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={9} className="py-12 px-4 text-center">
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
                  <tr key={student._id} className="hover:bg-[#f4f9fc]/60 transition-colors">
                    {/* Student Code */}
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-[#0b1d2e]">
                      {student.studentCode}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-medium text-[#0b1d2e]">
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

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-[#65788c] font-mono text-xs">
                      {student.phone}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-[#65788c] text-xs">
                      {formatDate(student.joiningDate)}
                    </td>

                    {/* Account Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`badge ${getStatusBadgeClass(student.status)} text-[10px]`}>
                        {getStatusLabel(student.status)}
                      </span>
                    </td>

                    {/* Membership Status */}
                    <td className="py-3.5 px-4">
                      {activeMem ? (
                        <div>
                          <span className={`badge ${getStatusBadgeClass(activeMem.status)} text-[10px]`}>
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

                    {/* Seat */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#0b1d2e]">
                      {student.seatNumber ? (
                        <span className="px-2 py-0.5 bg-[#edf4f8] border border-[#dce8f0] rounded text-[#0b1d2e] font-mono text-xs">
                          {student.seatNumber}
                        </span>
                      ) : (
                        <span className="text-[#65788c]">—</span>
                      )}
                    </td>

                    {/* Timing / Shift */}
                    <td className="py-3.5 px-4 text-xs">
                      {student.seatStartTime && student.seatEndTime ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#e7faff] text-[#075a70] border border-[#13b8c8]/30 font-semibold font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-[#13b8c8]" />
                            <span>{student.seatStartTime} – {student.seatEndTime}</span>
                          </span>
                          {student.seatDays && student.seatDays.length > 0 && (
                            <div className="text-[10px] text-[#65788c] mt-0.5 font-medium">
                              {student.seatDays.length === 7
                                ? 'All 7 Days (24×7)'
                                : student.seatDays.map((d: string) => d.slice(0, 3)).join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#65788c] text-xs font-medium">Full Day (24×7)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="p-1.5 text-[#65788c] hover:text-[#0b1d2e] hover:bg-[#edf4f8] rounded transition-colors"
                          title="View Student"
                        >
                          <Eye size={15} />
                        </Link>

                        <Link
                          to={`/admin/students/${student._id}#profile`}
                          className="p-1.5 text-[#65788c] hover:text-[#13b8c8] hover:bg-[#edf4f8] rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 size={15} />
                        </Link>

                        {student.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => setStudentToArchive(student)}
                            className="p-1.5 text-[#65788c] hover:text-[#8B1A1A] hover:bg-rose-50 rounded transition-colors"
                            title="Archive Student"
                          >
                            <Archive size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-[#dce8f0] bg-[#f4f9fc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#65788c]">
          <div>
            Showing Page <span className="font-semibold text-[#0b1d2e]">{page}</span> of{' '}
            <span className="font-semibold text-[#0b1d2e]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary py-1 px-3 text-xs bg-white border-[#dce8f0] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary py-1 px-3 text-xs bg-white border-[#dce8f0] disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
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
                className="btn btn-secondary text-xs py-2 px-4"
                disabled={archiving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                className="btn bg-[#8B1A1A] hover:bg-[#6b1414] text-white text-xs py-2 px-4 rounded border-none font-semibold transition-colors"
                disabled={archiving}
              >
                {archiving ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Custom Walk-in Enroll Modal */}
      <CustomEnrollModal
        isOpen={isCustomEnrollOpen}
        onClose={() => setIsCustomEnrollOpen(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

export default StudentsPage;
