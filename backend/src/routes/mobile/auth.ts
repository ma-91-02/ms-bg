import express from 'express';
import { sendOTP, verifyOTP, completeProfile } from '../../controllers/mobile/authController';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';

const router = express.Router();

// راوترات المصادقة للهاتف المحمول
router.post('/send-otp', sendOTP);
/**
 * @swagger
 * /api/mobile/auth/verify-otp:
 *   post:
 *     summary: التحقق من رمز OTP
 *     tags: [المصادقة]
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
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم التحقق بنجاح
 *       401:
 *         description: رمز غير صحيح
 */
router.post('/verify-otp', verifyOTP);
router.patch('/complete-profile', protectMobile, completeProfile);

export default router; 