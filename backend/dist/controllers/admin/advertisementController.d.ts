import { Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare const getPendingAdvertisements: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveAdvertisement: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectAdvertisement: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllAdvertisements: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdvertisementById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdvertisement: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdvertisement: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAsResolved: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdvertisementsByStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=advertisementController.d.ts.map