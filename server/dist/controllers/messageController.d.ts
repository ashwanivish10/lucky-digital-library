import { Request, Response } from 'express';
export declare const submitContactMessage: (req: Request, res: Response) => Promise<void>;
export declare const listMessages: (req: Request, res: Response) => Promise<void>;
export declare const getUnreadCount: (_req: Request, res: Response) => Promise<void>;
export declare const getMessageById: (req: Request, res: Response) => Promise<void>;
export declare const updateMessage: (req: Request, res: Response) => Promise<void>;
export declare const deleteMessage: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=messageController.d.ts.map