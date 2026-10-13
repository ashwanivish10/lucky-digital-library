import mongoose, { Document, Schema } from 'mongoose';

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface IContactMessage extends Document {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    subject: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
    },
    adminNotes: { type: String, default: '' },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model<IContactMessage>(
  'ContactMessage',
  contactMessageSchema
);
