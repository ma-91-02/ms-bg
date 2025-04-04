import express from 'express';
import { login } from '../../controllers/admin/authController';

// إنشاء موجه express
const router = express.Router();

// مسارات المصادقة للأدمن
router.post('/', login);

export default router; 