import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Award,
  CreditCard,
} from 'lucide-react';
import { studentsApi } from '../../lib/api';
import toast from 'react-hot-toast';
import { WEEK_DAYS } from '../../types/public';

const addStudentSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  seatNumber: z.string().optional(),
  seatDays: z.array(z.enum(WEEK_DAYS)),
  seatStartTime: z.string(),
  seatEndTime: z.string(),
  notes: z.string().optional(),
}).refine((data) => !data.seatNumber?.trim() || (
  data.seatDays.length > 0 &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(data.seatStartTime) &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(data.seatEndTime) &&
  data.seatStartTime < data.seatEndTime
), {
  message: 'Choose at least one valid day and a time range before assigning a seat.',
  path: ['seatDays'],
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

export const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<{ _id: string; name: string; studentCode: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      joiningDate: new Date().toISOString().split('T')[0],
      seatNumber: '',
      seatDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      seatStartTime: '06:00',
      seatEndTime: '14:00',
      notes: '',
    },
  });

  const onSubmit = async (data: AddStudentFormData) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        joiningDate: data.joiningDate,
      };
      if (data.email?.trim()) payload.email = data.email.trim();
      if (data.address?.trim()) payload.address = data.address.trim();
      if (data.emergencyContact?.trim()) payload.emergencyContact = data.emergencyContact.trim();
      if (data.seatNumber?.trim()) payload.seatNumber = data.seatNumber.trim();
      payload.seatDays = data.seatDays;
      payload.seatStartTime = data.seatStartTime;
      payload.seatEndTime = data.seatEndTime;
      if (data.notes?.trim()) payload.notes = data.notes.trim();

      const res = await studentsApi.create(payload);
      if (res.data.success) {
        toast.success(`Student ${res.data.data.name} added successfully!`);
        setCreatedStudent({
          _id: res.data.data._id,
          name: res.data.data.name,
          studentCode: res.data.data.studentCode,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create student. Check if phone/code is duplicate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully created, present quick options (Add Membership, Record Payment, or Back to Directory)
  if (createdStudent) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-fade-in text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div>
          <h2 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">
            Student Added Successfully!
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            <strong>{createdStudent.name}</strong> has been enrolled with Student ID{' '}
            <span className="font-mono font-semibold text-[#0b1d2e]">{createdStudent.studentCode}</span>.
          </p>
        </div>

        <div className="card bg-white p-6 rounded-2xl border border-[#dce8f0] shadow-sm space-y-3 text-left">
          <div className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">
            Next steps for this student:
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admin/students/${createdStudent._id}`)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#dce8f0] hover:border-[#13b8c8] hover:bg-[#f8fbfd] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#13b8c8]/15 text-[#087d99] flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0b1d2e] group-hover:text-[#13b8c8]">
                  Assign Membership Plan
                </div>
                <div className="text-xs text-slate-500">
                  Select a subscription plan and validity period
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#13b8c8]">Proceed →</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/payments/record?studentId=${createdStudent._id}`)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#dce8f0] hover:border-[#2D6A4F] hover:bg-[#f8fbfd] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0b1d2e] group-hover:text-[#2D6A4F]">
                  Record First Fee Payment
                </div>
                <div className="text-xs text-slate-500">
                  Generate official receipt for membership or registration fee
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2D6A4F]">Proceed →</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/students')}
            className="text-xs font-semibold text-slate-500 hover:text-[#0b1d2e] underline"
          >
            Return to Student Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/students')}
          className="p-2 text-slate-500 hover:text-[#0b1d2e] hover:bg-[#e7faff]/50 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-[family-name:var(--font-ui)] font-bold text-[#0b1d2e]">Add New Student</h2>
          <p className="text-sm text-slate-500">
            Register an enrolled library member into the management system
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card bg-white p-6 md:p-8 rounded-2xl border border-[#dce8f0] shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-b border-[#e7faff] pb-4">
            <h3 className="font-[family-name:var(--font-ui)] font-bold text-base text-[#0b1d2e]">Personal Details</h3>
            <p className="text-xs text-slate-400">Basic identification and contact credentials</p>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Chandra Sharma"
              {...register('name')}
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  {...register('phone')}
                  className={`form-input font-mono ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. student@example.com"
                {...register('email')}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Joining Date */}
            <div className="form-group">
              <label className="form-label">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('joiningDate')}
                className={`form-input ${errors.joiningDate ? 'border-red-500' : ''}`}
              />
              {errors.joiningDate && (
                <p className="form-error">{errors.joiningDate.message}</p>
              )}
            </div>

            {/* Seat Number */}
            <div className="form-group">
              <label className="form-label">Assigned Seat Number</label>
              <select
                {...register('seatNumber')}
                className="form-input"
              >
                <option value="">Unassigned</option>
                {Array.from({ length: 64 }, (_, index) => index + 1).map((seatNumber) => (
                  <option key={seatNumber} value={String(seatNumber)}>Seat {seatNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="space-y-4 rounded-2xl border border-[#dce8f0] bg-[#f8fbfd] p-4">
            <legend className="px-1 text-sm font-bold text-[#0b1d2e]">Seat schedule</legend>
            <p className="text-xs text-slate-500">Assign the seat only during these recurring days and hours.</p>
            <div className="flex flex-wrap gap-3">
              {WEEK_DAYS.map((day) => (
                <label key={day} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#294055]">
                  <input type="checkbox" value={day} {...register('seatDays')} className="rounded border-[#dce8f0] text-[#13b8c8] focus:ring-[#13b8c8]" />
                  {day.slice(0, 3)}
                </label>
              ))}
            </div>
            {errors.seatDays && <p className="form-error">{errors.seatDays.message}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="form-group mb-0">
                <label className="form-label">Start time</label>
                <input type="time" {...register('seatStartTime')} className="form-input" />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">End time</label>
                <input type="time" {...register('seatEndTime')} className="form-input" />
              </div>
            </div>
          </fieldset>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              rows={2}
              placeholder="Residential address or locality"
              {...register('address')}
              className="form-textarea"
            />
          </div>

          {/* Emergency Contact */}
          <div className="form-group">
            <label className="form-label">Emergency Contact Phone</label>
            <input
              type="text"
              placeholder="e.g. Parent or guardian contact number"
              {...register('emergencyContact')}
              className="form-input font-mono"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Administrative Notes</label>
            <textarea
              rows={3}
              placeholder="Optional remarks regarding examination goals, slot timing preferences, or documents submitted..."
              {...register('notes')}
              className="form-textarea"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7faff]">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="btn btn-secondary text-sm py-2 px-5"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-sm py-2 px-6 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Creating Student...'
              ) : (
                <>
                  <UserPlus size={16} /> Register Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentPage;
