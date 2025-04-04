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
const advertisementController = __importStar(require("../../controllers/admin/advertisementController"));
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const uploadMiddleware_1 = require("../../middleware/common/uploadMiddleware");
const router = express_1.default.Router();
// جميع مسارات المشرف محمية
router.use(authMiddleware_1.adminProtect);
// الحصول على الإعلانات
router.get('/', advertisementController.getAllAdvertisements);
router.get('/pending', advertisementController.getPendingAdvertisements);
router.get('/:id', advertisementController.getAdvertisementById);
// إدارة الإعلانات
router.put('/:id', uploadMiddleware_1.uploadMiddleware.array('images', 5), advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);
// تغيير حالة الإعلان
router.put('/:id/approve', advertisementController.approveAdvertisement);
router.put('/:id/reject', advertisementController.rejectAdvertisement);
router.put('/:id/resolve', advertisementController.markAsResolved);
// إضافة مسار جديد
router.get('/status/:status', advertisementController.getAdvertisementsByStatus);
exports.default = router;
//# sourceMappingURL=advertisementRoutes.js.map