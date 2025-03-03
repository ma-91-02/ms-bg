import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// تحميل الإعدادات والخدمات
import connectDB from './config/database';
import setupAdmin from './config/setupAdmin';
import validateEnv from './config/validateEnv';
import { logger } from './services/loggerService';
import { applySecurityMiddleware } from './middleware/securityMiddleware';
import errorHandler from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './config/swagger';

// استيراد الراوترات
import mobileAuthRoutes from './routes/mobile/auth';
import mobileReportRoutes from './routes/mobile/reports';
import adminReportRoutes from './routes/admin/reports';

// التحقق من المتغيرات البيئية
validateEnv();

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3001;

// تطبيق ميدلويرات الأمان
applySecurityMiddleware(app);

// ميدلويرات أساسية
app.use(helmet()); // تحسينات أمنية
app.use(cors()); // السماح بطلبات CORS
app.use(express.json({ limit: '10kb' })); // تحليل JSON مع حد للحجم
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // تحليل URL encoded
app.use(morgan('dev')); // سجل HTTP
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // الملفات الثابتة
app.use(globalLimiter); // محدد معدل الطلبات العام

// إعداد Swagger
setupSwagger(app);

// تسجيل الراوترات
app.use('/api/mobile/auth', mobileAuthRoutes);
app.use('/api/mobile/reports', mobileReportRoutes);
app.use('/api/admin/reports', adminReportRoutes);

// التعامل مع المسارات غير الموجودة
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `لم يتم العثور على المسار: ${req.originalUrl}`
  });
});

// معالج الأخطاء المركزي - يجب أن يأتي بعد كل الراوترات
app.use(errorHandler);

// بدء الخادم
const startServer = async (): Promise<void> => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();
    logger.info('تم الاتصال بقاعدة البيانات بنجاح');
    
    // إعداد حساب المسؤول الافتراضي
    await setupAdmin();
    
    // تشغيل الخادم
    const server = app.listen(PORT, () => {
      logger.info(`الخادم يعمل على المنفذ ${PORT} في وضع ${process.env.NODE_ENV}`);
    });
    
    // التعامل مع إشارات الإيقاف لإغلاق الخادم بشكل آمن
    process.on('SIGTERM', () => {
      logger.info('تم استلام إشارة SIGTERM. إغلاق الخادم بأمان.');
      server.close(() => {
        logger.info('تم إغلاق الخادم.');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('فشل بدء الخادم:', error);
    process.exit(1);
  }
};

// التعامل مع الاستثناءات غير المعالجة
process.on('uncaughtException', (err: Error) => {
  logger.error('استثناء غير معالج:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('رفض غير معالج:', reason);
  process.exit(1);
});

// بدء التطبيق
startServer();

// تصدير التطبيق للاختبارات
export { app };