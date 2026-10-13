export interface IFacility {
  _id?: string;
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
  order: number;
}

export interface IGalleryImage {
  _id?: string;
  url: string;
  caption?: string;
  order: number;
}

export interface ITestimonial {
  _id?: string;
  name: string;
  text: string;
  rating?: number;
  role?: string;
  avatarUrl?: string;
  relativeTime?: string;
  source?: 'google' | 'direct' | 'manual';
  googleReviewId?: string;
  isVisible: boolean;
  createdAt?: string;
}

export interface IOpeningHours {
  _id?: string;
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface ISiteSettings {
  libraryName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  mapLink?: string;
  logoUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  openingHours: IOpeningHours[];
  facilities: IFacility[];
  galleryImages: IGalleryImage[];
  testimonials: ITestimonial[];
  testimonialsEnabled: boolean;
  rules: string[];
  missionText?: string;
  visionText?: string;
  aboutText?: string;
  featuredPlanIds?: string[];
  currency?: string;
  currencySymbol?: string;
  // Google Reviews
  googlePlaceId?: string;
  googleApiKey?: string;
  googleRating?: number;
  googleReviewCount?: number;
  lastGoogleSync?: string;
  autoSyncGoogleReviews?: boolean;
  // Notice Bar
  noticeEnabled?: boolean;
  noticeText?: string;
  noticeBadge?: string;
  noticeLink?: string;
  noticeLinkText?: string;
}

export interface IMembershipPlan {
  _id: string;
  name: string;
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  baseFee: number; // in paise
  registrationFee: number; // in paise
  benefits: string[];
  terms?: string;
  isActive: boolean;
  displayOrder: number;
}

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface IContactMessage {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

