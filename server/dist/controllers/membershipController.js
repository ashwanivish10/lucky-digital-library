"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshMembershipStatuses = exports.updateMembership = exports.renewMembership = exports.createMembership = exports.listMemberships = void 0;
const zod_1 = require("zod");
const date_fns_1 = require("date-fns");
const Membership_1 = require("../models/Membership");
const MembershipPlan_1 = require("../models/MembershipPlan");
const Student_1 = require("../models/Student");
const User_1 = require("../models/User");
const SiteSettings_1 = require("../models/SiteSettings");
const AuditLog_1 = require("../models/AuditLog");
const errorHandler_1 = require("../middleware/errorHandler");
const createMembershipSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    planId: zod_1.z.string(),
    startDate: zod_1.z.string(),
    discountAmount: zod_1.z.number().min(0).optional(),
    discountReason: zod_1.z.string().optional(),
    additionalCharges: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
});
function computeEndDate(start, value, unit) {
    switch (unit) {
        case 'days': return (0, date_fns_1.addDays)(start, value);
        case 'weeks': return (0, date_fns_1.addWeeks)(start, value);
        case 'months': return (0, date_fns_1.addMonths)(start, value);
        case 'years': return (0, date_fns_1.addYears)(start, value);
        default: return (0, date_fns_1.addMonths)(start, value);
    }
}
async function computeMembershipStatus(endDate) {
    const settings = await SiteSettings_1.SiteSettings.findOne();
    const warningDays = settings?.expiryWarningDays || 7;
    const today = new Date();
    const daysLeft = (0, date_fns_1.differenceInDays)(endDate, today);
    if (daysLeft < 0)
        return 'expired';
    if (daysLeft <= warningDays)
        return 'expiring_soon';
    return 'active';
}
const listMemberships = async (req, res) => {
    const studentId = req.query.studentId;
    const status = req.query.status;
    const filter = {};
    if (studentId)
        filter.studentId = studentId;
    if (status)
        filter.status = status;
    const memberships = await Membership_1.Membership.find(filter)
        .sort({ startDate: -1 })
        .populate('studentId', 'name studentCode phone')
        .populate('planId', 'name');
    res.json({ success: true, data: memberships });
};
exports.listMemberships = listMemberships;
const createMembership = async (req, res) => {
    const parse = createMembershipSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: parse.error.errors[0].message });
        return;
    }
    const { studentId, planId, startDate, discountAmount = 0, discountReason, additionalCharges = 0, notes } = parse.data;
    const [student, plan] = await Promise.all([
        Student_1.Student.findById(studentId),
        MembershipPlan_1.MembershipPlan.findById(planId),
    ]);
    if (!student)
        throw (0, errorHandler_1.createError)('Student not found', 404);
    if (!plan)
        throw (0, errorHandler_1.createError)('Membership plan not found', 404);
    // If the plan was marked inactive, activate it so student's membership is active
    if (!plan.isActive) {
        plan.isActive = true;
        await plan.save();
    }
    const start = new Date(startDate);
    const end = computeEndDate(start, plan.durationValue, plan.durationUnit);
    const status = await computeMembershipStatus(end);
    const membership = await Membership_1.Membership.create({
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
        createdBy: req.user._id,
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
    await User_1.User.findOneAndUpdate({ studentId: student._id }, { status: 'active' });
    await AuditLog_1.AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'CREATE_MEMBERSHIP',
        entityType: 'Membership',
        entityId: membership._id,
        newValue: { studentId, planId: plan.name, startDate, endDate: end },
        ipAddress: req.ip,
        timestamp: new Date(),
    });
    res.status(201).json({ success: true, data: membership });
};
exports.createMembership = createMembership;
const renewMembership = async (req, res) => {
    const { id } = req.params;
    const { planId, startDate, discountAmount = 0, discountReason, notes } = req.body;
    const existing = await Membership_1.Membership.findById(id);
    if (!existing)
        throw (0, errorHandler_1.createError)('Membership not found', 404);
    const plan = await MembershipPlan_1.MembershipPlan.findById(planId || existing.planId);
    if (!plan)
        throw (0, errorHandler_1.createError)('Plan not found', 404);
    const start = startDate ? new Date(startDate) : new Date(existing.endDate);
    const end = computeEndDate(start, plan.durationValue, plan.durationUnit);
    const status = await computeMembershipStatus(end);
    const renewal = await Membership_1.Membership.create({
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
        createdBy: req.user._id,
        notes,
    });
    // Mark old membership as expired
    existing.status = 'expired';
    await existing.save();
    // Ensure student record and user account are active
    await Student_1.Student.findByIdAndUpdate(existing.studentId, { status: 'active', registrationStatus: 'approved' });
    await User_1.User.findOneAndUpdate({ studentId: existing.studentId }, { status: 'active' });
    await AuditLog_1.AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'RENEW_MEMBERSHIP',
        entityType: 'Membership',
        entityId: renewal._id,
        newValue: { studentId: existing.studentId, plan: plan.name, startDate: start, endDate: end },
        ipAddress: req.ip,
        timestamp: new Date(),
    });
    res.status(201).json({ success: true, data: renewal });
};
exports.renewMembership = renewMembership;
const updateMembership = async (req, res) => {
    const { id } = req.params;
    const membership = await Membership_1.Membership.findById(id);
    if (!membership)
        throw (0, errorHandler_1.createError)('Membership not found', 404);
    const allowedFields = ['status', 'notes', 'discountAmount', 'discountReason', 'additionalCharges'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            membership[field] = req.body[field];
        }
    }
    // Recompute status if dates changed
    membership.status = await computeMembershipStatus(membership.endDate);
    await membership.save();
    res.json({ success: true, data: membership });
};
exports.updateMembership = updateMembership;
// Cron-style: update all membership statuses (can be called by a scheduled job)
const refreshMembershipStatuses = async (_req, res) => {
    const settings = await SiteSettings_1.SiteSettings.findOne();
    const warningDays = settings?.expiryWarningDays || 7;
    const today = new Date();
    const activeMemberships = await Membership_1.Membership.find({
        status: { $in: ['active', 'expiring_soon'] },
    });
    let updated = 0;
    for (const m of activeMemberships) {
        const daysLeft = (0, date_fns_1.differenceInDays)(m.endDate, today);
        let newStatus = 'active';
        if (daysLeft < 0)
            newStatus = 'expired';
        else if (daysLeft <= warningDays)
            newStatus = 'expiring_soon';
        if (m.status !== newStatus) {
            m.status = newStatus;
            await m.save();
            updated++;
        }
    }
    res.json({ success: true, message: `Updated ${updated} membership statuses` });
};
exports.refreshMembershipStatuses = refreshMembershipStatuses;
//# sourceMappingURL=membershipController.js.map