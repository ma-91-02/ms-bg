"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * معالج الأخطاء المركزي للتطبيق
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'حدث خطأ في الخادم';
    console.error(`🔴 خطأ: ${err.stack}`);
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map