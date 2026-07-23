import dotenv from 'dotenv';

// تحميل متغيرات البيئة قبل أي استيراد يقرأها
dotenv.config();

import app from './app';
import validateEnv from './config/validateEnv';
import connectDB, { disconnectDatabase } from './config/database';
import setupAdmin from './config/setupAdmin';

/**
 * نقطة الإقلاع.
 *
 * ثلاثة فوارق عن النسخة السابقة:
 *  1. تركيب التطبيق كله انتقل إلى `app.ts` — لم يعد مسجَّلًا مرتين.
 *  2. فشل الاتصال بقاعدة البيانات كان يُطبَع ثم يواصل الخادم العمل بلا
 *     قاعدة بيانات؛ الآن يوقف الإقلاع بمخرج غير صفري.
 *  3. إنشاء المشرف الافتراضي انتقل إلى `setupAdmin` بدل تكراره هنا.
 */
const bootstrap = async (): Promise<void> => {
  const env = validateEnv();

  await connectDB();
  await setupAdmin();

  const server = app.listen(env.PORT, () => {
    console.log(`✅ الخادم يعمل على المنفذ ${env.PORT} (${env.NODE_ENV})`);
  });

  // إغلاق نظيف حتى لا تبقى اتصالات Postgres معلّقة
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} — جارٍ الإغلاق...`);
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((error) => {
    console.error('❌ فشل إقلاع الخادم:', error);
    process.exit(1);
  });
}

// تصدير app لاستخدامه في الاختبارات
export default app;
