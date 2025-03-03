import express from 'express';
import { createReport, getUserReports, searchReports, uploadReportImages } from '../../controllers/mobile/reportController';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import { upload } from '../../middleware/uploadMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/mobile/reports:
 *   post:
 *     summary: إنشاء تقرير جديد
 *     tags: [التقارير]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [lost, found]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               # ... باقي الحقول
 *     responses:
 *       201:
 *         description: تم إنشاء التقرير
 *       401:
 *         description: غير مصرح
 */
router.post('/', protectMobile, createReport);

// راوتر لرفع الصور للتقرير (يدعم رفع 5 صور كحد أقصى)
router.post('/:reportId/images', protectMobile, upload.array('images', 5), uploadReportImages);

router.get('/my-reports', protectMobile, getUserReports);
router.get('/search', searchReports);

export default router; 