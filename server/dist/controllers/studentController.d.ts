import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const listStudents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStudentStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const approveRegistration: (req: AuthRequest, res: Response) => Promise<void>;
export declare const publicRegister: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSeatMap: (req: AuthRequest, res: Response) => Promise<void>;
export declare const customEnroll: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=studentController.d.ts.map