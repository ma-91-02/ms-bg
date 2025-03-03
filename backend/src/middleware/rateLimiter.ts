import rateLimit from 'express-rate-limit';

/**
 * محدد معدل الطلبات العام
 */
export const globalLimiter = rateLimit({
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
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 5, // الحد الأقصى 5 محاولات فاشلة لكل IP
  standardHeaders: true,
  message: {
    success: false,
    message: 'عدد كبير من محاولات المصادقة الفاشلة، يرجى المحاولة مرة أخرى بعد ساعة'
  },
  // تطبيق الحد فقط على الطلبات الفاشلة
  skipSuccessfulRequests: true
});

/**
 * محدد معدل طلبات OTP
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // الحد الأقصى 3 طلبات لكل IP
  standardHeaders: true,
  message: {
    success: false,
    message: 'لقد طلبت رمز تحقق كثيرًا، يرجى المحاولة مرة أخرى بعد ساعة'
  }
});

export default {
  globalLimiter,
  authLimiter,
  otpLimiter
}; 