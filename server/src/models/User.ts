import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  studentId?: mongoose.Types.ObjectId; // link to Student doc for student role
  requiresPasswordChange?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    requiresPasswordChange: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
