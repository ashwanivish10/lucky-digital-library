import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, message: 'Invalid email or password format' });
    return;
  }

  const { email, password } = parse.data;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  if (user.status !== 'active') {
    res.status(403).json({ success: false, message: 'Your account has been suspended' });
    return;
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });

  res.cookie('token', token, COOKIE_OPTIONS);

  // If student, fetch student profile info
  let studentProfile = null;
  if (user.role === 'student' && user.studentId) {
    studentProfile = await Student.findById(user.studentId).select('studentCode name joiningDate status registrationStatus');
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
      role: req.user.role,
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

  const valid = await argon2.verify(user.passwordHash, parse.data.currentPassword);
  if (!valid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await argon2.hash(parse.data.newPassword);
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
};
