/**
 * محدد معدل الطلبات العام
 */
export declare const globalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * محدد معدل الطلبات للمصادقة
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * محدد معدل طلبات OTP
 */
export declare const otpLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
declare const _default: {
    globalLimiter: import("express-rate-limit").RateLimitRequestHandler;
    authLimiter: import("express-rate-limit").RateLimitRequestHandler;
    otpLimiter: import("express-rate-limit").RateLimitRequestHandler;
    apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
};
export default _default;
//# sourceMappingURL=rateLimiter.d.ts.map