"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advertisementController_1 = require("../../controllers/mobile/advertisementController");
const authMiddleware_1 = require("../../middleware/mobile/authMiddleware");
const fileUploadService_1 = require("../../services/common/fileUploadService");
const router = express_1.default.Router();
// مسارات الإعلانات
router.post('/', authMiddleware_1.protectMobile, fileUploadService_1.upload.array('images', 5), advertisementController_1.createAdvertisement);
router.get('/', advertisementController_1.getAdvertisements);
router.get('/user', authMiddleware_1.protectMobile, advertisementController_1.getUserAdvertisements);
router.get('/:id', advertisementController_1.getAdvertisementById);
router.put('/:id', authMiddleware_1.protectMobile, fileUploadService_1.upload.array('images', 5), advertisementController_1.updateAdvertisement);
router.delete('/:id', authMiddleware_1.protectMobile, advertisementController_1.deleteAdvertisement);
router.patch('/:id/resolve', authMiddleware_1.protectMobile, advertisementController_1.markAsResolved);
exports.default = router;
//# sourceMappingURL=advertisement.js.map