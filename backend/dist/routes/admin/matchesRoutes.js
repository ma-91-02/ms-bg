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
const matchesController = __importStar(require("../../controllers/admin/matchesController"));
const authMiddleware_1 = require("../../middleware/common/authMiddleware");
const router = express_1.default.Router();
// جميع المسارات محمية
router.use(authMiddleware_1.adminProtect);
// الحصول على المطابقات
router.get('/', matchesController.getAllMatches);
router.get('/pending', matchesController.getPendingMatches);
// الموافقة أو رفض المطابقات
router.put('/:id/approve', matchesController.approveMatch);
router.put('/:id/reject', matchesController.rejectMatch);
// إضافة مسار إنشاء المطابقات بشكل جماعي
router.post('/bulk-create', matchesController.bulkCreateMatches);
// إضافة مسارات الاختبار
router.get('/run-matching', matchesController.runMatchingForAll);
router.get('/run-matching/:advertisementId', matchesController.runMatchingForOne);
// إضافة مسار التنظيف
router.post('/cleanup-duplicates', matchesController.cleanupDuplicateMatches);
// إضافة مسار سجل المطابقات
router.get('/history', matchesController.getMatchHistory);
exports.default = router;
//# sourceMappingURL=matchesRoutes.js.map