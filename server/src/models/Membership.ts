import mongoose, { Document, Schema } from 'mongoose';

export type MembershipStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'suspended'
  | 'inactive';

export interface IMembership extends Document {
  studentId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  // Snapshot of plan details at time of creation — never changes
  planNameSnapshot: string;
  baseFeeSnapshot: number; // paise
  registrationFeeSnapshot: number; // paise
  durationValueSnapshot: number;
  durationUnitSnapshot: string;
  // Adjustments
  discountAmount: number; // paise
  additionalCharges: number; // paise
  discountReason?: string;
  // Period
  startDate: Date;
  endDate: Date;
  // Status
  status: MembershipStatus;
  isRenewal: boolean;
  previousMembershipId?: mongoose.Types.ObjectId;
  // Meta
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    planNameSnapshot: { type: String, required: true },
    baseFeeSnapshot: { type: Number, required: true }, // paise
    registrationFeeSnapshot: { type: Number, default: 0 }, // paise
    durationValueSnapshot: { type: Number, required: true },
    durationUnitSnapshot: { type: String, required: true },
    discountAmount: { type: Number, default: 0 }, // paise
    additionalCharges: { type: Number, default: 0 }, // paise
    discountReason: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expiring_soon', 'expired', 'suspended', 'inactive'],
      default: 'active',
    },
    isRenewal: { type: Boolean, default: false },
    previousMembershipId: { type: Schema.Types.ObjectId, ref: 'Membership' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

membershipSchema.index({ studentId: 1, startDate: -1 });
membershipSchema.index({ status: 1, endDate: 1 });

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
