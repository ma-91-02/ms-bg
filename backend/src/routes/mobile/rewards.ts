import { Router } from 'express';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import * as rewardController from '../../controllers/mobile/rewardController';

const router = Router();

// جميع مسارات المكافآت محمية وتتطلب تسجيل دخول
router.use(protectMobile);

// الحصول على رصيد النقاط وسجل المعاملات
router.get('/points', rewardController.getUserPoints);

// الحصول على سجل نقاط المستخدم
router.get('/history', rewardController.getPointsHistory);

// الحصول على قائمة المكافآت المتاحة
router.get('/available', rewardController.getAvailableRewards);

// استبدال نقاط بمكافأة
router.post('/redeem', rewardController.redeemPoints);

export default router; 