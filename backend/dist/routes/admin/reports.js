"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../../controllers/admin/reportController");
const authenticateToken_1 = require("../../middleware/authenticateToken");
const router = express_1.default.Router();
// حماية جميع مسارات المسؤول
router.use(authenticateToken_1.authenticateToken);
// راوترات إدارة التقارير
router.get('/pending', reportController_1.getPendingReports);
router.patch('/approve/:reportId', reportController_1.approveReport);
router.patch('/reject/:reportId', reportController_1.rejectReport);
exports.default = router;
