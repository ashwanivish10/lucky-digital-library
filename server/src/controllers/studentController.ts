import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Student } from '../models/Student';
import { Membership } from '../models/Membership';
import { MembershipPlan } from '../models/MembershipPlan';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { generateStudentCode } from '../utils/codeGenerator';
import argon2 from 'argon2';
import { format } from 'date-fns';
import { generateReceiptNumber } from './paymentController';
import {
  findSeatScheduleConflict,
  getOpeningHours,
  normalizeSeatNumber,
  seatSchedulesOverlap,
  SeatSchedule,
  validateSeatSchedule,
  WEEK_DAYS,
} from '../utils/seatSchedule';

// ---- Validation schemas ----
const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  joiningDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  seatNumber: z.string().optional(),
  seatDays: z.array(z.enum(WEEK_DAYS)).optional(),
  seatStartTime: z.string().optional(),
  seatEndTime: z.string().optional(),
  notes: z.string().optional(),
  // For admin-created students, these are approved immediately
  registrationStatus: z.enum(['pending', 'approved']).optional(),
});

const publicRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  address: z.string().optional(),
  password: z.string().min(8),
  message: z.string().optional(),
  seatDays: z.array(z.enum(WEEK_DAYS)).min(1, 'Choose at least one day for your preferred schedule'),
  seatStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid preferred start time'),
  seatEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid preferred end time'),
});

// ---- Controllers ----

export const listStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const registrationStatus = req.query.registrationStatus as string;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$text = { $search: search };
  }
  if (status) filter.status = status;
  if (registrationStatus) filter.registrationStatus = registrationStatus;

  const [students, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
  ]);

  // Attach active membership to each student
  const studentIds = students.map((s) => s._id);
  const memberships = await Membership.find({
    studentId: { $in: studentIds },
    status: { $in: ['active', 'expiring_soon'] },
  })
    .sort({ endDate: -1 })
    .lean();

  const membershipMap = new Map<string, typeof memberships[0]>();
  memberships.forEach((m) => {
    const key = m.studentId.toString();
    if (!membershipMap.has(key)) membershipMap.set(key, m);
  });

  const enriched = students.map((s) => ({
    ...s,
    activeMembership: membershipMap.get(s._id.toString()) || null,
  }));

  res.json({
    success: true,
    data: enriched,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Students can only view their own record
  if (req.user?.role === 'student') {
    if (req.user.studentId?.toString() !== id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
  }

  const student = await Student.findById(id);
  if (!student) throw createError('Student not found', 404);

  // Fetch memberships and payments
  const [memberships, payments] = await Promise.all([
    Membership.find({ studentId: id }).sort({ startDate: -1 }).populate('planId', 'name'),
    Payment.find({ studentId: id, status: 'completed' }).sort({ paymentDate: -1 }),
  ]);

  // Calculate outstanding balance for current active membership
  const activeMembership = memberships.find((m) =>
    ['active', 'expiring_soon'].includes(m.status)
  );

  let outstanding = 0;
  if (activeMembership) {
    const netDue =
      activeMembership.baseFeeSnapshot -
      activeMembership.discountAmount +
      activeMembership.additionalCharges;
    const paid = payments
      .filter((p) => p.membershipId.toString() === activeMembership._id.toString())
      .reduce((sum, p) => sum + p.amountReceived, 0);
    outstanding = netDue - paid;
  }

  res.json({
    success: true,
    data: { student, memberships, payments, outstanding },
  });
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = createStudentSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const data = parse.data;
  const hasSchedule = data.seatDays !== undefined ||
    data.seatStartTime !== undefined ||
    data.seatEndTime !== undefined;
  if (data.seatNumber?.trim() || hasSchedule) {
    const scheduleError = await validateSeatSchedule({
      seatDays: data.seatDays || [],
      seatStartTime: data.seatStartTime || '',
      seatEndTime: data.seatEndTime || '',
    });
    if (scheduleError) {
      res.status(400).json({ success: false, message: scheduleError });
      return;
    }
  }
  if (data.seatNumber?.trim()) {
    const normalizedSeatNumber = normalizeSeatNumber(data.seatNumber);
    if (!normalizedSeatNumber) {
      res.status(400).json({ success: false, message: 'Choose a valid seat from 1 to 58.' });
      return;
    }
    const conflict = await findSeatScheduleConflict(data.seatNumber, {
      seatDays: data.seatDays || [],
      seatStartTime: data.seatStartTime || '',
      seatEndTime: data.seatEndTime || '',
    });
    if (conflict) {
      res.status(409).json({ success: false, message: conflict });
      return;
    }
    data.seatNumber = normalizedSeatNumber;
  }
  const studentCode = await generateStudentCode();

  const student = await Student.create({
    ...data,
    studentCode,
    joiningDate: new Date(data.joiningDate),
    registrationStatus: 'approved',
    status: 'active',
  });

  // Create a user account for the student
  if (data.email) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await argon2.hash(tempPassword);
    await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'student',
      studentId: student._id,
      status: 'active',
    });
    // In production, send tempPassword via email/SMS
  }

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'CREATE_STUDENT',
    entityType: 'Student',
    entityId: student._id,
    newValue: { studentCode, name: data.name, joiningDate: data.joiningDate },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: student });
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const student = await Student.findById(id);
  if (!student) throw createError('Student not found', 404);

  const allowedFields = [
    'name', 'phone', 'email', 'address', 'emergencyContact',
    'seatNumber', 'seatDays', 'seatStartTime', 'seatEndTime', 'notes', 'status',
  ];

  const previous: Record<string, unknown> = {};
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      previous[field] = (student as any)[field];
      updates[field] = req.body[field];
    }
  }

  const nextSeatNumber = updates.seatNumber !== undefined ? String(updates.seatNumber) : student.seatNumber || '';
  if (nextSeatNumber.trim()) {
    const normalizedSeatNumber = normalizeSeatNumber(nextSeatNumber);
    if (!normalizedSeatNumber) {
      res.status(400).json({ success: false, message: 'Choose a valid seat from 1 to 58.' });
      return;
    }
    updates.seatNumber = normalizedSeatNumber;
    const nextSchedule: SeatSchedule = {
      seatDays: updates.seatDays as string[] || student.seatDays || [],
      seatStartTime: updates.seatStartTime as string || student.seatStartTime || '',
      seatEndTime: updates.seatEndTime as string || student.seatEndTime || '',
    };
    const scheduleError = await validateSeatSchedule(nextSchedule);
    if (scheduleError) {
      res.status(400).json({ success: false, message: scheduleError });
      return;
    }
    const conflict = await findSeatScheduleConflict(nextSeatNumber, nextSchedule, student.id);
    if (conflict) {
      res.status(409).json({ success: false, message: conflict });
      return;
    }
  } else {
    updates.seatDays = [];
    updates.seatStartTime = '';
    updates.seatEndTime = '';
  }

  // Joining date update requires explicit reason
  if (req.body.joiningDate !== undefined) {
    if (!req.body.joiningDateReason) {
      res.status(400).json({
        success: false,
        message: 'A reason is required when changing the joining date',
      });
      return;
    }
    previous.joiningDate = student.joiningDate;
    updates.joiningDate = new Date(req.body.joiningDate);

    await AuditLog.create({
      adminId: req.user!._id,
      adminName: req.user!.name,
      action: 'UPDATE_JOINING_DATE',
      entityType: 'Student',
      entityId: student._id,
      reason: req.body.joiningDateReason,
      previousValue: { joiningDate: previous.joiningDate },
      newValue: { joiningDate: updates.joiningDate },
      ipAddress: req.ip,
      timestamp: new Date(),
    });
  }

  Object.assign(student, updates);
  await student.save();

  res.json({ success: true, data: student });
};

