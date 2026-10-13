"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeeReport = exports.createAdjustment = exports.getReceipt = exports.recordPayment = exports.listPayments = void 0;
exports.generateReceiptNumber = generateReceiptNumber;
const zod_1 = require("zod");
const date_fns_1 = require("date-fns");
const Payment_1 = require("../models/Payment");
const Membership_1 = require("../models/Membership");
const Student_1 = require("../models/Student");
const SiteSettings_1 = require("../models/SiteSettings");
const FinancialAdjustment_1 = require("../models/FinancialAdjustment");
const AuditLog_1 = require("../models/AuditLog");
const errorHandler_1 = require("../middleware/errorHandler");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const recordPaymentSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    membershipId: zod_1.z.string(),
    amountReceived: zod_1.z.number().positive(), // in INR (will be converted to paise)
    paymentMethod: zod_1.z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']),
    paymentDate: zod_1.z.string(),
    transactionReference: zod_1.z.string().optional(),
    feeCategory: zod_1.z.string().optional(),
    periodLabel: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().optional(),
});
async function generateReceiptNumber() {
    const settings = await SiteSettings_1.SiteSettings.findOneAndUpdate({}, { $inc: { receiptCounter: 1 } }, { new: true, upsert: true });
    const prefix = settings?.receiptPrefix || 'LDL';
    const counter = settings?.receiptCounter || 1001;
    return `${prefix}-${counter}`;
}
const listPayments = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = { status: 'completed' };
    if (req.query.studentId)
        filter.studentId = req.query.studentId;
    if (req.query.membershipId)
        filter.membershipId = req.query.membershipId;
    if (req.query.method)
        filter.paymentMethod = req.query.method;
    if (req.query.from || req.query.to) {
        filter.paymentDate = {};
        if (req.query.from)
            filter.paymentDate.$gte = new Date(req.query.from);
        if (req.query.to)
            filter.paymentDate.$lte = new Date(req.query.to);
    }
    // Students can only see their own payments
    if (req.user?.role === 'student') {
        filter.studentId = req.user.studentId?.toString();
    }
    const [payments, total] = await Promise.all([
        Payment_1.Payment.find(filter)
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('studentId', 'name studentCode phone')
            .populate('recordedBy', 'name'),
        Payment_1.Payment.countDocuments(filter),
    ]);
    res.json({
        success: true,
        data: payments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
};
exports.listPayments = listPayments;
const recordPayment = async (req, res) => {
    const parse = recordPaymentSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: parse.error.errors[0].message });
        return;
    }
    const data = parse.data;
    // Idempotency check
    if (data.idempotencyKey) {
        const existing = await Payment_1.Payment.findOne({ idempotencyKey: data.idempotencyKey });
        if (existing) {
            res.json({ success: true, data: existing, duplicate: true });
            return;
        }
    }
    const [student, membership] = await Promise.all([
        Student_1.Student.findById(data.studentId),
        Membership_1.Membership.findById(data.membershipId),
    ]);
    if (!student)
        throw (0, errorHandler_1.createError)('Student not found', 404);
    if (!membership)
        throw (0, errorHandler_1.createError)('Membership not found', 404);
    const receiptNumber = await generateReceiptNumber();
    const amountPaise = Math.round(data.amountReceived * 100);
    const payment = await Payment_1.Payment.create({
        receiptNumber,
        studentId: data.studentId,
        membershipId: data.membershipId,
        amountReceived: amountPaise,
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(data.paymentDate),
        transactionReference: data.transactionReference,
        feeCategory: data.feeCategory || 'Membership Fee',
        periodLabel: data.periodLabel || (0, date_fns_1.format)(new Date(data.paymentDate), 'MMMM yyyy'),
        recordedBy: req.user._id,
        status: 'completed',
        notes: data.notes,
        idempotencyKey: data.idempotencyKey,
    });
    await AuditLog_1.AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
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
exports.recordPayment = recordPayment;
const getReceipt = async (req, res) => {
    const { id } = req.params;
    const payment = await Payment_1.Payment.findById(id)
        .populate('studentId', 'name studentCode phone address')
        .populate('membershipId', 'planNameSnapshot startDate endDate baseFeeSnapshot discountAmount')
        .populate('recordedBy', 'name');
    if (!payment)
        throw (0, errorHandler_1.createError)('Payment not found', 404);
    // Students can only view their own receipts
    if (req.user?.role === 'student') {
        const studentId = payment.studentId._id.toString();
        if (req.user.studentId?.toString() !== studentId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
    }
    const settings = await SiteSettings_1.SiteSettings.findOne();
    const pdfBuffer = await (0, pdfGenerator_1.generateReceiptPdf)(payment, settings);
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
};
exports.getReceipt = getReceipt;
const createAdjustment = async (req, res) => {
    const schema = zod_1.z.object({
        studentId: zod_1.z.string(),
        membershipId: zod_1.z.string(),
        paymentId: zod_1.z.string().optional(),
        type: zod_1.z.enum(['discount', 'surcharge', 'refund', 'write_off', 'correction']),
        amount: zod_1.z.number(),
        reason: zod_1.z.string().min(5),
        notes: zod_1.z.string().optional(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: parse.error.errors[0].message });
        return;
    }
    const adj = await FinancialAdjustment_1.FinancialAdjustment.create({
        ...parse.data,
        amount: Math.round(parse.data.amount * 100),
        approvedBy: req.user._id,
    });
    await AuditLog_1.AuditLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'CREATE_ADJUSTMENT',
        entityType: 'FinancialAdjustment',
        entityId: adj._id,
        newValue: parse.data,
        ipAddress: req.ip,
        timestamp: new Date(),
    });
    res.status(201).json({ success: true, data: adj });
};
exports.createAdjustment = createAdjustment;
const getFeeReport = async (req, res) => {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const [collected, byMethod, monthly] = await Promise.all([
        // Total collected
        Payment_1.Payment.aggregate([
            { $match: { status: 'completed', paymentDate: { $gte: from, $lte: to } } },
            { $group: { _id: null, total: { $sum: '$amountReceived' }, count: { $sum: 1 } } },
        ]),
        // By payment method
        Payment_1.Payment.aggregate([
            { $match: { status: 'completed', paymentDate: { $gte: from, $lte: to } } },
            { $group: { _id: '$paymentMethod', total: { $sum: '$amountReceived' }, count: { $sum: 1 } } },
        ]),
        // Monthly breakdown
        Payment_1.Payment.aggregate([
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
exports.getFeeReport = getFeeReport;
//# sourceMappingURL=paymentController.js.map