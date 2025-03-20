import express from 'express';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead
} from '../../controllers/mobile/notificationController';
import { protectMobile } from '../../middleware/mobile/authMiddleware';

const router = express.Router();

// جميع المسارات تتطلب المصادقة
router.use(protectMobile);

// الحصول على إشعارات المستخدم
router.get('/', getUserNotifications);

// وضع علامة "مقروء" على جميع الإشعارات
router.patch('/mark-all-read', markAllAsRead);

// وضع علامة "مقروء" على إشعار معين
router.patch('/:notificationId/read', markAsRead);

export default router; 