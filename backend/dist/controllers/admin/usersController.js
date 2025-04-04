"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleBlockUser = exports.getUserById = exports.getUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../models/mobile/User"));
const Advertisement_1 = __importDefault(require("../../models/mobile/Advertisement"));
const ContactRequest_1 = __importDefault(require("../../models/mobile/ContactRequest"));
// الحصول على قائمة المستخدمين
const getUsers = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { search, isBlocked, page = 1, limit = 10 } = req.query;
        // بناء فلتر البحث
        const filter = {};
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (isBlocked !== undefined) {
            filter.isBlocked = isBlocked === 'true';
        }
        // الحصول على إجمالي عدد المستخدمين
        const total = await User_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب المستخدمين
        const users = await User_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('_id fullName phoneNumber email isBlocked createdAt');
        return res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: users
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على المستخدمين:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getUsers = getUsers;
// الحصول على مستخدم محدد
const getUserById = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        // التحقق من صحة معرف المستخدم
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'معرف المستخدم غير صالح'
            });
        }
        // البحث عن المستخدم مع إحصائيات إضافية
        const user = await User_1.default.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        // الحصول على إحصائيات إضافية
        const stats = {
            totalAds: await Advertisement_1.default.countDocuments({ userId: id }),
            lostAds: await Advertisement_1.default.countDocuments({ userId: id, type: 'lost' }),
            foundAds: await Advertisement_1.default.countDocuments({ userId: id, type: 'found' }),
            resolvedAds: await Advertisement_1.default.countDocuments({ userId: id, isResolved: true }),
            contactRequests: await ContactRequest_1.default.countDocuments({ userId: id })
        };
        // الحصول على آخر 5 إعلانات للمستخدم
        const recentAds = await Advertisement_1.default.find({ userId: id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('type category governorate description createdAt isApproved isResolved');
        return res.status(200).json({
            success: true,
            data: {
                user,
                stats,
                recentAds
            }
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على تفاصيل المستخدم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getUserById = getUserById;
// حظر مستخدم / إلغاء الحظر
const toggleBlockUser = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { isBlocked, blockReason } = req.body;
        // التحقق من صحة معرف المستخدم
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'معرف المستخدم غير صالح'
            });
        }
        // التحقق مما إذا كانت حالة الحظر محددة
        if (isBlocked === undefined) {
            return res.status(400).json({
                success: false,
                message: 'يجب تحديد حالة الحظر (isBlocked)'
            });
        }
        // البحث عن المستخدم وتحديثه
        const user = await User_1.default.findByIdAndUpdate(id, {
            isBlocked,
            blockReason: isBlocked ? (blockReason || 'قرار إداري') : null,
            blockedAt: isBlocked ? new Date() : null,
            blockedBy: isBlocked ? req.admin._id : null
        }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        const action = isBlocked ? 'حظر' : 'إلغاء حظر';
        return res.status(200).json({
            success: true,
            message: `تم ${action} المستخدم بنجاح`,
            data: {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    isBlocked: user.isBlocked,
                    blockReason: user.blockReason,
                    blockedAt: user.blockedAt
                }
            }
        });
    }
    catch (error) {
        console.error('خطأ في تغيير حالة حظر المستخدم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.toggleBlockUser = toggleBlockUser;
// حذف مستخدم
const deleteUser = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        // التحقق من صحة معرف المستخدم
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'معرف المستخدم غير صالح'
            });
        }
        // البحث عن المستخدم والتحقق من وجوده
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        // تنفيذ عملية الحذف (سنستخدم حذف منطقي)
        // يمكن إضافة حقل isDeleted في نموذج المستخدم وتحديثه بدلاً من الحذف الكامل
        await User_1.default.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: req.admin._id,
            // تحديث البيانات الحساسة لتفادي مشاكل GDPR
            phoneNumber: `DELETED_${user.phoneNumber}`,
            email: user.email ? `DELETED_${user.email}` : undefined
        });
        // يمكن أيضًا أرشفة إعلانات المستخدم بدلاً من حذفها
        await Advertisement_1.default.updateMany({ userId: id }, { isArchived: true, archivedReason: 'تم حذف المستخدم' });
        return res.status(200).json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });
    }
    catch (error) {
        console.error('خطأ في حذف المستخدم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=usersController.js.map