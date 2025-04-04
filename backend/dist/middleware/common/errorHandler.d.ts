import { Request, Response, NextFunction } from 'express';
/**
 * واجهة خطأ مخصصة للتطبيق
 */
export interface AppError extends Error {
    statusCode?: number;
    code?: number | string;
    keyValue?: Record<string, any>;
}
/**
 * معالج الأخطاء المركزي للتطبيق
 */
declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map