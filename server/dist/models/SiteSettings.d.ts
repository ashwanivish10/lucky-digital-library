import mongoose, { Document } from 'mongoose';
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
export interface ISiteSettings extends Document {
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
    googlePlaceId?: string;
    googleApiKey?: string;
    googleRating?: number;
    googleReviewCount?: number;
    lastGoogleSync?: Date;
    autoSyncGoogleReviews?: boolean;
    rules: string[];
    missionText?: string;
    visionText?: string;
    aboutText?: string;
    featuredPlanIds: mongoose.Types.ObjectId[];
    receiptPrefix: string;
    receiptCounter: number;
    currency: string;
    currencySymbol: string;
    expiryWarningDays: number;
    noticeEnabled?: boolean;
    noticeText?: string;
    noticeBadge?: string;
    noticeLink?: string;
    noticeLinkText?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SiteSettings: mongoose.Model<ISiteSettings, {}, {}, {}, mongoose.Document<unknown, {}, ISiteSettings, {}, {}> & ISiteSettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=SiteSettings.d.ts.map