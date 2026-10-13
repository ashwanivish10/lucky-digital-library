import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function generateReceiptNumber(): Promise<string>;
export declare const listPayments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const recordPayment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getReceipt: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createAdjustment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFeeReport: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map