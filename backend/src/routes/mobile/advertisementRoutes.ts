import express from 'express';
import * as advertisementController from '../../controllers/mobile/advertisementController';
import { protect } from '../../middleware/common/authMiddleware';
import { uploadAdvertisementImages } from '../../services/common/fileUploadService';

const router = express.Router();

// مسارات عامة (بدون حماية)
router.get('/', advertisementController.getAdvertisements);
router.get('/constants', advertisementController.getConstants);

// مسارات محمية (تتطلب تسجيل الدخول)
router.use(protect);

// إدارة الإعلانات الشخصية
router.get('/user/my-advertisements', advertisementController.getUserAdvertisements);

// مسار التفاصيل بالمعرّف (يأتي بعد المسارات المحددة)
router.get('/:id', advertisementController.getAdvertisementById);

// إنشاء/تحديث/حذف إعلان
// وسيط مخصّص للإعلانات يحفظ في uploads/advertisements؛ الوسيط العام
// كان يحفظ في الجذر بينما يُسجَّل المسار على أنه في المجلد الفرعي
router.post('/', uploadAdvertisementImages, advertisementController.createAdvertisement);
router.put('/:id', uploadAdvertisementImages, advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);

// إدارة الصور
router.post('/:id/remove-image', advertisementController.removeImage);

// تحديث حالة الحل
router.put('/:id/resolve', advertisementController.markAsResolved);

export default router; 