import express from 'express';
import * as authController from '../../controllers/mobile/authController';
import { protect } from '../../middleware/common/authMiddleware';
import { uploadProfileImage } from '../../services/common/fileUploadService';

const router = express.Router();

// --- عامة ---

/** يقرأه التطبيق عند الإقلاع ليعرف أي شاشات مصادقة يعرض */
router.get('/config', authController.getAuthConfig);

/** تسجيل مباشر بلا رمز — لا يعمل إلا حين OTP_REQUIRED=false */
router.post('/register', authController.register);

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);

// استعادة كلمة المرور
router.post('/reset-password-request', authController.resetPasswordRequest);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

// --- محمية ---
router.use(protect);

// إكمال التسجيل يلي التحقق بالرمز، فيحتاج التوكن الصادر عنه
router.post('/complete-registration', authController.completeRegistration);

router.get('/profile', authController.getUserProfile);
router.put('/profile', authController.updateProfile);
router.post('/upload-profile-image', uploadProfileImage, authController.uploadProfileImage);

export default router;
