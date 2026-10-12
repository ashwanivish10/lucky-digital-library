import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getPublicSettings,
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  submitContactForm,
  syncReviews,
  submitScholarReview,
} from '../controllers/settingsController';
import { getDashboardSummary, getDashboardAnalytics } from '../controllers/dashboardController';
import { requireAdmin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const router = Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve(config.uploadsDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Public routes
router.get('/public', getPublicSettings);
router.post('/contact', submitContactForm);
router.post('/submit-review', submitScholarReview);

// Admin routes
router.get('/', requireAdmin, getSettings);
router.patch('/', requireAdmin, updateSettings);
router.post('/sync-google-reviews', requireAdmin, syncReviews);
router.post('/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// Dashboard
router.get('/dashboard/summary', requireAdmin, getDashboardSummary);
router.get('/dashboard/analytics', requireAdmin, getDashboardAnalytics);

// Membership Plans
router.get('/plans', listPlans);
router.post('/plans', requireAdmin, createPlan);
router.patch('/plans/:id', requireAdmin, updatePlan);
router.delete('/plans/:id', requireAdmin, deletePlan);

export default router;
