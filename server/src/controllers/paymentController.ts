import { Response } from 'express';
import { z } from 'zod';
import { format } from 'date-fns';
import { Payment } from '../models/Payment';
import { Membership } from '../models/Membership';
import { Student } from '../models/Student';
import { SiteSettings } from '../models/SiteSettings';
import { FinancialAdjustment } from '../models/FinancialAdjustment';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { generateReceiptPdf } from '../utils/pdfGenerator';

const recordPaymentSchema = z.object({
  studentId: z.string(),
  membershipId: z.string(),
  amountReceived: z.number().positive(), // in INR (will be converted to paise)
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']),
  paymentDate: z.string(),
  transactionReference: z.string().optional(),
  feeCategory: z.string().optional(),
  periodLabel: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export async function generateReceiptNumber(): Promise<string> {
  const settings = await SiteSettings.findOneAndUpdate(
    {},
    { $inc: { receiptCounter: 1 } },
    { new: true, upsert: true }
  );
  const prefix = settings?.receiptPrefix || 'LDL';
  const counter = settings?.receiptCounter || 1001;
  return `${prefix}-${counter}`;
}

export const listPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'completed' };

  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.membershipId) filter.membershipId = req.query.membershipId;
  if (req.query.method) filter.paymentMethod = req.query.method;
  if (req.query.from || req.query.to) {
    filter.paymentDate = {};
    if (req.query.from) (filter.paymentDate as Record<string, unknown>).$gte = new Date(req.query.from as string);
    if (req.query.to) (filter.paymentDate as Record<string, unknown>).$lte = new Date(req.query.to as string);
  }

  // Students can only see their own payments
  if (req.user?.role === 'student') {
    filter.studentId = req.user.studentId?.toString();
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name studentCode phone')
      .populate('recordedBy', 'name'),
    Payment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = recordPaymentSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const data = parse.data;

  // Idempotency check
  if (data.idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey: data.idempotencyKey });
    if (existing) {
      res.json({ success: true, data: existing, duplicate: true });
      return;
    }
  }

  const [student, membership] = await Promise.all([
    Student.findById(data.studentId),
    Membership.findById(data.membershipId),
  ]);

  if (!student) throw createError('Student not found', 404);
  if (!membership) throw createError('Membership not found', 404);

  const receiptNumber = await generateReceiptNumber();
  const amountPaise = Math.round(data.amountReceived * 100);

  const payment = await Payment.create({
    receiptNumber,
    studentId: data.studentId,
    membershipId: data.membershipId,
    amountReceived: amountPaise,
    paymentMethod: data.paymentMethod,
    paymentDate: new Date(data.paymentDate),
    transactionReference: data.transactionReference,
    feeCategory: data.feeCategory || 'Membership Fee',
    periodLabel: data.periodLabel || format(new Date(data.paymentDate), 'MMMM yyyy'),
    recordedBy: req.user!._id,
    status: 'completed',
    notes: data.notes,
    idempotencyKey: data.idempotencyKey,
  });

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'RECORD_PAYMENT',
    entityType: 'Payment',
    entityId: payment._id,
    newValue: {
      receiptNumber,
      studentId: data.studentId,
      amount: data.amountReceived,
      method: data.paymentMethod,
    },
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: payment });
};

export const getReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const payment = await Payment.findById(id)
    .populate('studentId', 'name studentCode phone address')
    .populate('membershipId', 'planNameSnapshot startDate endDate baseFeeSnapshot discountAmount')
    .populate('recordedBy', 'name');

  if (!payment) throw createError('Payment not found', 404);

  // Students can only view their own receipts
  if (req.user?.role === 'student') {
    const studentId = (payment.studentId as { _id: { toString(): string } })._id.toString();
    if (req.user.studentId?.toString() !== studentId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
  }

  const settings = await SiteSettings.findOne();
  const pdfBuffer = await generateReceiptPdf(payment, settings);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
};

export const createAdjustment = async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    studentId: z.string(),
    membershipId: z.string(),
    paymentId: z.string().optional(),
    type: z.enum(['discount', 'surcharge', 'refund', 'write_off', 'correction']),
    amount: z.number(),
    reason: z.string().min(5),
    notes: z.string().optional(),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const adj = await FinancialAdjustment.create({
    ...parse.data,
    amount: Math.round(parse.data.amount * 100),
    approvedBy: req.user!._id,
  });

  await AuditLog.create({
    adminId: req.user!._id,
    adminName: req.user!.name,
    action: 'CREATE_ADJUSTMENT',
    entityType: 'FinancialAdjustment',
    entityId: adj._id,
    newValue: parse.data,
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: adj });
};

export const getFeeReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();

  const [collected, byMethod, monthly] = await Promise.all([
    // Total collected
    Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: '$amountReceived' }, count: { $sum: 1 } } },
    ]),
    // By payment method
    Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: from, $lte: to } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amountReceived' }, count: { $sum: 1 } } },
    ]),
    // Monthly breakdown
    Payment.aggregate([
      { $match: { status: 'completed', paymentDate: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
          total: { $sum: '$amountReceived' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalCollected: collected[0]?.total || 0,
      totalTransactions: collected[0]?.count || 0,
      byMethod,
      monthly,
      period: { from, to },
    },
  });
};
