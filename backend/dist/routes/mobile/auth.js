"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/mobile/authController");
const mobileAuthMiddleware_1 = require("../../middleware/mobileAuthMiddleware");
const router = express_1.default.Router();
// راوترات المصادقة للهاتف المحمول
router.post('/send-otp', authController_1.sendOTP);
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
router.post('/verify-otp', authController_1.verifyOTP);
router.patch('/complete-profile', mobileAuthMiddleware_1.protectMobile, authController_1.completeProfile);
exports.default = router;
