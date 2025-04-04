"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResponse = exports.createAuthResponse = exports.sendError = exports.sendSuccess = void 0;
/**
 * إرسال استجابة نجاح
 * @param res كائن الاستجابة
 * @param data البيانات المراد إرسالها
 * @param message رسالة النجاح
 * @param statusCode رمز الحالة (200 افتراضياً)
 */
const sendSuccess = (res, data = null, message = 'تمت العملية بنجاح', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
/**
 * إرسال استجابة خطأ
 * @param res كائن الاستجابة
 * @param message رسالة الخطأ
 * @param statusCode رمز الحالة (400 افتراضياً)
 * @param error كائن الخطأ (اختياري)
 */
const sendError = (res, message = 'حدث خطأ', statusCode = 400, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    });
};
exports.sendError = sendError;
/**
 * إنشاء استجابة توثيق
 * @param success حالة النجاح
 * @param token رمز التوثيق
 * @param user بيانات المستخدم
 * @param message الرسالة
 * @returns كائن الاستجابة
 */
const createAuthResponse = (success, token, user, message = 'تم تسجيل الدخول بنجاح') => {
    return {
        success,
        message,
        token,
        user
    };
};
exports.createAuthResponse = createAuthResponse;
/**
 * إنشاء استجابة بيانات مع تقسيم صفحات
 * @param data البيانات
 * @param page الصفحة الحالية
 * @param limit عدد العناصر في الصفحة
 * @param totalCount إجمالي عدد العناصر
 * @param message الرسالة
 * @returns كائن الاستجابة
 */
const createPaginatedResponse = (data, page, limit, totalCount, message = 'تم جلب البيانات بنجاح') => {
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
exports.createPaginatedResponse = createPaginatedResponse;
//# sourceMappingURL=responseGenerator.js.map