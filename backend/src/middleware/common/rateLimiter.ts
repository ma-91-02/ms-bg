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
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // الحد الأقصى 3 طلبات لكل IP
  standardHeaders: true,
  message: {
    success: false,
    message: 'لقد طلبت رمز تحقق كثيرًا، يرجى المحاولة مرة أخرى بعد ساعة'
  }
});

// وسيط تقييد طلبات API العامة
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 30, // 30 طلب كحد أقصى
  message: {
    success: false,
    message: 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة بعد دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  globalLimiter,
  authLimiter,
  otpLimiter,
  apiLimiter
}; 