import { Response } from 'express';
/**
 * إرسال استجابة نجاح
 * @param res كائن الاستجابة
 * @param data البيانات المراد إرسالها
 * @param message رسالة النجاح
 * @param statusCode رمز الحالة (200 افتراضياً)
 */
export declare const sendSuccess: (res: Response, data?: any, message?: string, statusCode?: number) => Response;
/**
 * إرسال استجابة خطأ
 * @param res كائن الاستجابة
 * @param message رسالة الخطأ
 * @param statusCode رمز الحالة (400 افتراضياً)
 * @param error كائن الخطأ (اختياري)
 */
export declare const sendError: (res: Response, message?: string, statusCode?: number, error?: any) => Response;
/**
 * إنشاء استجابة توثيق
 * @param success حالة النجاح
 * @param token رمز التوثيق
 * @param user بيانات المستخدم
 * @param message الرسالة
 * @returns كائن الاستجابة
 */
export declare const createAuthResponse: (success: boolean, token: string, user: any, message?: string) => {
    success: boolean;
    message: string;
    token: string;
    user: any;
};
/**
 * إنشاء استجابة بيانات مع تقسيم صفحات
 * @param data البيانات
 * @param page الصفحة الحالية
 * @param limit عدد العناصر في الصفحة
 * @param totalCount إجمالي عدد العناصر
 * @param message الرسالة
 * @returns كائن الاستجابة
 */
export declare const createPaginatedResponse: (data: any[], page: number, limit: number, totalCount: number, message?: string) => {
    success: boolean;
    message: string;
    count: number;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    data: any[];
};
//# sourceMappingURL=responseGenerator.d.ts.map