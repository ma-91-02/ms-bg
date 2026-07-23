import express from 'express';
import * as favoriteController from '../../controllers/mobile/favoriteController';
import { protect } from '../../middleware/common/authMiddleware';

/**
 * المفضلة.
 *
 * كانت هذه المسارات معطّلة بتعليق داخل `adRoutes.ts`، و`adRoutes` نفسه
 * غير مسجَّل في `routes/index.ts` — أي أن متحكم المفضلة كان يعمل بلا
 * أي مسار يصل إليه. أُخرجت إلى ملف مستقل ومُسجَّلة فعليًا.
 */
const router = express.Router();

router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/:adId', favoriteController.addToFavorites);
router.delete('/:adId', favoriteController.removeFromFavorites);

export default router;
