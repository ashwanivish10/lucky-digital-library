import mongoose, { Document } from 'mongoose';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
export type PaymentStatus = 'completed' | 'cancelled' | 'refunded';
export interface IPayment extends Document {
    receiptNumber: string;
    studentId: mongoose.Types.ObjectId;
    membershipId: mongoose.Types.ObjectId;
    amountReceived: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    transactionReference?: string;
    feeCategory: string;
    periodLabel?: string;
    recordedBy: mongoose.Types.ObjectId;
    status: PaymentStatus;
    notes?: string;
    idempotencyKey?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map