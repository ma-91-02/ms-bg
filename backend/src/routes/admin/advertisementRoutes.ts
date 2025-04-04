import express from 'express';
import * as advertisementController from '../../controllers/admin/advertisementController';
import { adminProtect } from '../../middleware/common/authMiddleware';
import { uploadMiddleware } from '../../middleware/common/uploadMiddleware';

const router = express.Router();

// جميع مسارات المشرف محمية
router.use(adminProtect);

// الحصول على الإعلانات
router.get('/', advertisementController.getAllAdvertisements);
router.get('/pending', advertisementController.getPendingAdvertisements);
router.get('/:id', advertisementController.getAdvertisementById);

// إدارة الإعلانات
router.put('/:id', uploadMiddleware.array('images', 5), advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);

// تغيير حالة الإعلان
router.put('/:id/approve', advertisementController.approveAdvertisement);
router.put('/:id/reject', advertisementController.rejectAdvertisement);
router.put('/:id/resolve', advertisementController.markAsResolved);

// إضافة مسار جديد
router.get('/status/:status', advertisementController.getAdvertisementsByStatus);

export default router; 