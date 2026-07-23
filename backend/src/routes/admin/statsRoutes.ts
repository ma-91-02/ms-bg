import express from 'express';
import { adminProtect } from '../../middleware/common/authMiddleware';
import {
  getTimelineStats,
  getRecentActivity,
  getActiveUsers,
} from '../../controllers/admin/dashboardController';

/**
 * مسارات إحصائية تستدعيها اللوحة خارج بادئة `/dashboard`.
 *
 * المسارات مكتوبة بالضبط كما تطلبها الواجهة بدل تعديلها، لأن أي تغيير
 * في العناوين يستلزم إعادة بناء اللوحة ونشرها.
 */
const router = express.Router();

router.use(adminProtect);

// GET /api/admin/stats/timeline?period=week|month|year
router.get('/stats/timeline', getTimelineStats);

// GET /api/admin/activity?limit=10
router.get('/activity', getRecentActivity);

// GET /api/admin/users/active?limit=5
router.get('/users/active', getActiveUsers);

export default router;
