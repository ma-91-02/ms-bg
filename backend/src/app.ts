import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import router from './routes';
import errorHandler from './middleware/common/errorHandler';
import { setupSecurityMiddleware } from './middleware/common/securityMiddleware';

/**
 * بناء تطبيق Express.
 *
 * كان هذا الملف يسجّل بعض المسارات، ثم يستورده `index.ts` ويسجّل عليه
 * `router` كاملًا مرة أخرى — فينتهي الأمر بـ `express.json()` و`cors()`
 * مسجَّلين مرتين، و`/api/mobile/auth` مسجَّلًا مرتين بمعالجَين مختلفين.
 * كل التركيب صار هنا في مكان واحد، و`index.ts` صار للإقلاع فقط.
 */
const app = express();

// CORS بقائمة نطاقات محددة بدل السماح للجميع
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // السماح للطلبات بلا origin (تطبيق الجوال، أدوات الاختبار)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('غير مسموح بواسطة CORS'));
    },
    credentials: true,
  })
);

setupSecurityMiddleware(app);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// الملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// فحص الصحة — يفيد في مراقبة الحاويات
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// كل المسارات مسجَّلة في مكان واحد
app.use(router);

// معالج الأخطاء يأتي أخيرًا دائمًا
app.use(errorHandler);

export default app;
