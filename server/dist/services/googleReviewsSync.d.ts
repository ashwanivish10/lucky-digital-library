import { ITestimonial } from '../models/SiteSettings';
/**
 * Main Sync Service Function
 * Fetches real reviews, deduplicates by name/id, merges with existing reviews, and updates database.
 */
export declare function syncGoogleReviews(): Promise<{
    success: boolean;
    totalReviews: number;
    newReviewsAdded: number;
    rating: number;
    lastSync: Date;
}>;
/**
 * Handle new review submitted directly by a student / visitor
 */
export declare function addScholarReview(reviewData: {
    name: string;
    text: string;
    rating?: number;
    role?: string;
}): Promise<ITestimonial>;
//# sourceMappingURL=googleReviewsSync.d.ts.map