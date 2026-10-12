import mongoose, { Document } from 'mongoose';
export type AdjustmentType = 'discount' | 'surcharge' | 'refund' | 'write_off' | 'correction';
export interface IFinancialAdjustment extends Document {
    studentId: mongoose.Types.ObjectId;
    membershipId: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    type: AdjustmentType;
    amount: number;
    reason: string;
    approvedBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FinancialAdjustment: mongoose.Model<IFinancialAdjustment, {}, {}, {}, mongoose.Document<unknown, {}, IFinancialAdjustment, {}, {}> & IFinancialAdjustment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FinancialAdjustment.d.ts.map