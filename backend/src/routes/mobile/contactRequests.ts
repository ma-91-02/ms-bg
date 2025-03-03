import { Router } from 'express';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import * as contactRequestController from '../../controllers/mobile/contactRequestController';

const router = Router();

// جميع مسارات طلبات التواصل محمية وتتطلب تسجيل دخول
router.use(protectMobile);

// إنشاء طلب تواصل جديد
router.post('/', contactRequestController.createContactRequest);

// الحصول على طلبات التواصل للمستخدم الحالي (مرسلة أو مستلمة)
router.get('/', contactRequestController.getUserContactRequests);

// الحصول على تفاصيل طلب تواصل معين
router.get('/:requestId', contactRequestController.getContactRequestDetails);

// الموافقة على طلب تواصل
router.patch('/:requestId/approve', contactRequestController.approveContactRequest);

// رفض طلب تواصل
router.patch('/:requestId/reject', contactRequestController.rejectContactRequest);

export default router; 