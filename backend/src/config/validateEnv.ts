import { cleanEnv, str, port, num, bool } from 'envalid';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

/**
 * التحقق من متغيرات البيئة المطلوبة
 * يرمي استثناء في حالة عدم وجود متغير بيئي مطلوب أو كان بصيغة غير صحيحة
 */
export const validateEnv = () => {
  return cleanEnv(process.env, {
    // إعدادات الخادم
    PORT: port({ default: 3001 }),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    
    // قاعدة البيانات
    MONGODB_URI: str(),
    
    // المصادقة
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '30d' }),
    
    // حساب المسؤول الافتراضي
    ADMIN_USERNAME: str({ default: 'admin' }),
    ADMIN_PASSWORD: str(),
    
    // خدمة الرسائل (Twilio - للإنتاج)
    TWILIO_ACCOUNT_SID: str({ default: undefined }),
    TWILIO_AUTH_TOKEN: str({ default: undefined }),
    TWILIO_PHONE_NUMBER: str({ default: undefined }),
    
    // إعدادات التطبيق
    MAX_FILE_SIZE: num({ default: 5242880 }), // 5 ميجابايت بالبايت
    MAX_IMAGES_PER_REPORT: num({ default: 5 }),
    
    // التحقق من رمز OTP مفعل أم لا (للتطوير يمكن إيقافه)
    ENABLE_OTP_VERIFICATION: bool({ default: true }),
  });
};

export default validateEnv; 