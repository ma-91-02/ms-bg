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
exports.getContactInfo = exports.getUserContactRequests = exports.createContactRequest = void 0;
const ContactRequest_1 = __importStar(require("../../models/mobile/ContactRequest"));
const Advertisement_1 = __importDefault(require("../../models/mobile/Advertisement"));
// إنشاء طلب تواصل جديد
const createContactRequest = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            console.error('❌ فشل في إنشاء طلب تواصل - لم يتم العثور على معلومات المستخدم');
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const { advertisementId, reason } = req.body;
        console.log('📩 طلب إنشاء طلب تواصل جديد:', {
            user: authReq.user.id,
            advertisementId,
            reason,
            body: req.body
        });
        if (!advertisementId || !reason) {
            console.error('❌ معرف الإعلان أو سبب الطلب مفقود');
            return res.status(400).json({
                success: false,
                message: 'معرف الإعلان وسبب طلب التواصل مطلوبان'
            });
        }
        // التحقق من وجود الإعلان
        const advertisement = await Advertisement_1.default.findById(advertisementId);
        if (!advertisement) {
            console.error(`❌ لم يتم العثور على الإعلان بالمعرف: ${advertisementId}`);
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        console.log('✅ تم العثور على الإعلان:', {
            adId: advertisement._id,
            adType: advertisement.type,
            adOwner: advertisement.userId
        });
        // التحقق من أن المستخدم لا يحاول التواصل مع إعلان خاص به
        if (advertisement.userId.toString() === authReq.user.id) {
            console.error('❌ المستخدم يحاول التواصل مع إعلان خاص به');
            return res.status(400).json({
                success: false,
                message: 'لا يمكن طلب التواصل مع إعلان خاص بك'
            });
        }
        // التحقق من عدم وجود طلب تواصل سابق لم يتم البت فيه
        const existingRequest = await ContactRequest_1.default.findOne({
            userId: authReq.user.id,
            advertisementId,
            status: ContactRequest_1.ContactRequestStatus.PENDING
        });
        if (existingRequest) {
            console.error('❌ يوجد طلب تواصل قيد الانتظار لهذا الإعلان');
            return res.status(400).json({
                success: false,
                message: 'لديك طلب تواصل قيد الانتظار لهذا الإعلان'
            });
        }
        // إنشاء طلب تواصل جديد
        const contactRequest = new ContactRequest_1.default({
            userId: authReq.user.id,
            advertisementId,
            advertiserUserId: advertisement.userId,
            reason
        });
        await contactRequest.save();
        console.log('✅ تم إنشاء طلب تواصل جديد بنجاح:', {
            requestId: contactRequest._id,
            userId: contactRequest.userId,
            advertisementId: contactRequest.advertisementId,
            advertiserUserId: contactRequest.advertiserUserId
        });
        return res.status(201).json({
            success: true,
            message: 'تم إرسال طلب التواصل بنجاح وفي انتظار موافقة الإدارة',
            data: contactRequest
        });
    }
    catch (error) {
        console.error('❌ خطأ غير متوقع في إنشاء طلب التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.createContactRequest = createContactRequest;
// الحصول على طلبات التواصل الخاصة بالمستخدم
const getUserContactRequests = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const { status, page = 1, limit = 10 } = req.query;
        // إنشاء فلتر البحث
        const filter = { userId: authReq.user.id };
        if (status) {
            filter.status = status;
        }
        // الحصول على إجمالي عدد الطلبات
        const total = await ContactRequest_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الطلبات
        const contactRequests = await ContactRequest_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('advertisementId', 'type category governorate description')
            .populate('advertiserUserId', 'fullName');
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
        console.error('خطأ في الحصول على طلبات التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getUserContactRequests = getUserContactRequests;
// الحصول على معلومات التواصل (إذا تمت الموافقة على الطلب)
const getContactInfo = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const { requestId } = req.params;
        // التحقق من وجود الطلب وأنه خاص بالمستخدم
        const contactRequest = await ContactRequest_1.default.findOne({
            _id: requestId,
            userId: authReq.user.id
        });
        if (!contactRequest) {
            return res.status(404).json({
                success: false,
                message: 'طلب التواصل غير موجود أو غير مصرح به'
            });
        }
        // التحقق من حالة الطلب
        if (contactRequest.status !== ContactRequest_1.ContactRequestStatus.APPROVED) {
            return res.status(400).json({
                success: false,
                message: 'لم تتم الموافقة على طلب التواصل بعد'
            });
        }
        // الحصول على معلومات التواصل
        const advertisement = await Advertisement_1.default.findById(contactRequest.advertisementId)
            .populate('userId', 'fullName phoneNumber');
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }
        // إرجاع معلومات التواصل
        return res.status(200).json({
            success: true,
            message: 'تمت الموافقة على طلب التواصل',
            data: {
                advertiserName: advertisement.userId.fullName || 'غير متوفر',
                contactPhone: advertisement.contactPhone,
                userPhone: advertisement.userId.phoneNumber || 'غير متوفر'
            }
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على معلومات التواصل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getContactInfo = getContactInfo;
//# sourceMappingURL=contactRequestController.js.map