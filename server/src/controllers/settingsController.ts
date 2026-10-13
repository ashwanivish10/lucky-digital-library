import { Request, Response } from 'express';
import { SiteSettings } from '../models/SiteSettings';
import { MembershipPlan } from '../models/MembershipPlan';
import { ContactMessage } from '../models/ContactMessage';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_HOURS = [
  { day: 'Monday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Tuesday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Wednesday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Thursday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Friday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Sunday', open: '08:00', close: '18:00', isClosed: false },
];

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({ openingHours: DEFAULT_HOURS });
  }
  res.json({ success: true, data: settings });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await SiteSettings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: false,
  });
  res.json({ success: true, data: settings });
};

// Public endpoint — returns only publicly visible fields
export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await SiteSettings.findOne().select(
    'libraryName tagline description phone whatsapp email address mapLink logoUrl instagramUrl facebookUrl openingHours facilities galleryImages testimonials testimonialsEnabled rules missionText visionText aboutText featuredPlanIds currency currencySymbol googlePlaceId googleRating googleReviewCount lastGoogleSync noticeEnabled noticeText noticeBadge noticeLink noticeLinkText'
  );

  const plans = await MembershipPlan.find({ isActive: true }).sort({ displayOrder: 1 });

  res.json({ success: true, data: { settings, plans } });
};

// Membership Plans CRUD (admin)
export const listPlans = async (_req: Request, res: Response): Promise<void> => {
  const plans = await MembershipPlan.find().sort({ displayOrder: 1 });
  res.json({ success: true, data: plans });
};

export const createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, durationValue, durationUnit, baseFeeINR, registrationFeeINR, benefits, terms, isActive, displayOrder } = req.body;

  const plan = await MembershipPlan.create({
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

export const updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, durationValue, durationUnit, baseFeeINR, registrationFeeINR, benefits, terms, isActive, displayOrder } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (durationValue !== undefined) updates.durationValue = durationValue;
  if (durationUnit !== undefined) updates.durationUnit = durationUnit;
  if (baseFeeINR !== undefined) updates.baseFee = Math.round(parseFloat(baseFeeINR) * 100);
  if (registrationFeeINR !== undefined) updates.registrationFee = Math.round(parseFloat(registrationFeeINR) * 100);
  if (benefits !== undefined) updates.benefits = benefits;
  if (terms !== undefined) updates.terms = terms;
  if (isActive !== undefined) updates.isActive = isActive;
  if (displayOrder !== undefined) updates.displayOrder = displayOrder;

  const plan = await MembershipPlan.findByIdAndUpdate(id, updates, { new: true });
  res.json({ success: true, data: plan });
};

export const deletePlan = async (_req: AuthRequest, res: Response): Promise<void> => {
  // Soft-delete: just deactivate
  const { id } = _req.params;
  await MembershipPlan.findByIdAndUpdate(id, { isActive: false });
  res.json({ success: true, message: 'Plan deactivated' });
};

// Contact form submission (public)
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !name.trim() || !message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Name and message are required' });
      return;
    }

    const savedMessage = await ContactMessage.create({
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
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit message' });
  }
};

// Sync Google Reviews from Google Maps (Admin or background)
export const syncReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { syncGoogleReviews } = await import('../services/googleReviewsSync');
    const result = await syncGoogleReviews();
    res.json({ success: true, message: 'Google Reviews synced successfully', data: result });
  } catch (err: any) {
    console.error('Error syncing Google reviews:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to sync Google reviews' });
  }
};

// Scholar public review submission (immediately displays on site)
export const submitScholarReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, text, rating, role } = req.body;
    if (!name || !text) {
      res.status(400).json({ success: false, message: 'Name and review text are required' });
      return;
    }

    const { addScholarReview } = await import('../services/googleReviewsSync');
    const review = await addScholarReview({ name, text, rating, role });

    res.json({
      success: true,
      message: 'Thank you! Your review is now published on our website.',
      data: review,
      googleMapsReviewUrl: 'https://maps.app.goo.gl/AaCd93WYde8cYnx79',
    });
  } catch (err: any) {
    console.error('Error submitting scholar review:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit review' });
  }
};

