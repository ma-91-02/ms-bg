import { Request, Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare const createAdvertisement: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdvertisements: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAdvertisementById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserAdvertisements: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdvertisement: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAdvertisement: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAsResolved: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConstants: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=advertisementController.d.ts.map