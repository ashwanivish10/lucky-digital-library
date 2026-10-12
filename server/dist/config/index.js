"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ldl',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    uploadsDir: process.env.UPLOADS_DIR || './uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    timezone: process.env.TZ || 'Asia/Kolkata',
    seed: {
        adminName: process.env.SEED_ADMIN_NAME || 'Library Admin',
        adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@luckylibrary.in',
        adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@1234',
    },
};
//# sourceMappingURL=index.js.map