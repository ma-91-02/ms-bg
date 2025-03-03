/**
 * ميدلوير الأمان - يقوم بإضافة رؤوس HTTP للحماية من الهجمات الشائعة
 */

import { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// ميدلوير للحد من عدد الطلبات (Rate Limiting)
export const limiter = rateLimit({
  max: 100, // الحد الأقصى للطلبات
  windowMs: 60 * 1000, // 1 دقيقة
  message: {
    success: false,
    message: 'عدد كبير من الطلبات، يرجى المحاولة مرة أخرى بعد دقيقة'
  }
});

// منع هجمات تزوير الطلبات عبر المواقع (CSRF)
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void | Response => {
  // التحقق من أن المتصفح الذي يرسل الطلب هو نفسه الذي تم إصدار التوكن له
  const origin = req.headers.origin || '';
  const allowedOrigins: string[] = [
    'http://localhost:3000',  // واجهة المستخدم المحلية
    'https://yourdomain.com'  // موقع الإنتاج
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
  app.use('/api/mobile/auth/send-otp', limiter);
  app.use('/api/login', limiter);
}; 