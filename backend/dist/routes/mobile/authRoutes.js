"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../../controllers/mobile/authController"));
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const fileUploadService_1 = require("../../services/common/fileUploadService");
// إنشاء موجه express
const router = express_1.default.Router();
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
router.use(authMiddleware_1.protect);
router.get('/profile', authController.getUserProfile);
router.put('/profile', authController.updateProfile);
// مسار رفع صورة الملف الشخصي
router.post('/upload-profile-image', fileUploadService_1.uploadProfileImage, authController.uploadProfileImage);
console.log('✅ تم تسجيل مسارات المصادقة للجوال في ملف authRoutes.ts');
// تصدير الموجه
exports.default = router;
//# sourceMappingURL=authRoutes.js.map