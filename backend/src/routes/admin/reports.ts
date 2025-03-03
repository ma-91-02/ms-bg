import express from 'express';
import { getPendingReports, approveReport, rejectReport } from '../../controllers/admin/reportController';
import { authenticateToken } from '../../middleware/authenticateToken';

const router = express.Router();

// حماية جميع مسارات المسؤول
router.use(authenticateToken);

// راوترات إدارة التقارير
router.get('/pending', getPendingReports);
router.patch('/approve/:reportId', approveReport);
router.patch('/reject/:reportId', rejectReport);

export default router; 