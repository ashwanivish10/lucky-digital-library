import { Response } from 'express';
import { z } from 'zod';
import { addDays, addWeeks, addMonths, addYears, differenceInDays } from 'date-fns';
import { Membership, MembershipStatus } from '../models/Membership';
import { MembershipPlan } from '../models/MembershipPlan';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { SiteSettings } from '../models/SiteSettings';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const createMembershipSchema = z.object({
  studentId: z.string(),
  planId: z.string(),
  startDate: z.string(),
  discountAmount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  additionalCharges: z.number().min(0).optional(),
  notes: z.string().optional(),
});

function computeEndDate(start: Date, value: number, unit: string): Date {
  switch (unit) {
    case 'days': return addDays(start, value);
    case 'weeks': return addWeeks(start, value);
    case 'months': return addMonths(start, value);
    case 'years': return addYears(start, value);
    default: return addMonths(start, value);
  }
}

async function computeMembershipStatus(endDate: Date): Promise<MembershipStatus> {
  const settings = await SiteSettings.findOne();
  const warningDays = settings?.expiryWarningDays || 7;
  const today = new Date();
  const daysLeft = differenceInDays(endDate, today);

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= warningDays) return 'expiring_soon';
  return 'active';
}

export const listMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  const studentId = req.query.studentId as string;
  const status = req.query.status as string;

  const filter: Record<string, unknown> = {};
  if (studentId) filter.studentId = studentId;
  if (status) filter.status = status;

  const memberships = await Membership.find(filter)
    .sort({ startDate: -1 })
    .populate('studentId', 'name studentCode phone')
    .populate('planId', 'name');

  res.json({ success: true, data: memberships });
};

export const createMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = createMembershipSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const { studentId, planId, startDate, discountAmount = 0, discountReason, additionalCharges = 0, notes } = parse.data;

  const [student, plan] = await Promise.all([
    Student.findById(studentId),
    MembershipPlan.findById(planId),
  ]);

  if (!student) throw createError('Student not found', 404);
  if (!plan) throw createError('Membership plan not found', 404);

  const start = new Date(startDate);
  const end = computeEndDate(start, plan.durationValue, plan.durationUnit);
  const status = await computeMembershipStatus(end);

  const membership = await Membership.create({
    studentId,
    planId,
    planNameSnapshot: plan.name,
    baseFeeSnapshot: plan.baseFee,
    registrationFeeSnapshot: plan.registrationFee,
    durationValueSnapshot: plan.durationValue,
    durationUnitSnapshot: plan.durationUnit,
    discountAmount: Math.round(discountAmount * 100), // convert INR to paise if needed
    discountReason,
    additionalCharges: Math.round(additionalCharges * 100),
    startDate: start,
    endDate: end,
    status,
    isRenewal: false,
    createdBy: req.user!._id,
    notes,
  });

  // Ensure student record and user account are marked active & approved
  let studentUpdated = false;
  if (student.registrationStatus === 'pending') {
    student.registrationStatus = 'approved';
    studentUpdated = true;
  }
  if (student.status !== 'active') {
    student.status = 'active';
    studentUpdated = true;
  }
  if (studentUpdated) {
    await student.save();
  }
  await User.findOneAndUpdate({ studentId: student._id }, { status: 'active' });

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'CREATE_MEMBERSHIP',
    entityType: 'Membership',
    entityId: membership._id,
    newValue: { studentId, planId: plan.name, startDate, endDate: end },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: membership });
};

export const renewMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { planId, startDate, discountAmount = 0, discountReason, notes } = req.body;

  const existing = await Membership.findById(id);
  if (!existing) throw createError('Membership not found', 404);

  const plan = await MembershipPlan.findById(planId || existing.planId);
  if (!plan) throw createError('Plan not found', 404);

  const start = startDate ? new Date(startDate) : new Date(existing.endDate);
  const end = computeEndDate(start, plan.durationValue, plan.durationUnit);
  const status = await computeMembershipStatus(end);

  const renewal = await Membership.create({
    studentId: existing.studentId,
    planId: plan._id,
    planNameSnapshot: plan.name,
    baseFeeSnapshot: plan.baseFee,
    registrationFeeSnapshot: 0, // no registration fee on renewal
    durationValueSnapshot: plan.durationValue,
    durationUnitSnapshot: plan.durationUnit,
    discountAmount: Math.round((discountAmount || 0) * 100),
    discountReason,
    additionalCharges: 0,
    startDate: start,
    endDate: end,
    status,
    isRenewal: true,
    previousMembershipId: existing._id,
    createdBy: req.user!._id,
    notes,
  });

  // Mark old membership as expired
  existing.status = 'expired';
  await existing.save();

  // Ensure student record and user account are active
  await Student.findByIdAndUpdate(existing.studentId, { status: 'active', registrationStatus: 'approved' });
  await User.findOneAndUpdate({ studentId: existing.studentId }, { status: 'active' });

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'RENEW_MEMBERSHIP',
    entityType: 'Membership',
    entityId: renewal._id,
    newValue: { studentId: existing.studentId, plan: plan.name, startDate: start, endDate: end },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: renewal });
};

export const updateMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const membership = await Membership.findById(id);
  if (!membership) throw createError('Membership not found', 404);

  if (req.body.notes !== undefined) membership.notes = req.body.notes;
  if (req.body.discountReason !== undefined) membership.discountReason = req.body.discountReason;
  // Admin forms send rupees. Stored snapshots stay in paise.
  if (req.body.discountAmount !== undefined) {
    membership.discountAmount = Math.round(Number(req.body.discountAmount) * 100);
  }
  if (req.body.additionalCharges !== undefined) {
    membership.additionalCharges = Math.round(Number(req.body.additionalCharges) * 100);
  }

  const requestedStatus = req.body.status;
  const held = membership.status === 'suspended' || membership.status === 'inactive';
  if (requestedStatus === 'suspended' || requestedStatus === 'inactive') {
    membership.status = requestedStatus;
  } else if (!held || requestedStatus === 'active') {
    membership.status = await computeMembershipStatus(membership.endDate);
  }
  await membership.save();

  res.json({ success: true, data: membership });
};

// Cron-style: update all membership statuses (can be called by a scheduled job)
export const refreshMembershipStatuses = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await SiteSettings.findOne();
  const warningDays = settings?.expiryWarningDays || 7;
  const today = new Date();

  const activeMemberships = await Membership.find({
    status: { $in: ['active', 'expiring_soon'] },
  });

  let updated = 0;
  for (const m of activeMemberships) {
    const daysLeft = differenceInDays(m.endDate, today);
    let newStatus: MembershipStatus = 'active';
    if (daysLeft < 0) newStatus = 'expired';
    else if (daysLeft <= warningDays) newStatus = 'expiring_soon';

    if (m.status !== newStatus) {
      m.status = newStatus;
      await m.save();
      updated++;
    }
  }

  res.json({ success: true, message: `Updated ${updated} membership statuses` });
};
