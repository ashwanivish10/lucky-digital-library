"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Multer setup for image uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.resolve(config_1.config.uploadsDir);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: config_1.config.maxFileSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext))
            cb(null, true);
        else
            cb(new Error('Only image files are allowed'));
    },
});
// Public routes
router.get('/public', settingsController_1.getPublicSettings);
router.post('/contact', settingsController_1.submitContactForm);
router.post('/submit-review', settingsController_1.submitScholarReview);
// Admin routes
router.get('/', auth_1.requireAdmin, settingsController_1.getSettings);
router.patch('/', auth_1.requireAdmin, settingsController_1.updateSettings);
router.post('/sync-google-reviews', auth_1.requireAdmin, settingsController_1.syncReviews);
router.post('/upload', auth_1.requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url });
});
// Dashboard
router.get('/dashboard/summary', auth_1.requireAdmin, dashboardController_1.getDashboardSummary);
router.get('/dashboard/analytics', auth_1.requireAdmin, dashboardController_1.getDashboardAnalytics);
// Membership Plans
router.get('/plans', settingsController_1.listPlans);
router.post('/plans', auth_1.requireAdmin, settingsController_1.createPlan);
router.patch('/plans/:id', auth_1.requireAdmin, settingsController_1.updatePlan);
router.delete('/plans/:id', auth_1.requireAdmin, settingsController_1.deletePlan);
exports.default = router;
//# sourceMappingURL=settings.js.map