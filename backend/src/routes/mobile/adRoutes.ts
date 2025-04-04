import express from 'express';
import { protect } from '../../middleware/auth';
import * as advertisementController from '../../controllers/mobile/advertisementController';

const router = express.Router();

// تطبيق حماية المصادقة على جميع المسارات
router.use(protect);

// مسارات الإعلانات
router.get('/', advertisementController.getAdvertisements);
router.get('/:id', advertisementController.getAdvertisementById);
router.post('/', advertisementController.createAdvertisement);
router.put('/:id', advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);
router.get('/user/ads', advertisementController.getUserAdvertisements);

// إزالة مسارات المفضلة
// router.get('/favorites', favoriteController.getFavorites);
// router.post('/favorites/:adId', favoriteController.addToFavorites);
// router.delete('/favorites/:adId', favoriteController.removeFromFavorites);

console.log('✅ تم تسجيل مسارات الإعلانات للجوال في ملف adRoutes.ts');

export default router; 