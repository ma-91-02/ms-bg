"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./admin/auth"));
const authRoutes_1 = __importDefault(require("./mobile/authRoutes"));
const advertisementRoutes_1 = __importDefault(require("./mobile/advertisementRoutes"));
const authRoutes_2 = __importDefault(require("./admin/authRoutes"));
const advertisementRoutes_2 = __importDefault(require("./admin/advertisementRoutes"));
const contactRequestRoutes_1 = __importDefault(require("./mobile/contactRequestRoutes"));
const contactRequestRoutes_2 = __importDefault(require("./admin/contactRequestRoutes"));
const matchesRoutes_1 = __importDefault(require("./admin/matchesRoutes"));
const matchesRoutes_2 = __importDefault(require("./mobile/matchesRoutes"));
const usersRoutes_1 = __importDefault(require("./admin/usersRoutes"));
const dashboardRoutes_1 = __importDefault(require("./admin/dashboardRoutes"));
const router = express_1.default.Router();
// طباعة بالإنجليزية مباشرة
console.log('🔍 Registering routes...');
// مسارات الموبايل
let mobileAuthRouter;
try {
    mobileAuthRouter = require('./mobile/authRoutes').default;
    console.log('✅ Mobile auth routes imported successfully: authRoutes');
}
catch (innerError) {
    console.error('❌ Failed to import mobile auth routes:', innerError.message);
    mobileAuthRouter = express_1.default.Router();
}
let mobileAdvertisementRouter;
try {
    mobileAdvertisementRouter = require('./mobile/advertisementRoutes').default;
    console.log('✅ Advertisement routes imported successfully: advertisementRoutes');
}
catch (innerError) {
    console.error('❌ Failed to import advertisement routes:', innerError.message);
    mobileAdvertisementRouter = express_1.default.Router();
}
// تسجيل المسارات
console.log('🚀 تسجيل المسارات في router/index.ts...');
router.use('/api/mobile/auth', authRoutes_1.default);
console.log('✓ تم تسجيل مسارات المصادقة للجوال');
router.use('/api/mobile/advertisements', advertisementRoutes_1.default);
router.use('/api/login', authRoutes_2.default);
router.use('/api/admin', auth_1.default);
// تسجيل مسارات إدارة الإعلانات للمشرف
router.use('/api/admin/advertisements', advertisementRoutes_2.default);
// تسجيل مسارات طلبات التواصل للمستخدمين
router.use('/api/mobile/contact-requests', contactRequestRoutes_1.default);
// تسجيل مسارات طلبات التواصل للمشرفين
router.use('/api/admin/contact-requests', contactRequestRoutes_2.default);
// تسجيل مسارات مطابقات الإعلانات للمشرفين
router.use('/api/admin/matches', matchesRoutes_1.default);
// تسجيل مسارات مطابقات الإعلانات للمستخدمين
router.use('/api/mobile/matches', matchesRoutes_2.default);
// تسجيل مسارات إدارة المستخدمين
router.use('/api/admin/users', usersRoutes_1.default);
// تسجيل مسارات لوحة المعلومات
router.use('/api/admin/dashboard', dashboardRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map