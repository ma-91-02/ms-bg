import express from 'express';
import * as authController from '../../controllers/mobile/authController';
import { protect } from '../../middleware/common/authMiddleware';
import { uploadProfileImage } from '../../services/common/fileUploadService';

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

// مسارات استعادة كلمة المرور - لا تتطلب مصادقة
router.post('/reset-password-request', (req, res, next) => {
  console.log('🚀 طلب إعادة تعيين كلمة المرور وصل');
  return authController.resetPasswordRequest(req, res);
});

router.post('/verify-reset-code', (req, res, next) => {
  console.log('🚀 طلب التحقق من رمز إعادة التعيين وصل');
  return authController.verifyResetCode(req, res);
});

router.post('/reset-password', (req, res, next) => {
  console.log('🚀 طلب تعيين كلمة مرور جديدة وصل');
  return authController.resetPassword(req, res);
});

// مسارات محمية تتطلب تسجيل الدخول
router.use(protect);
router.get('/profile', authController.getUserProfile);
router.put('/profile', authController.updateProfile);

// مسار رفع صورة الملف الشخصي
router.post('/upload-profile-image', uploadProfileImage, authController.uploadProfileImage);

console.log('✅ تم تسجيل مسارات المصادقة للجوال في ملف authRoutes.ts');

// تصدير الموجه
export default router; 