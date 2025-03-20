import express from 'express';
import { login, validateToken } from '../../controllers/admin/authController';
import { adminProtect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// طباعة بالإنجليزية مباشرة
console.log('🔍 Registering admin login route: POST /');

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *               password:
 *                 type: string
 *                 description: Password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Login failed
 */
router.post('/', login);

// مسار التحقق من التوكن (محمي بوسيط المصادقة)
router.get('/validate-token', adminProtect, validateToken);

export default router; 