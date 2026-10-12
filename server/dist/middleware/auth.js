"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStudent = exports.requireAdmin = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const User_1 = require("../models/User");
const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.userId).select('-passwordHash');
        if (!user || user.status !== 'active') {
            res.status(401).json({ success: false, message: 'Account is inactive or not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = async (req, res, next) => {
    await (0, exports.requireAuth)(req, res, async () => {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required' });
            return;
        }
        next();
    });
};
exports.requireAdmin = requireAdmin;
const requireStudent = async (req, res, next) => {
    await (0, exports.requireAuth)(req, res, async () => {
        if (req.user?.role !== 'student' && req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        next();
    });
};
exports.requireStudent = requireStudent;
//# sourceMappingURL=auth.js.map