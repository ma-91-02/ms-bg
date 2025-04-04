"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/admin/authController");
// إنشاء موجه express
const router = express_1.default.Router();
// مسارات المصادقة للأدمن
router.post('/', authController_1.login);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map