"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurityMiddleware = exports.applySecurityMiddleware = exports.csrfProtection = void 0;
const helmet_1 = __importDefault(require("helmet"));
// @ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const rateLimiter_1 = require("./rateLimiter");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// منع هجمات تزوير الطلبات عبر المواقع (CSRF)
const csrfProtection = (req, res, next) => {
    // التحقق من أن المتصفح الذي يرسل الطلب هو نفسه الذي تم إصدار التوكن له
    const origin = req.headers.origin || '';
    const allowedOrigins = [
        'http://localhost:3000', // واجهة المستخدم المحلية
        'https://ms-bg.com' // موقع الإنتاج
    ];
    if (req.method !== 'GET' && !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            success: false,
            message: 'ممنوع الوصول: CSRF محتمل'
        });
    }
    next();
};
exports.csrfProtection = csrfProtection;
// تطبيق جميع ميدلويرات الأمان على التطبيق
const applySecurityMiddleware = (app) => {
    // إضافة رؤوس HTTP للحماية
    app.use((0, helmet_1.default)());
    // تنظيف البيانات المدخلة من XSS
    app.use((0, xss_clean_1.default)());
    // تنظيف البيانات لمنع حقن MongoDB
    app.use((0, express_mongo_sanitize_1.default)());
    // منع تلوث المعلمات (HPP)
    app.use((0, hpp_1.default)({
        whitelist: [
            'type',
            'category',
            'status',
            'documentType'
        ]
    }));
    // تطبيق حدود معدل الطلبات على مسارات معينة
    app.use('/api/mobile/auth/send-otp', rateLimiter_1.globalLimiter);
    app.use('/api/login', rateLimiter_1.globalLimiter);
};
exports.applySecurityMiddleware = applySecurityMiddleware;
const setupSecurityMiddleware = (app) => {
    // تكوين وسيط الخوذة للأمان
    app.use((0, helmet_1.default)());
    // استخدام وسيط تقييد التحميل
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 دقيقة
        max: 100, // حد الاتصالات لكل IP
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة لاحقًا'
        }
    }));
};
exports.setupSecurityMiddleware = setupSecurityMiddleware;
exports.default = {
    csrfProtection: exports.csrfProtection,
    applySecurityMiddleware: exports.applySecurityMiddleware
};
//# sourceMappingURL=securityMiddleware.js.map