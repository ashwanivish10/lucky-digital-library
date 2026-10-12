"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.logout = exports.login = void 0;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const Student_1 = require("../models/Student");
const config_1 = require("../config");
const errorHandler_1 = require("../middleware/errorHandler");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config_1.config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
const login = async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: 'Invalid email or password format' });
        return;
    }
    const { email, password } = parse.data;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
    }
    if (user.status !== 'active') {
        res.status(403).json({ success: false, message: 'Your account has been suspended' });
        return;
    }
    const valid = await argon2_1.default.verify(user.passwordHash, password);
    if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpiresIn,
    });
    res.cookie('token', token, COOKIE_OPTIONS);
    // If student, fetch student profile info
    let studentProfile = null;
    if (user.role === 'student' && user.studentId) {
        studentProfile = await Student_1.Student.findById(user.studentId).select('studentCode name joiningDate status registrationStatus');
    }
    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            studentProfile,
        },
        token, // also return in body for clients that prefer it
    });
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const me = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    let studentProfile = null;
    if (req.user.role === 'student' && req.user.studentId) {
        studentProfile = await Student_1.Student.findById(req.user.studentId).select('studentCode name joiningDate status registrationStatus seatNumber');
    }
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            studentId: req.user.studentId,
            studentProfile,
        },
    });
};
exports.me = me;
const changePassword = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const schema = zod_1.z.object({
        currentPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ success: false, message: parse.error.errors[0].message });
        return;
    }
    const user = await User_1.User.findById(req.user._id);
    if (!user)
        throw (0, errorHandler_1.createError)('User not found', 404);
    const valid = await argon2_1.default.verify(user.passwordHash, parse.data.currentPassword);
    if (!valid) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
    }
    user.passwordHash = await argon2_1.default.hash(parse.data.newPassword);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map