export const updateStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'inactive', 'suspended', 'archived'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }

  const student = await Student.findByIdAndUpdate(id, { status }, { new: true });
  if (!student) throw createError('Student not found', 404);

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'UPDATE_STUDENT_STATUS',
    entityType: 'Student',
    entityId: student._id,
    reason,
    newValue: { status },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.json({ success: true, data: student });
};

export const approveRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action, joiningDate, seatNumber, seatDays, seatStartTime, seatEndTime } = req.body; // action: 'approve' | 'reject'

  const student = await Student.findById(id);
  if (!student) throw createError('Student not found', 404);

  if (action === 'approve') {
    if (seatNumber) {
      const schedule: SeatSchedule = {
        seatDays: seatDays || student.seatDays || [],
        seatStartTime: seatStartTime || student.seatStartTime || '',
        seatEndTime: seatEndTime || student.seatEndTime || '',
      };
      const scheduleError = await validateSeatSchedule(schedule);
      if (scheduleError) {
        res.status(400).json({ success: false, message: scheduleError });
        return;
      }
      const conflict = await findSeatScheduleConflict(seatNumber, schedule, student.id);
      if (conflict) {
        res.status(409).json({ success: false, message: conflict });
        return;
      }
      const normalizedSeatNumber = normalizeSeatNumber(seatNumber);
      if (!normalizedSeatNumber) {
        res.status(400).json({ success: false, message: 'Choose a valid seat from 1 to 58.' });
        return;
      }
      student.seatNumber = normalizedSeatNumber;
      student.seatDays = schedule.seatDays;
      student.seatStartTime = schedule.seatStartTime;
      student.seatEndTime = schedule.seatEndTime;
    }
    student.registrationStatus = 'approved';
    student.status = 'active';
    if (joiningDate) student.joiningDate = new Date(joiningDate);

    // Activate their user account
    await User.findOneAndUpdate({ studentId: student._id }, { status: 'active' });
  } else {
    student.registrationStatus = 'rejected';
    student.status = 'inactive';
    await User.findOneAndUpdate({ studentId: student._id }, { status: 'inactive' });
  }

  await student.save();

  res.json({ success: true, data: student });
};

