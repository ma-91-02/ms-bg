"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../../controllers/mobile/notificationController");
const authMiddleware_1 = require("../../middleware/mobile/authMiddleware");
const router = express_1.default.Router();
// جميع المسارات تتطلب المصادقة
router.use(authMiddleware_1.protectMobile);
// الحصول على إشعارات المستخدم
router.get('/', notificationController_1.getUserNotifications);
// وضع علامة "مقروء" على جميع الإشعارات
router.patch('/mark-all-read', notificationController_1.markAllAsRead);
// وضع علامة "مقروء" على إشعار معين
router.patch('/:notificationId/read', notificationController_1.markAsRead);
exports.default = router;
//# sourceMappingURL=notifications.js.map