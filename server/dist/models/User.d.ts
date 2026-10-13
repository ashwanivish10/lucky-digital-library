import mongoose, { Document } from 'mongoose';
export type UserRole = 'admin' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    studentId?: mongoose.Types.ObjectId;
    requiresPasswordChange?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map