import express, { Router } from 'express';
import { createReport, getUserReports, searchReports, uploadReportImages } from '../../controllers/mobile/documentController';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import multer from 'multer';
import path from 'path';
import * as reportController from '../../controllers/mobile/reportController';
import * as uploadMiddleware from '../../middleware/uploadMiddleware';

const router = Router();

// إعداد تخزين الصور باستخدام multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: Number(process.env.MAX_FILE_SIZE || 5242880) 
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("فقط ملفات الصور مسموح بها (jpg, jpeg, png)"));
  }
});

// حماية جميع مسارات التقارير باستثناء مسارات العرض العامة
router.use(protectMobile);

/**
 * @swagger
 * /api/mobile/reports:
 *   post:
 *     summary: إنشاء تقرير جديد
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *               - category
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
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     default: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم إنشاء التقرير بنجاح
 *       401:
 *         description: غير مصرح به
 *       500:
 *         description: خطأ في الخادم
 */
router.post('/', uploadMiddleware.uploadReportImages, reportController.createReport);

/**
 * @swagger
 * /api/mobile/reports/images/{reportId}:
 *   post:
 *     summary: رفع صور للتقرير
 *     tags: [تقارير الجوال]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: الصور المراد رفعها (بحد أقصى 5 صور)
 *     responses:
 *       200:
 *         description: تم رفع الصور بنجاح
 *       400:
 *         description: خطأ في طلب البيانات
 *       401:
 *         description: غير مصرح به
 *       404:
 *         description: لم يتم العثور على التقرير
 */
router.post('/images/:reportId', protectMobile, upload.array('images', Number(process.env.MAX_IMAGES_PER_REPORT || 5)), uploadReportImages);

/**
 * @swagger
 * /api/mobile/reports/my-reports:
 *   get:
 *     summary: الحصول على تقارير المستخدم
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: تم استرجاع التقارير بنجاح
 *       401:
 *         description: غير مصرح به
 *       500:
 *         description: خطأ في الخادم
 */
router.get('/my-reports', reportController.getUserReports);

/**
 * @swagger
 * /api/mobile/reports/search:
 *   get:
 *     summary: البحث في التقارير
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lost, found]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم استرجاع نتائج البحث بنجاح
 *       500:
 *         description: خطأ في الخادم
 */
router.get('/search', reportController.searchReports);

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [lost, found]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         documentType:
 *           type: string
 *         documentId:
 *           type: string
 *         location:
 *           type: object
 *         date:
 *           type: string
 *           format: date
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         contactInfo:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/mobile/reports/{reportId}:
 *   get:
 *     summary: الحصول على تقرير محدد
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم استرجاع التقرير بنجاح
 *       404:
 *         description: التقرير غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.get('/:reportId', reportController.getReportById);

/**
 * @swagger
 * /api/mobile/reports/{reportId}:
 *   put:
 *     summary: تحديث تقرير
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: تم تحديث التقرير بنجاح
 *       404:
 *         description: التقرير غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.put('/:reportId', uploadMiddleware.uploadReportImages, reportController.updateReport);

/**
 * @swagger
 * /api/mobile/reports/{reportId}/flag:
 *   post:
 *     summary: الإبلاغ عن تقرير غير مناسب
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: تم الإبلاغ عن التقرير بنجاح
 *       404:
 *         description: التقرير غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.post('/:reportId/flag', reportController.flagReport);

/**
 * @swagger
 * /api/mobile/reports/matches/{matchId}/confirm:
 *   post:
 *     summary: تأكيد تطابق
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم تأكيد التطابق بنجاح
 *       404:
 *         description: التطابق غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.post('/matches/:matchId/confirm', reportController.confirmMatch);

/**
 * @swagger
 * /api/mobile/reports/matches/{matchId}/reject:
 *   post:
 *     summary: رفض تطابق
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم رفض التطابق بنجاح
 *       404:
 *         description: التطابق غير موجود
 *       500:
 *         description: خطأ في الخادم
 */
router.post('/matches/:matchId/reject', reportController.rejectMatch);

export default router; 