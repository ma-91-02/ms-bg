"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const envalid_1 = require("envalid");
const dotenv_1 = __importDefault(require("dotenv"));
// تحميل متغيرات البيئة من ملف .env
dotenv_1.default.config();
/**
 * التحقق من متغيرات البيئة المطلوبة
 * يرمي استثناء في حالة عدم وجود متغير بيئي مطلوب أو كان بصيغة غير صحيحة
 */
const validateEnv = () => {
    return (0, envalid_1.cleanEnv)(process.env, {
        // إعدادات الخادم
        PORT: (0, envalid_1.port)({ default: 3001 }),
        NODE_ENV: (0, envalid_1.str)({ choices: ['development', 'production', 'test'], default: 'development' }),
        // قاعدة البيانات
        MONGODB_URI: (0, envalid_1.str)(),
        // المصادقة
        JWT_SECRET: (0, envalid_1.str)(),
        JWT_EXPIRES_IN: (0, envalid_1.str)({ default: '30d' }),
        // حساب المسؤول الافتراضي
        ADMIN_USERNAME: (0, envalid_1.str)({ default: 'admin' }),
        ADMIN_PASSWORD: (0, envalid_1.str)(),
        // خدمة الرسائل (Twilio - للإنتاج)
        TWILIO_ACCOUNT_SID: (0, envalid_1.str)({ default: undefined }),
        TWILIO_AUTH_TOKEN: (0, envalid_1.str)({ default: undefined }),
        TWILIO_PHONE_NUMBER: (0, envalid_1.str)({ default: undefined }),
        // إعدادات التطبيق
        MAX_FILE_SIZE: (0, envalid_1.num)({ default: 5242880 }), // 5 ميجابايت بالبايت
        MAX_IMAGES_PER_REPORT: (0, envalid_1.num)({ default: 5 }),
        // التحقق من رمز OTP مفعل أم لا (للتطوير يمكن إيقافه)
        ENABLE_OTP_VERIFICATION: (0, envalid_1.bool)({ default: true }),
    });
};
exports.validateEnv = validateEnv;
exports.default = exports.validateEnv;
//# sourceMappingURL=validateEnv.js.map