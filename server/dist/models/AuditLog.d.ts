import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    action: string;
    entityType: string;
    entityId: mongoose.Types.ObjectId;
    reason?: string;
    previousValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    timestamp: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map