import { Router } from 'express';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import * as notificationController from '../../controllers/mobile/notificationController';

const router = Router();

// جميع مسارات الإشعارات محمية وتتطلب تسجيل دخول
router.use(protectMobile);

// الحصول على إشعارات المستخدم
router.get('/', notificationController.getUserNotifications);

// وضع علامة "مقروء" على جميع الإشعارات
router.patch('/read-all', notificationController.markAllAsRead);

// وضع علامة "مقروء" على إشعار معين
router.patch('/:notificationId/read', notificationController.markAsRead);

// حذف إشعار
router.delete('/:notificationId', notificationController.deleteNotification);

export default router; 