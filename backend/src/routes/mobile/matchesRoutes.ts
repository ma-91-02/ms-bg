import express from 'express';
import * as matchesController from '../../controllers/mobile/matchesController';
import { protect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// جميع المسارات محمية
router.use(protect);

// الحصول على مطابقات المستخدم
router.get('/my-matches', matchesController.getUserMatches);

export default router; 