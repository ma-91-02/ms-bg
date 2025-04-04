import { Request, Response, NextFunction } from 'express';
/**
 * وسيط حماية مسارات التطبيق المحمول
 * يتحقق من وجود توكن JWT وإضافة المستخدم إلى الطلب
 */
export declare const protectMobile: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
declare const _default: {
    protectMobile: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=authMiddleware.d.ts.map