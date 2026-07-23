import { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
// @ts-ignore
import xssClean from 'xss-clean';
import hpp from 'hpp';
import { globalLimiter } from './rateLimiter';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * `express-mongo-sanitize` أُزيل مع MongoDB.
 *
 * لم يُستبدل بشيء عمدًا: حقن NoSQL كان ممكنًا لأن كائنات الاستعلام تُبنى
 * من مدخلات المستخدم مباشرة. استعلامات Prisma مُعلَّمة (parameterized)
 * على مستوى بروتوكول Postgres، فلا يمكن لقيمة أن تصير عاملًا في الاستعلام.
 */

// منع هجمات تزوير الطلبات عبر المواقع (CSRF)
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const origin = req.headers.origin || '';
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (req.method !== 'GET' && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'ممنوع الوصول: CSRF محتمل',
    });
  }

  next();
};

// تطبيق جميع ميدلويرات الأمان على التطبيق
export const applySecurityMiddleware = (app: Application): void => {
  app.use(helmet());
  app.use(xssClean());

  app.use(
    hpp({
      whitelist: ['type', 'category', 'status', 'documentType'],
    })
  );

  app.use('/api/mobile/auth/send-otp', globalLimiter);
  app.use('/api/login', globalLimiter);
};

export const setupSecurityMiddleware = (app: Express) => {
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 100, // حد الاتصالات لكل IP
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة لاحقًا',
      },
    })
  );
};

export default {
  csrfProtection,
  applySecurityMiddleware,
};
