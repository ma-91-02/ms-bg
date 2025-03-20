import express from 'express';
import { adminProtect } from '../../middleware/common/authMiddleware';
import { getDashboardStats } from '../../controllers/admin/dashboardController';

const router = express.Router();

// حماية جميع المسارات
router.use(adminProtect);

// مسار الإحصائيات
router.get('/stats', getDashboardStats);

export default router; 