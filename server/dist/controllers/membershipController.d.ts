import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const listMemberships: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMembership: (req: AuthRequest, res: Response) => Promise<void>;
export declare const renewMembership: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateMembership: (req: AuthRequest, res: Response) => Promise<void>;
export declare const refreshMembershipStatuses: (_req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=membershipController.d.ts.map