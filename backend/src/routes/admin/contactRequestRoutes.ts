import express from 'express';
import * as contactRequestController from '../../controllers/admin/contactRequestController';
import { adminProtect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// جميع المسارات محمية
router.use(adminProtect);

// الحصول على طلبات التواصل
router.get('/', contactRequestController.getAllContactRequests);
router.get('/pending', contactRequestController.getPendingContactRequests);

// إدارة طلبات التواصل
router.put('/:id/approve', contactRequestController.approveContactRequest);
router.put('/:id/reject', contactRequestController.rejectContactRequest);

export default router; 