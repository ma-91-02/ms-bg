import express from 'express';
import { 
  createAdvertisement, 
  getAdvertisements, 
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  getUserAdvertisements,
  markAsResolved
} from '../../controllers/mobile/advertisementController';
import { protectMobile } from '../../middleware/mobile/authMiddleware';
import { upload } from '../../services/common/fileUploadService';

const router = express.Router();

// مسارات الإعلانات
router.post('/', protectMobile, upload.array('images', 5), createAdvertisement);
router.get('/', getAdvertisements);
router.get('/user', protectMobile, getUserAdvertisements);
router.get('/:id', getAdvertisementById);
router.put('/:id', protectMobile, upload.array('images', 5), updateAdvertisement);
router.delete('/:id', protectMobile, deleteAdvertisement);
router.patch('/:id/resolve', protectMobile, markAsResolved);

export default router; 