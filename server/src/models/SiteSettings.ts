import mongoose, { Document, Schema } from 'mongoose';

interface IGalleryImage {
  url: string;
  caption?: string;
  order: number;
}

export interface ITestimonial {
  name: string;
  text: string;
  rating?: number;
  role?: string;
  avatarUrl?: string;
  relativeTime?: string;
  source?: 'google' | 'direct' | 'manual';
  googleReviewId?: string;
  isVisible: boolean;
  createdAt?: Date;
}

interface IFacility {
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
  order: number;
}

interface IOpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface IMembershipPlanDisplay {
  planId?: mongoose.Types.ObjectId;
  isHighlighted: boolean;
}

export interface ISiteSettings extends Document {
  // Library Info
  libraryName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  mapLink?: string;
  logoUrl?: string;
  // Social
  instagramUrl?: string;
  facebookUrl?: string;
  // Hours
  openingHours: IOpeningHours[];
  // Content
  facilities: IFacility[];
  galleryImages: IGalleryImage[];
  testimonials: ITestimonial[];
  testimonialsEnabled: boolean;
  // Google Reviews Sync
  googlePlaceId?: string;
  googleApiKey?: string;
  googleRating?: number;
  googleReviewCount?: number;
  lastGoogleSync?: Date;
  autoSyncGoogleReviews?: boolean;
  // Rules
  rules: string[];
  // About
  missionText?: string;
  visionText?: string;
  aboutText?: string;
  // Featured plans on homepage
  featuredPlanIds: mongoose.Types.ObjectId[];
  // Receipt settings
  receiptPrefix: string;
  receiptCounter: number;
  // Currency
  currency: string;
  currencySymbol: string;
  // Membership warning (days before expiry)
  expiryWarningDays: number;
  // Top Notice Bar (running ticker)
  noticeEnabled?: boolean;
  noticeText?: string;
  noticeBadge?: string;
  noticeLink?: string;
  noticeLinkText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    libraryName: { type: String, default: 'Lucky Digital Library' },
    tagline: { type: String, default: 'Your Space to Focus. Your Place to Grow.' },
    description: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String },
    email: { type: String },
    address: { type: String, default: '' },
    mapLink: { type: String },
    logoUrl: { type: String },
    instagramUrl: { type: String },
    facebookUrl: { type: String },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    facilities: [
      {
        icon: String,
        title: String,
        description: String,
        isVisible: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    galleryImages: [
      {
        url: String,
        caption: String,
        order: { type: Number, default: 0 },
      },
    ],
    testimonials: [
      {
        name: String,
        text: String,
        rating: { type: Number, default: 5 },
        role: { type: String, default: 'Scholar' },
        avatarUrl: String,
        relativeTime: String,
        source: { type: String, default: 'google' },
        googleReviewId: String,
        isVisible: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    testimonialsEnabled: { type: Boolean, default: true },
    googlePlaceId: { type: String, default: 'ChIJkxWiLQC5mjkRhcsTeQFjjFM' },
    googleApiKey: { type: String },
    googleRating: { type: Number, default: 4.9 },
    googleReviewCount: { type: Number, default: 28 },
    lastGoogleSync: { type: Date },
    autoSyncGoogleReviews: { type: Boolean, default: true },
    rules: [{ type: String }],
    missionText: { type: String },
    visionText: { type: String },
    aboutText: { type: String },
    featuredPlanIds: [{ type: Schema.Types.ObjectId, ref: 'MembershipPlan' }],
    receiptPrefix: { type: String, default: 'LDL' },
    receiptCounter: { type: Number, default: 1000 },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    expiryWarningDays: { type: Number, default: 7 },
    noticeEnabled: { type: Boolean, default: false },
    noticeText: { type: String, default: '' },
    noticeBadge: { type: String, default: 'ANNOUNCEMENT' },
    noticeLink: { type: String, default: '' },
    noticeLinkText: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
