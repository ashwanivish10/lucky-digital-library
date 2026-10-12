import mongoose, { Document, Schema } from 'mongoose';

export type AdjustmentType = 'discount' | 'surcharge' | 'refund' | 'write_off' | 'correction';

export interface IFinancialAdjustment extends Document {
  studentId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId; // if correcting a specific payment
  type: AdjustmentType;
  amount: number; // paise — positive for credit, negative for debit
  reason: string;
  approvedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const financialAdjustmentSchema = new Schema<IFinancialAdjustment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    type: {
      type: String,
      enum: ['discount', 'surcharge', 'refund', 'write_off', 'correction'],
      required: true,
    },
    amount: { type: Number, required: true }, // paise
    reason: { type: String, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FinancialAdjustment = mongoose.model<IFinancialAdjustment>(
  'FinancialAdjustment',
  financialAdjustmentSchema
);
