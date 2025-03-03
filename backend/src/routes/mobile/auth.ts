import express from 'express';
import { sendOTP, verifyOTP, completeProfile, login } from '../../controllers/mobile/authController';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import { otpLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

/**
 * @swagger
 * /api/mobile/auth/send-otp:
 *   post:
 *     summary: إرسال رمز OTP إلى المستخدم
 *     tags: [مصادقة الجوال]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: رقم الهاتف بتنسيق دولي (+20XXXXXXXXX)
 *     responses:
 *       200:
 *         description: تم إرسال رمز OTP بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم إرسال رمز التحقق بنجاح
 *       400:
 *         description: خطأ في طلب البيانات
 *       429:
 *         description: تجاوز الحد المسموح من المحاولات
 */
router.post('/send-otp', otpLimiter, sendOTP);

/**
 * @swagger
 * /api/mobile/auth/verify-otp:
 *   post:
 *     summary: التحقق من رمز OTP وإنشاء توكن المصادقة
 *     tags: [مصادقة الجوال]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: رقم الهاتف بتنسيق دولي (+20XXXXXXXXX)
 *               otp:
 *                 type: string
 *                 description: رمز التحقق المكون من 6 أرقام
 *     responses:
 *       200:
 *         description: تم التحقق بنجاح وإنشاء التوكن
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الدخول بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     isProfileComplete:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: خطأ في طلب البيانات
 *       401:
 *         description: رمز التحقق غير صحيح أو منتهي الصلاحية
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/mobile/auth/complete-profile:
 *   patch:
 *     summary: إكمال ملف تعريف المستخدم
 *     tags: [مصادقة الجوال]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - userType
 *               - idNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: الاسم الكامل للمستخدم
 *               userType:
 *                 type: string
 *                 enum: [seeker, finder]
 *                 description: نوع المستخدم (باحث عن مفقودات أو عاثر على مفقودات)
 *               idNumber:
 *                 type: string
 *                 description: رقم الهوية
 *     responses:
 *       200:
 *         description: تم تحديث الملف الشخصي بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تحديث الملف الشخصي بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: خطأ في طلب البيانات
 *       401:
 *         description: غير مصرح به
 */
router.post('/complete-registration', protectMobile, completeProfile);

/**
 * @swagger
 * /api/mobile/auth/login:
 *   post:
 *     summary: تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور
 *     tags: [مصادقة الجوال]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: رقم الهاتف بتنسيق دولي (+20XXXXXXXXX)
 *               password:
 *                 type: string
 *                 description: كلمة المرور
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الدخول بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *       400:
 *         description: خطأ في طلب البيانات
 *       401:
 *         description: كلمة المرور غير صحيحة
 *       404:
 *         description: المستخدم غير موجود
 */
router.post('/login', login);

export default router; 