// Public self-registration
export const publicRegister = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = publicRegistrationSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const { name, phone, email, address, password, message, seatDays, seatStartTime, seatEndTime } = parse.data;
  const schedule = { seatDays, seatStartTime, seatEndTime };
  const scheduleError = await validateSeatSchedule(schedule);
  if (scheduleError) {
    res.status(400).json({ success: false, message: scheduleError });
    return;
  }

  // Check if email already registered
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'This email is already registered' });
    return;
  }

  const studentCode = await generateStudentCode();
  const student = await Student.create({
    studentCode,
    name,
    phone,
    email,
    address,
    joiningDate: new Date(),
    ...schedule,
    registrationStatus: 'pending',
    status: 'inactive',
    notes: message ? `Self-registration note: ${message}` : undefined,
  });

  const passwordHash = await argon2.hash(password);
  await User.create({
    name,
    email,
    passwordHash,
    role: 'student',
    studentId: student._id,
    status: 'inactive', // activated on approval
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted. The library will contact you for approval.',
    data: { studentCode },
  });
};

export const getSeatMap = async (req: AuthRequest, res: Response): Promise<void> => {
  const allStudents = await Student.find({
    status: 'active',
    registrationStatus: 'approved',
    seatNumber: { $exists: true, $ne: '' },
  }).select('name studentCode seatNumber seatDays seatStartTime seatEndTime');

  const queryDays = typeof req.query.days === 'string' ? req.query.days.split(',').filter(Boolean) : [];
  const queryStart = typeof req.query.startTime === 'string' ? req.query.startTime : '';
  const queryEnd = typeof req.query.endTime === 'string' ? req.query.endTime : '';
  const hasScheduleFilter = queryDays.length > 0 || queryStart || queryEnd;
  let requestedSchedule: SeatSchedule | null = null;
  if (hasScheduleFilter) {
    requestedSchedule = {
      seatDays: queryDays,
      seatStartTime: queryStart,
      seatEndTime: queryEnd,
    };
    const scheduleError = await validateSeatSchedule(requestedSchedule);
    if (scheduleError) {
      res.status(400).json({ success: false, message: scheduleError });
      return;
    }
  }

  const students = requestedSchedule
    ? allStudents.filter((student) => seatSchedulesOverlap(requestedSchedule!, {
        seatDays: student.seatDays || [],
        seatStartTime: student.seatStartTime || '',
        seatEndTime: student.seatEndTime || '',
      }))
    : allStudents;

  const seatOccupancy: Record<number, { studentCode?: string; studentName?: string }> = {};

  for (const s of students) {
    if (!s.seatNumber) continue;
    const match = s.seatNumber.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= 1 && num <= 58) {
        seatOccupancy[num] = {
          studentCode: req.user?.role === 'admin' ? s.studentCode : undefined,
          studentName: req.user?.role === 'admin' ? s.name : undefined,
        };
      }
    }
  }

  let mySeatNumber: number | null = null;
  if (req.user?.role === 'student' && req.user?.studentId) {
    const me = await Student.findById(req.user.studentId).select('seatNumber');
    if (me?.seatNumber) {
      const match = me.seatNumber.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num >= 1 && num <= 58) {
          mySeatNumber = num;
        }
      }
    }
  }

  const seats = [];
  for (let i = 1; i <= 58; i++) {
    const isOccupied = !!seatOccupancy[i];
    const isMySeat = mySeatNumber === i && isOccupied;
    // East Wing: 1–30 (right wall in layout), West Wing: 31–58 (left wall in layout)
    const side = i <= 30 ? 'right' : 'left';

    seats.push({
      seatNumber: i,
      label: `Seat ${i}`,
      side,
      wing: i <= 30 ? 'East Wing' : 'West Wing',
      isOccupied,
      isMySeat,
      studentCode: seatOccupancy[i]?.studentCode,
      studentName: seatOccupancy[i]?.studentName,
    });
  }

  res.json({
    success: true,
    data: {
      totalSeats: 58,
      eastWingSeats: 30,
      westWingSeats: 28,
      leftRowSeats: 28, // West Wing (31–58)
      rightRowSeats: 30, // East Wing (1–30)
      mySeatNumber,
      seats,
      openingHours: await getOpeningHours(),
    },
  });
};

const customEnrollSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  shiftTimings: z.string().optional(),
  seatNumber: z.union([z.string(), z.number()]).optional().transform((val) => val !== undefined && val !== null ? String(val) : undefined),
  startDate: z.string(),
  endDate: z.string(),
  totalFee: z.number().min(0, 'Total fee cannot be negative'),
  amountReceivedToday: z.number().min(0, 'Amount received cannot be negative'),
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']).default('cash'),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export const customEnroll = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = customEnrollSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const data = parse.data;
  const cleanPhone = data.phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
    return;
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ success: false, message: 'Valid start and end dates are required' });
    return;
  }
  if (end < start) {
    res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
    return;
  }

  let normalizedSeat: string | undefined = undefined;
  if (data.seatNumber && data.seatNumber.trim()) {
    const norm = normalizeSeatNumber(data.seatNumber.trim());
    if (!norm) {
      res.status(400).json({ success: false, message: 'Choose a valid seat number between 1 and 58' });
      return;
    }
    normalizedSeat = norm;
  }

  // 1. Find or create Student
  let student = await Student.findOne({ phone: cleanPhone });
  if (!student) {
    const studentCode = await generateStudentCode();
    student = await Student.create({
      studentCode,
      name: data.name.trim(),
      phone: cleanPhone,
      joiningDate: start,
      seatNumber: normalizedSeat,
      seatDays: [...WEEK_DAYS],
      shiftTimings: data.shiftTimings?.trim() || undefined,
      registrationStatus: 'approved',
      status: 'active',
      notes: data.notes?.trim() || undefined,
    });
  } else {
    student.name = data.name.trim();
    if (normalizedSeat) student.seatNumber = normalizedSeat;
    if (data.shiftTimings) student.shiftTimings = data.shiftTimings.trim();
    student.registrationStatus = 'approved';
    student.status = 'active';
    if (data.notes) {
      student.notes = student.notes ? `${student.notes} | ${data.notes.trim()}` : data.notes.trim();
    }
    await student.save();
  }

  // 2. Setup Student User credentials (Phone as password, requiresPasswordChange = true)
  let user = await User.findOne({
    $or: [{ phone: cleanPhone }, { studentId: student._id }],
  });

  if (!user) {
    const passwordHash = await argon2.hash(cleanPhone);
    user = await User.create({
      name: student.name,
      phone: cleanPhone,
      passwordHash,
      role: 'student',
      studentId: student._id,
      status: 'active',
      requiresPasswordChange: true,
    });
  } else {
    user.name = student.name;
    user.phone = cleanPhone;
    user.studentId = student._id;
    user.status = 'active';
    if (user.requiresPasswordChange) {
      user.passwordHash = await argon2.hash(cleanPhone);
    }
    await user.save();
  }

  if (!student.userId) {
    student.userId = user._id;
    await student.save();
  }

  // 3. Create Custom Membership
  const durationDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const membership = await Membership.create({
    studentId: student._id,
    planNameSnapshot: data.shiftTimings ? `Walk-in (${data.shiftTimings})` : 'Custom Walk-in Plan',
    baseFeeSnapshot: Math.round(data.totalFee * 100),
    registrationFeeSnapshot: 0,
    durationValueSnapshot: durationDays,
    durationUnitSnapshot: 'days',
    discountAmount: 0,
    additionalCharges: 0,
    startDate: start,
    endDate: end,
    status: 'active',
    createdBy: req.user!._id,
    notes: data.notes || 'Walk-in custom enrollment',
  });

  // 4. Record Payment if amount > 0
  let payment = null;
  if (data.amountReceivedToday > 0) {
    const receiptNumber = await generateReceiptNumber();
    payment = await Payment.create({
      receiptNumber,
      studentId: student._id,
      membershipId: membership._id,
      amountReceived: Math.round(data.amountReceivedToday * 100),
      paymentMethod: data.paymentMethod,
      paymentDate: new Date(),
      transactionReference: data.transactionReference,
      feeCategory: 'Membership Fee',
      periodLabel: format(start, 'MMMM yyyy'),
      recordedBy: req.user!._id,
      status: 'completed',
      notes: `Custom Walk-in Enrollment (${data.paymentMethod.toUpperCase()})`,
    });
  }

  // 5. Audit log
  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'CUSTOM_ENROLL_STUDENT',
    entityType: 'Student',
    entityId: student._id,
    newValue: {
      studentCode: student.studentCode,
      name: student.name,
      phone: cleanPhone,
      seatNumber: normalizedSeat,
      totalFee: data.totalFee,
      amountReceivedToday: data.amountReceivedToday,
      membershipId: membership._id,
      paymentId: payment?._id,
      receiptNumber: payment?.receiptNumber,
    },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Student enrolled successfully!',
    data: {
      student,
      membership,
      payment,
      paymentId: payment?._id,
      receiptNumber: payment?.receiptNumber,
    },
  });
};

