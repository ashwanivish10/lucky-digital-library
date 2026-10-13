import mongoose, { Document } from 'mongoose';
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
export declare const ContactMessage: mongoose.Model<IContactMessage, {}, {}, {}, mongoose.Document<unknown, {}, IContactMessage, {}, {}> & IContactMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ContactMessage.d.ts.map