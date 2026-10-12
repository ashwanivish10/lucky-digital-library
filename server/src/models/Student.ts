import mongoose, { Document, Schema } from 'mongoose';

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
  notes?: string;
  registrationStatus: RegistrationStatus;
  status: StudentStatus;
  userId?: mongoose.Types.ObjectId; // linked User account
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    studentCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    profilePhoto: { type: String },
    joiningDate: { type: Date, required: true },
    seatNumber: { type: String, trim: true },
    seatDays: { type: [String], default: [] },
    seatStartTime: { type: String, trim: true },
    seatEndTime: { type: String, trim: true },
    notes: { type: String },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'archived'],
      default: 'active',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

studentSchema.index({ studentCode: 1 }, { unique: true });
studentSchema.index({ name: 'text', phone: 'text', email: 'text' });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
