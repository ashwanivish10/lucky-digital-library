"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = exports.getDashboardSummary = void 0;
const date_fns_1 = require("date-fns");
const Student_1 = require("../models/Student");
const Membership_1 = require("../models/Membership");
const Payment_1 = require("../models/Payment");
const SiteSettings_1 = require("../models/SiteSettings");
const getDashboardSummary = async (_req, res) => {
    const settings = await SiteSettings_1.SiteSettings.findOne();
    const warningDays = settings?.expiryWarningDays || 7;
    const now = new Date();
    const monthStart = (0, date_fns_1.startOfMonth)(now);
    const monthEnd = (0, date_fns_1.endOfMonth)(now);
    const yearStart = (0, date_fns_1.startOfYear)(now);
    const warningDate = new Date(now);
    warningDate.setDate(warningDate.getDate() + warningDays);
    const [totalStudents, activeStudents, pendingApprovals, activeMemberships, expiredMemberships, expiringSoon, monthlyCollected, yearlyCollected,] = await Promise.all([
        Student_1.Student.countDocuments({ status: { $ne: 'archived' } }),
        Student_1.Student.countDocuments({ status: 'active' }),
        Student_1.Student.countDocuments({ registrationStatus: 'pending' }),
        Membership_1.Membership.countDocuments({ status: 'active' }),
        Membership_1.Membership.countDocuments({ status: 'expired' }),
        Membership_1.Membership.countDocuments({ status: 'expiring_soon' }),
        Payment_1.Payment.aggregate([
            { $match: { status: 'completed', paymentDate: { $gte: monthStart, $lte: monthEnd } } },
            { $group: { _id: null, total: { $sum: '$amountReceived' } } },
        ]),
        Payment_1.Payment.aggregate([
            { $match: { status: 'completed', paymentDate: { $gte: yearStart, $lte: now } } },
            { $group: { _id: null, total: { $sum: '$amountReceived' } } },
        ]),
    ]);
    res.json({
        success: true,
        data: {
            totalStudents,
            activeStudents,
            pendingApprovals,
            activeMemberships,
            expiredMemberships,
            expiringSoon,
            monthlyCollected: (monthlyCollected[0]?.total || 0) / 100, // paise to INR
            yearlyCollected: (yearlyCollected[0]?.total || 0) / 100,
        },
    });
};
exports.getDashboardSummary = getDashboardSummary;
const getDashboardAnalytics = async (_req, res) => {
    const now = new Date();
    // Last 6 months of data
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = (0, date_fns_1.subMonths)(now, 5 - i);
        return { start: (0, date_fns_1.startOfMonth)(d), end: (0, date_fns_1.endOfMonth)(d), label: d };
    });
    const [monthlyFees, monthlyRegistrations, membershipStatusBreakdown, paymentMethodBreakdown] = await Promise.all([
        // Monthly fees for last 6 months
        Payment_1.Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentDate: { $gte: months[0].start, $lte: now },
                },
            },
            {
                $group: {
                    _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
                    total: { $sum: '$amountReceived' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        // Monthly new registrations
        Student_1.Student.aggregate([
            { $match: { createdAt: { $gte: months[0].start, $lte: now } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        // Active vs expired vs expiring memberships
        Membership_1.Membership.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        // Payment method breakdown (last 3 months)
        Payment_1.Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentDate: { $gte: (0, date_fns_1.subMonths)(now, 3) },
                },
            },
            { $group: { _id: '$paymentMethod', total: { $sum: '$amountReceived' }, count: { $sum: 1 } } },
        ]),
    ]);
    res.json({
        success: true,
        data: {
            monthlyFees,
            monthlyRegistrations,
            membershipStatusBreakdown,
            paymentMethodBreakdown,
        },
    });
};
exports.getDashboardAnalytics = getDashboardAnalytics;
//# sourceMappingURL=dashboardController.js.map