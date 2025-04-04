import { Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare const getPendingMatches: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllMatches: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveMatch: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectMatch: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const runMatchingForAll: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const runMatchingForOne: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cleanupDuplicateMatches: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMatchHistory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const bulkCreateMatches: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=matchesController.d.ts.map