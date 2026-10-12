"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Membership = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const membershipSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    planNameSnapshot: { type: String, required: true },
    baseFeeSnapshot: { type: Number, required: true }, // paise
    registrationFeeSnapshot: { type: Number, default: 0 }, // paise
    durationValueSnapshot: { type: Number, required: true },
    durationUnitSnapshot: { type: String, required: true },
    discountAmount: { type: Number, default: 0 }, // paise
    additionalCharges: { type: Number, default: 0 }, // paise
    discountReason: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['active', 'expiring_soon', 'expired', 'suspended', 'inactive'],
        default: 'active',
    },
    isRenewal: { type: Boolean, default: false },
    previousMembershipId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Membership' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
}, { timestamps: true });
membershipSchema.index({ studentId: 1, startDate: -1 });
membershipSchema.index({ status: 1, endDate: 1 });
exports.Membership = mongoose_1.default.model('Membership', membershipSchema);
//# sourceMappingURL=Membership.js.map