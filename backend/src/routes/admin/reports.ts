import express from 'express';
import { getPendingReports, approveReport, rejectReport } from '../../controllers/admin/reportController';
import { authenticateToken } from '../../middleware/authenticateToken';

const router = express.Router();

// جميع المسارات محمية بمصادقة المسؤول
router.use(authenticateToken);

/**
 * @swagger
 * /api/admin/reports/pending:
 *   get:
 *     summary: الحصول على التقارير المعلقة
 *     tags: [تقارير الإدارة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: عدد النتائج في الصفحة
 *     responses:
 *       200:
 *         description: تم استرجاع التقارير المعلقة بنجاح
 *       401:
 *         description: غير مصرح به
 */
router.get('/pending', getPendingReports);

/**
 * @swagger
 * /api/admin/reports/approve/{reportId}:
 *   patch:
 *     summary: الموافقة على تقرير
 *     tags: [تقارير الإدارة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التقرير
 *     responses:
 *       200:
 *         description: تمت الموافقة على التقرير بنجاح
 *       401:
 *         description: غير مصرح به
 *       404:
 *         description: لم يتم العثور على التقرير
 */
router.patch('/approve/:reportId', approveReport);

/**
 * @swagger
 * /api/admin/reports/reject/{reportId}:
 *   patch:
 *     summary: رفض تقرير
 *     tags: [تقارير الإدارة]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التقرير
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: سبب الرفض
 *     responses:
 *       200:
 *         description: تم رفض التقرير بنجاح
 *       401:
 *         description: غير مصرح به
 *       404:
 *         description: لم يتم العثور على التقرير
 */
router.patch('/reject/:reportId', rejectReport);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router; 