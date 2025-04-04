import { Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare const getPendingContactRequests: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllContactRequests: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveContactRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectContactRequest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=contactRequestController.d.ts.map