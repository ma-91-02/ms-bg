import express from 'express';
import * as contactRequestController from '../../controllers/mobile/contactRequestController';
import { protect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// جميع المسارات محمية
router.use(protect);

// إنشاء طلب تواصل
router.post('/', contactRequestController.createContactRequest);

// الحصول على طلبات التواصل الخاصة بالمستخدم
router.get('/my-requests', contactRequestController.getUserContactRequests);

// الحصول على معلومات التواصل (إذا تمت الموافقة على الطلب)
router.get('/:requestId/contact-info', contactRequestController.getContactInfo);

export default router; 