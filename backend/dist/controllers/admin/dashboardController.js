"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../../models/mobile/User"));
const Advertisement_1 = __importDefault(require("../../models/mobile/Advertisement"));
const AdvertisementMatch_1 = __importDefault(require("../../models/mobile/AdvertisementMatch"));
const ContactRequest_1 = __importDefault(require("../../models/mobile/ContactRequest"));
// الحصول على إحصائيات للوحة التحكم
const getDashboardStats = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        // إحصائيات المستخدمين
        const usersCount = await User_1.default.countDocuments();
        // إحصائيات الإعلانات
        const adsStats = {
            total: await Advertisement_1.default.countDocuments(),
            pending: await Advertisement_1.default.countDocuments({ isApproved: false }),
            approved: await Advertisement_1.default.countDocuments({ isApproved: true, isResolved: false }),
            resolved: await Advertisement_1.default.countDocuments({ isResolved: true }),
            lost: await Advertisement_1.default.countDocuments({ type: 'lost' }),
            found: await Advertisement_1.default.countDocuments({ type: 'found' })
        };
        // إحصائيات المطابقات
        const matchesStats = {
            total: await AdvertisementMatch_1.default.countDocuments(),
            pending: await AdvertisementMatch_1.default.countDocuments({ status: 'pending' }),
            approved: await AdvertisementMatch_1.default.countDocuments({ status: 'approved' }),
            rejected: await AdvertisementMatch_1.default.countDocuments({ status: 'rejected' })
        };
        // إحصائيات طلبات التواصل
        const contactRequestsStats = {
            total: await ContactRequest_1.default.countDocuments(),
            pending: await ContactRequest_1.default.countDocuments({ status: 'pending' }),
            approved: await ContactRequest_1.default.countDocuments({ status: 'approved' }),
            rejected: await ContactRequest_1.default.countDocuments({ status: 'rejected' })
        };
        // أحدث الإعلانات بانتظار الموافقة
        const latestPendingAds = await Advertisement_1.default.find({ isApproved: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'fullName phoneNumber');
        // أحدث المطابقات المحتملة
        const latestMatches = await AdvertisementMatch_1.default.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: 'lostAdvertisementId',
            select: 'category ownerName itemNumber',
            populate: { path: 'userId', select: 'fullName' }
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category ownerName itemNumber',
            populate: { path: 'userId', select: 'fullName' }
        });
        return res.status(200).json({
            success: true,
            data: {
                usersCount,
                ads: adsStats,
                matches: matchesStats,
                contactRequests: contactRequestsStats,
                latestPendingAds,
                latestMatches
            }
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map