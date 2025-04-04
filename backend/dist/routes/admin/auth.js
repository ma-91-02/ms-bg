"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/admin/authController");
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const router = express_1.default.Router();
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
router.post('/', authController_1.login);
// مسار التحقق من التوكن (محمي بوسيط المصادقة)
router.get('/validate-token', authMiddleware_1.adminProtect, authController_1.validateToken);
exports.default = router;
//# sourceMappingURL=auth.js.map