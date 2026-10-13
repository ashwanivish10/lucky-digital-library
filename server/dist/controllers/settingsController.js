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
exports.submitScholarReview = exports.syncReviews = exports.submitContactForm = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.listPlans = exports.getPublicSettings = exports.updateSettings = exports.getSettings = void 0;
const SiteSettings_1 = require("../models/SiteSettings");
const MembershipPlan_1 = require("../models/MembershipPlan");
const ContactMessage_1 = require("../models/ContactMessage");
const DEFAULT_HOURS = [
    { day: 'Monday', open: '06:00', close: '22:00', isClosed: false },
    { day: 'Tuesday', open: '06:00', close: '22:00', isClosed: false },
    { day: 'Wednesday', open: '06:00', close: '22:00', isClosed: false },
    { day: 'Thursday', open: '06:00', close: '22:00', isClosed: false },
    { day: 'Friday', open: '06:00', close: '22:00', isClosed: false },
    { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
    { day: 'Sunday', open: '08:00', close: '18:00', isClosed: false },
];
const getSettings = async (_req, res) => {
    let settings = await SiteSettings_1.SiteSettings.findOne();
    if (!settings) {
        settings = await SiteSettings_1.SiteSettings.create({ openingHours: DEFAULT_HOURS });
    }
    res.json({ success: true, data: settings });
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    const settings = await SiteSettings_1.SiteSettings.findOneAndUpdate({}, req.body, {
        new: true,
        upsert: true,
        runValidators: false,
    });
    res.json({ success: true, data: settings });
};
exports.updateSettings = updateSettings;
// Public endpoint — returns only publicly visible fields
const getPublicSettings = async (_req, res) => {
    const settings = await SiteSettings_1.SiteSettings.findOne().select('libraryName tagline description phone whatsapp email address mapLink logoUrl instagramUrl facebookUrl openingHours facilities galleryImages testimonials testimonialsEnabled rules missionText visionText aboutText featuredPlanIds currency currencySymbol googlePlaceId googleRating googleReviewCount lastGoogleSync noticeEnabled noticeText noticeBadge noticeLink noticeLinkText');
    const plans = await MembershipPlan_1.MembershipPlan.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: { settings, plans } });
};
exports.getPublicSettings = getPublicSettings;
// Membership Plans CRUD (admin)
const listPlans = async (_req, res) => {
    const plans = await MembershipPlan_1.MembershipPlan.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: plans });
};
exports.listPlans = listPlans;
const createPlan = async (req, res) => {
    const { name, durationValue, durationUnit, baseFeeINR, registrationFeeINR, benefits, terms, isActive, displayOrder } = req.body;
    const plan = await MembershipPlan_1.MembershipPlan.create({
        name,
        durationValue,
        durationUnit,
        baseFee: Math.round(parseFloat(baseFeeINR) * 100), // INR -> paise
        registrationFee: Math.round(parseFloat(registrationFeeINR || 0) * 100),
        benefits: benefits || [],
        terms,
        isActive: isActive !== false,
        displayOrder: displayOrder || 0,
    });
    res.status(201).json({ success: true, data: plan });
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    const { id } = req.params;
    const { name, durationValue, durationUnit, baseFeeINR, registrationFeeINR, benefits, terms, isActive, displayOrder } = req.body;
    const updates = {};
    if (name !== undefined)
        updates.name = name;
    if (durationValue !== undefined)
        updates.durationValue = durationValue;
    if (durationUnit !== undefined)
        updates.durationUnit = durationUnit;
    if (baseFeeINR !== undefined)
        updates.baseFee = Math.round(parseFloat(baseFeeINR) * 100);
    if (registrationFeeINR !== undefined)
        updates.registrationFee = Math.round(parseFloat(registrationFeeINR) * 100);
    if (benefits !== undefined)
        updates.benefits = benefits;
    if (terms !== undefined)
        updates.terms = terms;
    if (isActive !== undefined)
        updates.isActive = isActive;
    if (displayOrder !== undefined)
        updates.displayOrder = displayOrder;
    const plan = await MembershipPlan_1.MembershipPlan.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, data: plan });
};
exports.updatePlan = updatePlan;
const deletePlan = async (_req, res) => {
    // Soft-delete: just deactivate
    const { id } = _req.params;
    await MembershipPlan_1.MembershipPlan.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, message: 'Plan deactivated' });
};
exports.deletePlan = deletePlan;
// Contact form submission (public)
const submitContactForm = async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;
        if (!name || !name.trim() || !message || !message.trim()) {
            res.status(400).json({ success: false, message: 'Name and message are required' });
            return;
        }
        const savedMessage = await ContactMessage_1.ContactMessage.create({
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            email: email ? email.trim() : '',
            subject: subject ? subject.trim() : '',
            message: message.trim(),
            status: 'unread',
        });
        console.log('[CONTACT FORM SAVED]', savedMessage._id);
        res.json({
            success: true,
            message: 'Your message has been received. We will contact you soon!',
            data: savedMessage,
        });
    }
    catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to submit message' });
    }
};
exports.submitContactForm = submitContactForm;
// Sync Google Reviews from Google Maps (Admin or background)
const syncReviews = async (_req, res) => {
    try {
        const { syncGoogleReviews } = await Promise.resolve().then(() => __importStar(require('../services/googleReviewsSync')));
        const result = await syncGoogleReviews();
        res.json({ success: true, message: 'Google Reviews synced successfully', data: result });
    }
    catch (err) {
        console.error('Error syncing Google reviews:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to sync Google reviews' });
    }
};
exports.syncReviews = syncReviews;
// Scholar public review submission (immediately displays on site)
const submitScholarReview = async (req, res) => {
    try {
        const { name, text, rating, role } = req.body;
        if (!name || !text) {
            res.status(400).json({ success: false, message: 'Name and review text are required' });
            return;
        }
        const { addScholarReview } = await Promise.resolve().then(() => __importStar(require('../services/googleReviewsSync')));
        const review = await addScholarReview({ name, text, rating, role });
        res.json({
            success: true,
            message: 'Thank you! Your review is now published on our website.',
            data: review,
            googleMapsReviewUrl: 'https://maps.app.goo.gl/AaCd93WYde8cYnx79',
        });
    }
    catch (err) {
        console.error('Error submitting scholar review:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to submit review' });
    }
};
exports.submitScholarReview = submitScholarReview;
//# sourceMappingURL=settingsController.js.map