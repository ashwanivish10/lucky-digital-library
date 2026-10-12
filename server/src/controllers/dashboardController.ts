import { Response } from 'express';
import { differenceInDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import { Student } from '../models/Student';
import { Membership } from '../models/Membership';
import { Payment } from '../models/Payment';
import { SiteSettings } from '../models/SiteSettings';
import { AuthRequest } from '../middleware/auth';

export const getDashboardSummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await SiteSettings.findOne();
  const warningDays = settings?.expiryWarningDays || 7;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const warningDate = new Date(now);
  warningDate.setDate(warningDate.getDate() + warningDays);

  const [
    totalStudents,
    activeStudents,
    pendingApprovals,
    activeMemberships,
    expiredMemberships,
    expiringSoon,
    monthlyCollected,
    yearlyCollected,
  ] = await Promise.all([
    Student.countDocuments({ status: { $ne: 'archived' } }),
    Student.countDocuments({ status: 'active' }),
    Student.countDocuments({ registrationStatus: 'pending' }),
    Membership.countDocuments({ status: 'active' }),
    Membership.countDocuments({ status: 'expired' }),
    Membership.countDocuments({ status: 'expiring_soon' }),
    Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amountReceived' } } },
    ]),
    Payment.aggregate([
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

export const getDashboardAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();

  // Last 6 months of data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    return { start: startOfMonth(d), end: endOfMonth(d), label: d };
  });

  const [monthlyFees, monthlyRegistrations, membershipStatusBreakdown, paymentMethodBreakdown] =
    await Promise.all([
      // Monthly fees for last 6 months
      Payment.aggregate([
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
      Student.aggregate([
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
      Membership.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Payment method breakdown (last 3 months)
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            paymentDate: { $gte: subMonths(now, 3) },
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
