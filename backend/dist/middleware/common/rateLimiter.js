"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.otpLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * محدد معدل الطلبات العام
 */
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // الحد الأقصى 100 طلب لكل IP
    standardHeaders: true,
    message: {
        success: false,
        message: 'عدد كبير جدًا من الطلبات، يرجى المحاولة مرة أخرى بعد فترة'
    }
});
/**
 * محدد معدل الطلبات للمصادقة
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // 5 محاولات كحد أقصى
    message: {
        success: false,
        message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة'
    },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * محدد معدل طلبات OTP
 */
exports.otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    max: 3, // الحد الأقصى 3 طلبات لكل IP
    standardHeaders: true,
    message: {
        success: false,
        message: 'لقد طلبت رمز تحقق كثيرًا، يرجى المحاولة مرة أخرى بعد ساعة'
    }
});
// وسيط تقييد طلبات API العامة
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 دقيقة
    max: 30, // 30 طلب كحد أقصى
    message: {
        success: false,
        message: 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة بعد دقيقة'
    },
    standardHeaders: true,
    legacyHeaders: false
});
exports.default = {
    globalLimiter: exports.globalLimiter,
    authLimiter: exports.authLimiter,
    otpLimiter: exports.otpLimiter,
    apiLimiter: exports.apiLimiter
};
//# sourceMappingURL=rateLimiter.js.map