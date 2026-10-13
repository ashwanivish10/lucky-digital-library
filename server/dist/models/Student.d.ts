import mongoose, { Document } from 'mongoose';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'archived';
export interface IStudent extends Document {
    studentCode: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    profilePhoto?: string;
    joiningDate: Date;
    seatNumber?: string;
    seatDays: string[];
    seatStartTime?: string;
    seatEndTime?: string;
    shiftTimings?: string;
    notes?: string;
    registrationStatus: RegistrationStatus;
    status: StudentStatus;
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Student: mongoose.Model<IStudent, {}, {}, {}, mongoose.Document<unknown, {}, IStudent, {}, {}> & IStudent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Student.d.ts.map