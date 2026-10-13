"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.logout = exports.setFirstPassword = exports.login = void 0;
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const Student_1 = require("../models/Student");
const config_1 = require("../config");
const errorHandler_1 = require("../middleware/errorHandler");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().optional(),
    identifier: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
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
        res.status(400).json({ success: false, message: 'Please enter your phone number/email and password' });
        return;
    }
    const { email, identifier, password } = parse.data;
    const input = (identifier || email || '').trim();
    if (!input) {
        res.status(400).json({ success: false, message: 'Please enter your phone number or email address' });
        return;
    }
    const cleanDigits = input.replace(/\D/g, '');
    // 1. Try finding User by email or phone
    let user = await User_1.User.findOne({
        $or: [
            { email: input.toLowerCase() },
            ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }, { phone: input }] : []),
        ],
    });
    // 2. If not found and input looks like a phone or student code, search Student doc to find linked User
    if (!user && (cleanDigits.length >= 10 || input.toUpperCase().startsWith('LDL-'))) {
        const student = await Student_1.Student.findOne({
            $or: [
                ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }, { phone: input }] : []),
                { studentCode: input.toUpperCase() },
            ],
        });
        if (student?.userId) {
            user = await User_1.User.findById(student.userId);
        }
        else if (student) {
            // Find user matching student phone or email
            user = await User_1.User.findOne({
                $or: [
                    { phone: student.phone },
                    { email: student.email?.toLowerCase() },
                ],
            });
        }
    }
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
        return;
    }
    if (user.status !== 'active') {
        res.status(403).json({ success: false, message: 'Your account is inactive or suspended. Please contact the library administration.' });
        return;
    }
    const valid = await argon2_1.default.verify(user.passwordHash, password);
    if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwtSecret, {
        expiresIn: config_1.config.jwtExpiresIn,
    });
    res.cookie('token', token, COOKIE_OPTIONS);
    // If student, fetch student profile info
    let studentProfile = null;
    if (user.role === 'student' && user.studentId) {
        studentProfile = await Student_1.Student.findById(user.studentId).select('studentCode name joiningDate seatNumber seatDays seatStartTime seatEndTime shiftTimings status registrationStatus');
    }
    res.json({
        success: true,
        requiresPasswordChange: Boolean(user.requiresPasswordChange),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            requiresPasswordChange: Boolean(user.requiresPasswordChange),
            studentId: user.studentId,
            studentProfile,
        },
        token, // also return in body for clients that prefer it
    });
};
exports.login = login;
const setFirstPassword = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        return;
    }
    const user = await User_1.User.findById(req.user._id);
    if (!user)
        throw (0, errorHandler_1.createError)('User not found', 404);
    user.passwordHash = await argon2_1.default.hash(newPassword);
    user.requiresPasswordChange = false;
    await user.save();
    res.json({
        success: true,
        message: 'Your new password has been set successfully!',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            requiresPasswordChange: false,
            studentId: user.studentId,
        },
    });
};
exports.setFirstPassword = setFirstPassword;
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