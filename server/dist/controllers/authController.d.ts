import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const setFirstPassword: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => void;
export declare const me: (req: AuthRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map