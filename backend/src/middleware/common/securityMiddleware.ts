import { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
// @ts-ignore
import xssClean from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { globalLimiter } from './rateLimiter';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

// منع هجمات تزوير الطلبات عبر المواقع (CSRF)
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void | Response => {
  // التحقق من أن المتصفح الذي يرسل الطلب هو نفسه الذي تم إصدار التوكن له
  const origin = req.headers.origin || '';
  const allowedOrigins: string[] = [
    'http://localhost:3000',  // واجهة المستخدم المحلية
    'https://ms-bg.com'  // موقع الإنتاج
  ];

  if (req.method !== 'GET' && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'ممنوع الوصول: CSRF محتمل'
    });
  }
  
  next();
};

// تطبيق جميع ميدلويرات الأمان على التطبيق
export const applySecurityMiddleware = (app: Application): void => {
  // إضافة رؤوس HTTP للحماية
  app.use(helmet());
  
  // تنظيف البيانات المدخلة من XSS
  app.use(xssClean());
  
  // تنظيف البيانات لمنع حقن MongoDB
  app.use(mongoSanitize());
  
  // منع تلوث المعلمات (HPP)
  app.use(hpp({
    whitelist: [
      'type',
      'category',
      'status',
      'documentType'
    ]
  }));
  
  // تطبيق حدود معدل الطلبات على مسارات معينة
  app.use('/api/mobile/auth/send-otp', globalLimiter);
  app.use('/api/login', globalLimiter);
};

export const setupSecurityMiddleware = (app: Express) => {
  // تكوين وسيط الخوذة للأمان
  app.use(helmet());
  
  // استخدام وسيط تقييد التحميل
  app.use(rateLimit({
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

export default {
  csrfProtection,
  applySecurityMiddleware
}; 