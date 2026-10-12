import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getSettings: (_req: Request, res: Response) => Promise<void>;
export declare const updateSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPublicSettings: (_req: Request, res: Response) => Promise<void>;
export declare const listPlans: (_req: Request, res: Response) => Promise<void>;
export declare const createPlan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updatePlan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePlan: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const submitContactForm: (req: Request, res: Response) => Promise<void>;
export declare const syncReviews: (_req: Request, res: Response) => Promise<void>;
export declare const submitScholarReview: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=settingsController.d.ts.map