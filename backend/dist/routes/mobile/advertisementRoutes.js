"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advertisementController = __importStar(require("../../controllers/mobile/advertisementController"));
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const uploadMiddleware_1 = require("../../middleware/common/uploadMiddleware");
const router = express_1.default.Router();
// مسارات عامة (بدون حماية)
router.get('/', advertisementController.getAdvertisements);
router.get('/constants', advertisementController.getConstants);
// مسارات محمية (تتطلب تسجيل الدخول)
router.use(authMiddleware_1.protect);
// إدارة الإعلانات الشخصية
router.get('/user/my-advertisements', advertisementController.getUserAdvertisements);
// مسار التفاصيل بالمعرّف (يأتي بعد المسارات المحددة)
router.get('/:id', advertisementController.getAdvertisementById);
// إنشاء/تحديث/حذف إعلان
router.post('/', uploadMiddleware_1.uploadMiddleware.array('images', 5), advertisementController.createAdvertisement);
router.put('/:id', uploadMiddleware_1.uploadMiddleware.array('images', 5), advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);
// إدارة الصور
router.post('/:id/remove-image', advertisementController.removeImage);
// تحديث حالة الحل
router.put('/:id/resolve', advertisementController.markAsResolved);
exports.default = router;
//# sourceMappingURL=advertisementRoutes.js.map