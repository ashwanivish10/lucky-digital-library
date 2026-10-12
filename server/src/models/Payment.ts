import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
export type PaymentStatus = 'completed' | 'cancelled' | 'refunded';

export interface IPayment extends Document {
  receiptNumber: string;
  studentId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  // Amount in paise
  amountReceived: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  transactionReference?: string;
  feeCategory: string; // e.g., "Monthly Fee", "Registration Fee", "Late Fee"
  periodLabel?: string; // e.g., "November 2025"
  recordedBy: mongoose.Types.ObjectId;
  status: PaymentStatus;
  notes?: string;
  idempotencyKey?: string; // prevent duplicate submissions
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true },
    amountReceived: { type: Number, required: true, min: 1 }, // paise
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'card', 'other'],
      required: true,
    },
    paymentDate: { type: Date, required: true },
    transactionReference: { type: String, trim: true },
    feeCategory: { type: String, default: 'Monthly Fee' },
    periodLabel: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    notes: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ membershipId: 1 });
paymentSchema.index({ paymentDate: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
