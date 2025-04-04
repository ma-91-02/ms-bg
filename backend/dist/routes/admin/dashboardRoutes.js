"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const dashboardController_1 = require("../../controllers/admin/dashboardController");
const router = express_1.default.Router();
// حماية جميع المسارات
router.use(authMiddleware_1.adminProtect);
// مسار الإحصائيات
router.get('/stats', dashboardController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map