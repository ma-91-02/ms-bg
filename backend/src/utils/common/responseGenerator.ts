import { Response } from 'express';

/**
 * إرسال استجابة نجاح
 * @param res كائن الاستجابة
 * @param data البيانات المراد إرسالها
 * @param message رسالة النجاح
 * @param statusCode رمز الحالة (200 افتراضياً)
 */
export const sendSuccess = (
  res: Response, 
  data: any = null, 
  message: string = 'تمت العملية بنجاح',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * إرسال استجابة خطأ
 * @param res كائن الاستجابة
 * @param message رسالة الخطأ
 * @param statusCode رمز الحالة (400 افتراضياً)
 * @param error كائن الخطأ (اختياري)
 */
export const sendError = (
  res: Response, 
  message: string = 'حدث خطأ', 
  statusCode: number = 400, 
  error: any = null
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
};

/**
 * إنشاء استجابة توثيق
 * @param success حالة النجاح
 * @param token رمز التوثيق
 * @param user بيانات المستخدم
 * @param message الرسالة
 * @returns كائن الاستجابة
 */
export const createAuthResponse = (success: boolean, token: string, user: any, message: string = 'تم تسجيل الدخول بنجاح') => {
  return {
    success,
    message,
    token,
    user
  };
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
export const createPaginatedResponse = (data: any[], page: number, limit: number, totalCount: number, message: string = 'تم جلب البيانات بنجاح') => {
  return {
    success: true,
    message,
    count: data.length,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    data
  };
}; 