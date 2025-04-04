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
exports.getAdvertisementsByStatus = exports.markAsResolved = exports.deleteAdvertisement = exports.updateAdvertisement = exports.getAdvertisementById = exports.getAllAdvertisements = exports.rejectAdvertisement = exports.approveAdvertisement = exports.getPendingAdvertisements = void 0;
const Advertisement_1 = __importStar(require("../../models/mobile/Advertisement"));
// الحصول على قائمة الإعلانات بانتظار الموافقة
const getPendingAdvertisements = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        // بناء الفلتر - فقط الإعلانات بانتظار الموافقة
        const filter = { status: Advertisement_1.AdvertisementStatus.PENDING };
        // الحصول على إجمالي عدد الإعلانات
        const total = await Advertisement_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الإعلانات مع الترتيب حسب الأقدم أولاً
        const advertisements = await Advertisement_1.default.find(filter)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber');
        return res.status(200).json({
            success: true,
            count: advertisements.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: advertisements
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على الإعلانات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getPendingAdvertisements = getPendingAdvertisements;
// الموافقة على إعلان
const approveAdvertisement = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        // البحث عن الإعلان
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        // تحديث حالة الإعلان
        advertisement.isApproved = true;
        advertisement.status = Advertisement_1.AdvertisementStatus.APPROVED;
        advertisement.approvedAt = new Date();
        advertisement.approvedBy = req.admin._id;
        await advertisement.save();
        return res.status(200).json({
            success: true,
            message: 'تمت الموافقة على الإعلان بنجاح',
            data: advertisement
        });
    }
    catch (error) {
        console.error('خطأ في الموافقة على الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.approveAdvertisement = approveAdvertisement;
// رفض إعلان
const rejectAdvertisement = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { rejectionReason } = req.body;
        // البحث عن الإعلان
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        // تحديث حالة الإعلان
        advertisement.isApproved = false;
        advertisement.status = Advertisement_1.AdvertisementStatus.REJECTED;
        advertisement.rejectionReason = rejectionReason || 'مخالف للشروط والأحكام';
        await advertisement.save();
        return res.status(200).json({
            success: true,
            message: 'تم رفض الإعلان بنجاح',
            data: advertisement
        });
    }
    catch (error) {
        console.error('خطأ في رفض الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.rejectAdvertisement = rejectAdvertisement;
// الحصول على جميع الإعلانات (للمشرف)
const getAllAdvertisements = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { type, category, governorate, status, isResolved, page = 1, limit = 10 } = req.query;
        // بناء فلتر البحث
        const filter = {};
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (governorate)
            filter.governorate = governorate;
        if (status)
            filter.status = status;
        if (isResolved !== undefined)
            filter.isResolved = isResolved === 'true';
        // الحصول على إجمالي عدد الإعلانات
        const total = await Advertisement_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الإعلانات مع التصفية والترتيب حسب الأحدث
        const advertisements = await Advertisement_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber');
        return res.status(200).json({
            success: true,
            count: advertisements.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: advertisements
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على الإعلانات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getAllAdvertisements = getAllAdvertisements;
// الحصول على إعلان محدد (للمشرف)
const getAdvertisementById = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const advertisement = await Advertisement_1.default.findById(req.params.id)
            .populate('userId', 'fullName phoneNumber');
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        return res.status(200).json({
            success: true,
            data: advertisement
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getAdvertisementById = getAdvertisementById;
// تعديل إعلان (للمشرف)
const updateAdvertisement = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const updateData = req.body;
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        // تحديث معلومات الإعلان
        Object.keys(updateData).forEach(key => {
            if (key !== '_id' && key !== 'userId' && key !== 'createdAt') {
                advertisement[key] = updateData[key];
            }
        });
        // توثيق أن التعديل تم بواسطة المشرف
        advertisement.approvedBy = req.admin._id;
        advertisement.approvedAt = new Date();
        await advertisement.save();
        return res.status(200).json({
            success: true,
            message: 'تم تحديث الإعلان بنجاح',
            data: advertisement
        });
    }
    catch (error) {
        console.error('خطأ في تحديث الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.updateAdvertisement = updateAdvertisement;
// حذف إعلان (للمشرف)
const deleteAdvertisement = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        await Advertisement_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: 'تم حذف الإعلان بنجاح'
        });
    }
    catch (error) {
        console.error('خطأ في حذف الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.deleteAdvertisement = deleteAdvertisement;
// تغيير حالة الإعلان إلى "تم الحل" (للمشرف)
const markAsResolved = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { isResolved } = req.body;
        if (isResolved === undefined) {
            return res.status(400).json({
                success: false,
                message: 'يرجى توفير حالة الحل (isResolved)'
            });
        }
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        advertisement.isResolved = isResolved;
        advertisement.status = isResolved ? Advertisement_1.AdvertisementStatus.RESOLVED : Advertisement_1.AdvertisementStatus.APPROVED;
        advertisement.resolvedAt = isResolved ? new Date() : null;
        await advertisement.save();
        return res.status(200).json({
            success: true,
            message: isResolved ? 'تم تحديث حالة الإعلان إلى "تم الحل"' : 'تم إعادة فتح الإعلان',
            data: advertisement
        });
    }
    catch (error) {
        console.error('خطأ في تحديث حالة الإعلان:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.markAsResolved = markAsResolved;
// الحصول على الإعلانات حسب الحالة
const getAdvertisementsByStatus = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { status } = req.params; // pending, approved, rejected, resolved
        const { type, category, governorate, page = 1, limit = 10 } = req.query;
        // بناء فلتر البحث
        const filter = {};
        // تحديد الفلتر حسب الحالة
        switch (status) {
            case 'pending':
                filter.isApproved = false;
                break;
            case 'approved':
                filter.isApproved = true;
                filter.isResolved = false;
                break;
            case 'resolved':
                filter.isResolved = true;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'حالة غير صالحة. الحالات المتاحة: pending, approved, resolved'
                });
        }
        // إضافة فلاتر إضافية
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (governorate)
            filter.governorate = governorate;
        // الحصول على إجمالي عدد الإعلانات
        const total = await Advertisement_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الإعلانات
        const advertisements = await Advertisement_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber');
        return res.status(200).json({
            success: true,
            count: advertisements.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: advertisements
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على الإعلانات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getAdvertisementsByStatus = getAdvertisementsByStatus;
//# sourceMappingURL=advertisementController.js.map