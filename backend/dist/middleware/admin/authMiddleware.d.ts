import { Request, Response, NextFunction } from 'express';
/**
 * واجهة طلب المصادقة المخصصة للإدارة
 */
export interface AdminAuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}
/**
 * وسيط المصادقة للوحة الإدارة
 */
export declare const authenticateAdmin: (req: AdminAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
declare const _default: {
    authenticateAdmin: (req: AdminAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    protectAdmin: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=authMiddleware.d.ts.map