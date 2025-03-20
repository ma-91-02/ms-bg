import express from 'express';
import * as authController from '../../controllers/mobile/authController';
import { protect } from '../../middleware/common/authMiddleware';

// إنشاء موجه express
const router = express.Router();

// طباعة لتتبع تسجيل المسارات
console.log('📝 تسجيل مسارات المصادقة للجوال في ملف authRoutes.ts');

// مسارات المصادقة الأساسية - بدون صوت ال /api/mobile/auth
router.post('/send-otp', (req, res, next) => {
  console.log('🚀 طلب إرسال OTP وصل');
  return authController.sendOTP(req, res);
});

router.post('/verify-otp', (req, res, next) => {
  console.log('🚀 طلب التحقق من OTP وصل');
  return authController.verifyOtp(req, res);
});

router.post('/complete-registration', authController.completeRegistration);
router.post('/login', authController.login);

// مسارات محمية تتطلب تسجيل الدخول
router.use(protect);
router.get('/profile', authController.getUserProfile);
router.put('/profile', authController.completeProfile);

console.log('✅ تم تسجيل مسارات المصادقة للجوال في ملف authRoutes.ts');

// تصدير الموجه
export default router; 