import mongoose, { Document, Schema } from 'mongoose';

export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';

export interface IBenefit {
  text: string;
}

export interface IMembershipPlan extends Document {
  name: string;
  durationValue: number;
  durationUnit: DurationUnit;
  baseFee: number; // stored in paise (1 INR = 100 paise)
  registrationFee: number; // paise
  benefits: string[];
  terms?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, trim: true },
    durationValue: { type: Number, required: true, min: 1 },
    durationUnit: {
      type: String,
      enum: ['days', 'weeks', 'months', 'years'],
      default: 'months',
    },
    baseFee: { type: Number, required: true, min: 0 }, // paise
    registrationFee: { type: Number, default: 0, min: 0 }, // paise
    benefits: [{ type: String, trim: true }],
    terms: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model<IMembershipPlan>('MembershipPlan', membershipPlanSchema);
