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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMatches = void 0;
const AdvertisementMatch_1 = __importStar(require("../../models/mobile/AdvertisementMatch"));
// الحصول على مطابقات الإعلانات الخاصة بالمستخدم
const getUserMatches = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        // البحث عن الإعلانات الخاصة بالمستخدم (مفقودة أو موجودة)
        const matches = await AdvertisementMatch_1.default.find({
            status: AdvertisementMatch_1.MatchStatus.APPROVED,
            $or: [
                // مطابقات حيث المستخدم هو صاحب إعلان المفقودات
                { 'lostAdvertisementId.userId': authReq.user.id },
                // مطابقات حيث المستخدم هو صاحب إعلان الموجودات
                { 'foundAdvertisementId.userId': authReq.user.id }
            ]
        })
            .populate({
            path: 'lostAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName' }
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId contactPhone',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        });
        return res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على المطابقات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getUserMatches = getUserMatches;
//# sourceMappingURL=matchesController.js.map