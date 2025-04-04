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
exports.rejectContactRequest = exports.approveContactRequest = exports.getAllContactRequests = exports.getPendingContactRequests = void 0;
const ContactRequest_1 = __importStar(require("../../models/mobile/ContactRequest"));
// الحصول على قائمة طلبات التواصل المعلقة
const getPendingContactRequests = async (req, res) => {
    try {
        if (!req.admin) {
            console.log('❌ طلب غير مصرح به - الوصول إلى طلبات التواصل المعلقة');
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        console.log('📥 طلب جلب طلبات التواصل المعلقة من المشرف:', req.admin._id);
        const { page = 1, limit = 10 } = req.query;
        // بناء الفلتر - فقط الطلبات المعلقة
        const filter = { status: ContactRequest_1.ContactRequestStatus.PENDING };
        // الحصول على إجمالي عدد الطلبات
        const total = await ContactRequest_1.default.countDocuments(filter);
        console.log(`📊 إجمالي عدد طلبات التواصل المعلقة: ${total}`);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الطلبات
        const contactRequests = await ContactRequest_1.default.find(filter)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber')
            .populate('advertisementId', 'type category governorate description')
            .populate('advertiserUserId', 'fullName phoneNumber');
        console.log(`✅ تم جلب ${contactRequests.length} طلب تواصل معلق`);
        return res.status(200).json({
            success: true,
            count: contactRequests.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: contactRequests
        });
    }
    catch (error) {
        console.error('❌ خطأ في الحصول على طلبات التواصل المعلقة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getPendingContactRequests = getPendingContactRequests;
// الحصول على جميع طلبات التواصل
const getAllContactRequests = async (req, res) => {
    try {
        if (!req.admin) {
            console.log('❌ طلب غير مصرح به - الوصول إلى جميع طلبات التواصل');
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        console.log('📥 طلب جلب جميع طلبات التواصل من المشرف:', req.admin._id);
        const { status, page = 1, limit = 10 } = req.query;
        // بناء الفلتر
        const filter = {};
        if (status) {
            filter.status = status;
            console.log(`📋 تصفية طلبات التواصل حسب الحالة: ${status}`);
        }
        // الحصول على إجمالي عدد الطلبات
        const total = await ContactRequest_1.default.countDocuments(filter);
        console.log(`📊 إجمالي عدد طلبات التواصل: ${total}`);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الطلبات
        const contactRequests = await ContactRequest_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber')
            .populate('advertisementId', 'type category governorate description')
            .populate('advertiserUserId', 'fullName phoneNumber');
        console.log(`✅ تم جلب ${contactRequests.length} طلب تواصل`);
        return res.status(200).json({
            success: true,
            count: contactRequests.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: contactRequests
        });
    }
    catch (error) {
        console.error('❌ خطأ في الحصول على طلبات التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getAllContactRequests = getAllContactRequests;
// الموافقة على طلب تواصل
const approveContactRequest = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        // البحث عن الطلب
        const contactRequest = await ContactRequest_1.default.findById(id);
        if (!contactRequest) {
            return res.status(404).json({
                success: false,
                message: 'طلب التواصل غير موجود'
            });
        }
        // التحقق من حالة الطلب
        if (contactRequest.status !== ContactRequest_1.ContactRequestStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'تم معالجة هذا الطلب مسبقًا'
            });
        }
        // تحديث حالة الطلب
        contactRequest.status = ContactRequest_1.ContactRequestStatus.APPROVED;
        contactRequest.approvedBy = req.admin._id;
        contactRequest.approvedAt = new Date();
        await contactRequest.save();
        return res.status(200).json({
            success: true,
            message: 'تمت الموافقة على طلب التواصل بنجاح',
            data: contactRequest
        });
    }
    catch (error) {
        console.error('خطأ في الموافقة على طلب التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.approveContactRequest = approveContactRequest;
// رفض طلب تواصل
const rejectContactRequest = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { rejectionReason } = req.body;
        // البحث عن الطلب
        const contactRequest = await ContactRequest_1.default.findById(id);
        if (!contactRequest) {
            return res.status(404).json({
                success: false,
                message: 'طلب التواصل غير موجود'
            });
        }
        // التحقق من حالة الطلب
        if (contactRequest.status !== ContactRequest_1.ContactRequestStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'تم معالجة هذا الطلب مسبقًا'
            });
        }
        // تحديث حالة الطلب
        contactRequest.status = ContactRequest_1.ContactRequestStatus.REJECTED;
        contactRequest.rejectionReason = rejectionReason || 'غير موافق عليه من قبل الإدارة';
        await contactRequest.save();
        return res.status(200).json({
            success: true,
            message: 'تم رفض طلب التواصل بنجاح',
            data: contactRequest
        });
    }
    catch (error) {
        console.error('خطأ في رفض طلب التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.rejectContactRequest = rejectContactRequest;
//# sourceMappingURL=contactRequestController.js.map