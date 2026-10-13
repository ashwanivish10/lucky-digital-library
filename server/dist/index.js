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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const memberships_1 = __importDefault(require("./routes/memberships"));
const payments_1 = __importDefault(require("./routes/payments"));
const settings_1 = __importDefault(require("./routes/settings"));
const messages_1 = __importDefault(require("./routes/messages"));
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
// --- CORS Configuration (supports local dev and Vercel deployments) ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lucky-digital-library.vercel.app',
    config_1.config.clientUrl,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser requests (mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        // Allow configured origins or any Vercel preview domain
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Preflight handler
app.options('*', (0, cors_1.default)());
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
});
app.use('/api/auth', authLimiter);
app.use('/auth', authLimiter);
app.use('/api', generalLimiter);
// Middleware
app.use((0, morgan_1.default)(config_1.config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Static files (uploads)
app.use('/uploads', express_1.default.static(path_1.default.resolve(config_1.config.uploadsDir)));
// Primary API Routes (standard /api prefix)
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/memberships', memberships_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/messages', messages_1.default);
// Fallback Routes (handles clients calling without /api prefix)
app.use('/auth', auth_1.default);
app.use('/students', students_1.default);
app.use('/memberships', memberships_1.default);
app.use('/payments', payments_1.default);
app.use('/settings', settings_1.default);
app.use('/messages', messages_1.default);
// Health check endpoints
app.get(['/api/health', '/health', '/'], (_req, res) => {
    res.json({ success: true, message: 'Lucky Digital Library API is running', timestamp: new Date() });
});
// Error handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
async function start() {
    await (0, database_1.connectDB)();
    // Listen on 0.0.0.0 and use PORT environment variable (required for Render)
    const PORT = Number(process.env.PORT) || config_1.config.port || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📦 Environment: ${config_1.config.nodeEnv}`);
        // Background Google Reviews sync (runs on startup + every 6 hours)
        Promise.resolve().then(() => __importStar(require('./services/googleReviewsSync'))).then(({ syncGoogleReviews }) => {
            syncGoogleReviews().catch((e) => console.warn('Google reviews sync note:', e.message));
            setInterval(() => {
                syncGoogleReviews().catch((e) => console.warn('Google reviews periodic sync note:', e.message));
            }, 6 * 60 * 60 * 1000);
        });
    });
}
start();
exports.default = app;
//# sourceMappingURL=index.js.map