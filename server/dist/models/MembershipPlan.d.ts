import mongoose, { Document } from 'mongoose';
export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';
export interface IBenefit {
    text: string;
}
export interface IMembershipPlan extends Document {
    name: string;
    durationValue: number;
    durationUnit: DurationUnit;
    baseFee: number;
    registrationFee: number;
    benefits: string[];
    terms?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MembershipPlan: mongoose.Model<IMembershipPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPlan, {}, {}> & IMembershipPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MembershipPlan.d.ts.map