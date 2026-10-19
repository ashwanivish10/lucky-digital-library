import { Request, Response } from 'express';
import { hash, verify } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

const isProduction = config.nodeEnv === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  // The live site and API are on different hosts, so the cookie must be sent cross-site.
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const login = async (req: Request, res: Response): Promise<void> => {
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
  let user = await User.findOne({
    $or: [
      { email: input.toLowerCase() },
      ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }, { phone: input }] : []),
    ],
  });

  // 2. If not found and input looks like a phone or student code, search Student doc to find linked User
  if (!user && (cleanDigits.length >= 10 || input.toUpperCase().startsWith('LDL-'))) {
    const student = await Student.findOne({
      $or: [
        ...(cleanDigits.length >= 10 ? [{ phone: cleanDigits }, { phone: input }] : []),
        { studentCode: input.toUpperCase() },
      ],
    });
    if (student?.userId) {
      user = await User.findById(student.userId);
    } else if (student) {
      // Find user matching student phone or email
      user = await User.findOne({
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

  const valid = await verify(user.passwordHash, password);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid phone/email or password' });
    return;
  }

  const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  res.cookie('token', token, COOKIE_OPTIONS);

  // If student, fetch student profile info
  let studentProfile = null;
  if (user.role === 'student' && user.studentId) {
    studentProfile = await Student.findById(user.studentId).select(
      'studentCode name joiningDate seatNumber seatDays seatStartTime seatEndTime shiftTimings status registrationStatus'
    );
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

export const setFirstPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    return;
  }

  const user = await User.findById(req.user._id);
  if (!user) throw createError('User not found', 404);

  user.passwordHash = await hash(newPassword);
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

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  let studentProfile = null;
  if (req.user.role === 'student' && req.user.studentId) {
    studentProfile = await Student.findById(req.user.studentId).select(
      'studentCode name joiningDate status registrationStatus seatNumber'
    );
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      requiresPasswordChange: Boolean(req.user.requiresPasswordChange),
      studentId: req.user.studentId,
      studentProfile,
    },
  });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: parse.error.errors[0].message });
    return;
  }

  const user = await User.findById(req.user._id);
  if (!user) throw createError('User not found', 404);

  const valid = await verify(user.passwordHash, parse.data.currentPassword);
  if (!valid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await hash(parse.data.newPassword);
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};
