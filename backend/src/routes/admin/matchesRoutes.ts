import express from 'express';
import * as matchesController from '../../controllers/admin/matchesController';
import { adminProtect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// جميع المسارات محمية
router.use(adminProtect);

// الحصول على المطابقات
router.get('/', matchesController.getAllMatches);
router.get('/pending', matchesController.getPendingMatches);

// الموافقة أو رفض المطابقات
router.put('/:id/approve', matchesController.approveMatch);
router.put('/:id/reject', matchesController.rejectMatch);

// إضافة مسار إنشاء المطابقات بشكل جماعي
router.post('/bulk-create', matchesController.bulkCreateMatches);

// إضافة مسارات الاختبار
router.get('/run-matching', matchesController.runMatchingForAll);
router.get('/run-matching/:advertisementId', matchesController.runMatchingForOne);

// إضافة مسار التنظيف
router.post('/cleanup-duplicates', matchesController.cleanupDuplicateMatches);

// إضافة مسار سجل المطابقات
router.get('/history', matchesController.getMatchHistory);

export default router; 