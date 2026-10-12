import mongoose, { Document } from 'mongoose';
export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'inactive';
export interface IMembership extends Document {
    studentId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId;
    planNameSnapshot: string;
    baseFeeSnapshot: number;
    registrationFeeSnapshot: number;
    durationValueSnapshot: number;
    durationUnitSnapshot: string;
    discountAmount: number;
    additionalCharges: number;
    discountReason?: string;
    startDate: Date;
    endDate: Date;
    status: MembershipStatus;
    isRenewal: boolean;
    previousMembershipId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Membership: mongoose.Model<IMembership, {}, {}, {}, mongoose.Document<unknown, {}, IMembership, {}, {}> & IMembership & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Membership.d.ts.map