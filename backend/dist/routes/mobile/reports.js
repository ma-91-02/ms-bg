"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../../controllers/mobile/reportController");
const mobileAuthMiddleware_1 = require("../../middleware/mobileAuthMiddleware");
const uploadMiddleware_1 = require("../../middleware/uploadMiddleware");
const router = express_1.default.Router();
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
router.post('/', mobileAuthMiddleware_1.protectMobile, reportController_1.createReport);
// راوتر لرفع الصور للتقرير (يدعم رفع 5 صور كحد أقصى)
router.post('/:reportId/images', mobileAuthMiddleware_1.protectMobile, uploadMiddleware_1.upload.array('images', 5), reportController_1.uploadReportImages);
router.get('/my-reports', mobileAuthMiddleware_1.protectMobile, reportController_1.getUserReports);
router.get('/search', reportController_1.searchReports);
exports.default = router;
