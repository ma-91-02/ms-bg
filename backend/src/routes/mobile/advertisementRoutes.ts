import express from 'express';
import * as advertisementController from '../../controllers/mobile/advertisementController';
import { protect } from '../../middleware/common/authMiddleware';
import { uploadAdvertisementImages } from '../../services/common/fileUploadService';

const router = express.Router();

// مسارات عامة (بدون حماية).
//
// تصفّح الإعلانات وتفاصيلها متاح للزائر: التطبيق منصّة بلاغات
// مفقودات، وحجب التفاصيل عن غير المسجّل يقتل الغرض — من يبحث عن
// مستمسكه يجب أن يراه دون حساب. الحساب لا يلزم إلا للتواصل والنشر.
//
// كان `GET /:id` تحت `router.use(protect)` فيُرجع 401 للزائر، بينما
// القائمة `GET /` عامة — تناقض يعرض «موجود · جواز سفر» في القائمة ثم
// «غير مصرّح به» عند فتحه. المسار الديناميكي يأتي أخيرًا بين العامة
// كي لا يبتلع `/constants` و`/user/...`.
router.get('/', advertisementController.getAdvertisements);
router.get('/constants', advertisementController.getConstants);
router.get('/:id', advertisementController.getAdvertisementById);

// مسارات محمية (تتطلب تسجيل الدخول)
router.use(protect);

// إدارة الإعلانات الشخصية
router.get('/user/my-advertisements', advertisementController.getUserAdvertisements);

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