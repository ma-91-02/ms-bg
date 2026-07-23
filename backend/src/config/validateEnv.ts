import { cleanEnv, str, port, num, bool } from 'envalid';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

/**
 * التحقق من متغيرات البيئة المطلوبة
 * يرمي استثناء في حالة عدم وجود متغير بيئي مطلوب أو كان بصيغة غير صحيحة
 */
export const validateEnv = () => {
  const env = cleanEnv(process.env, {
    // إعدادات الخادم
    PORT: port({ default: 3001 }),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),

    // قاعدة البيانات — PostgreSQL عبر Prisma
    DATABASE_URL: str(),

    // المصادقة — إلزامي بلا قيمة احتياطية
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '30d' }),

    // حساب المسؤول الافتراضي
    ADMIN_USERNAME: str({ default: 'admin' }),
    ADMIN_PASSWORD: str(),
    ADMIN_EMAIL: str({ default: 'admin@example.com' }),

    // وضع الديمو — كان ثابتًا في الكود (isDemoMode = true)، صار متغير بيئة
    DEMO_MODE: bool({ default: false }),

    /**
     * هل يُشترط التحقق برمز OTP للتسجيل والدخول؟
     *
     * إيقافه يتيح الإطلاق قبل ربط مزوّد رسائل، لكنه يعني أن أرقام
     * الهواتف غير مُتحقَّق منها: يستطيع أي شخص التسجيل برقم غيره.
     * ما يحدّ الأثر أن كشف بيانات التواصل يمرّ بموافقة الإدارة أصلًا.
     */
    OTP_REQUIRED: bool({ default: true }),

    // خدمة الرسائل (Twilio - للإنتاج)
    TWILIO_ACCOUNT_SID: str({ default: undefined }),
    TWILIO_AUTH_TOKEN: str({ default: undefined }),
    TWILIO_PHONE_NUMBER: str({ default: undefined }),

    // إعدادات التطبيق
    MAX_FILE_SIZE: num({ default: 5242880 }), // 5 ميجابايت بالبايت
    MAX_IMAGES_PER_REPORT: num({ default: 5 }),

    ENABLE_OTP_VERIFICATION: bool({ default: true }),

    // CORS
    CORS_ORIGINS: str({ default: 'http://localhost:3000' }),
  });

  // حارس: وضع الديمو يفتح الحساب لأي رقم بالرمز 000000 — ممنوع في الإنتاج
  if (env.NODE_ENV === 'production' && env.DEMO_MODE) {
    throw new Error(
      'DEMO_MODE=true غير مسموح مع NODE_ENV=production — يسمح بالدخول لأي رقم هاتف بالرمز 000000'
    );
  }

  if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET يجب أن يكون 32 حرفًا على الأقل في الإنتاج');
  }

  return env;
};

export default validateEnv;
