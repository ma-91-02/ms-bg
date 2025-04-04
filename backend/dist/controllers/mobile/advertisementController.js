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
exports.removeImage = exports.getConstants = exports.markAsResolved = exports.deleteAdvertisement = exports.updateAdvertisement = exports.getUserAdvertisements = exports.getAdvertisementById = exports.getAdvertisements = exports.createAdvertisement = void 0;
const Advertisement_1 = __importStar(require("../../models/mobile/Advertisement"));
const fileUploadService_1 = require("../../services/common/fileUploadService");
const matchingService_1 = require("../../services/common/matchingService");
var AdvertisementStatus;
(function (AdvertisementStatus) {
    AdvertisementStatus["PENDING"] = "pending";
    AdvertisementStatus["ACTIVE"] = "active";
    AdvertisementStatus["RESOLVED"] = "resolved";
    AdvertisementStatus["REJECTED"] = "rejected";
})(AdvertisementStatus || (AdvertisementStatus = {}));
const createAdvertisement = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const userId = authReq.user.id;
        // التحقق من وجود الصور
        const files = req.files;
        const imagePaths = [];
        if (files && files.length > 0) {
            // تحميل الصور
            const uploadedImages = await (0, fileUploadService_1.uploadImages)(files);
            imagePaths.push(...uploadedImages);
        }
        // إنشاء الإعلان الجديد
        const advertisement = new Advertisement_1.default({
            ...req.body,
            images: imagePaths,
            userId: userId
        });
        await advertisement.save();
        // استدعاء خدمة المطابقة
        await (0, matchingService_1.checkForMatches)(advertisement._id.toString());
        return res.status(201).json({
            success: true,
            data: advertisement
        });
    }
    catch (error) {
        console.error('Error creating advertisement:', error);
        return res.status(500).json({
            success: false,
            message: 'فشل في إنشاء الإعلان',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.createAdvertisement = createAdvertisement;
const getAdvertisements = async (req, res) => {
    try {
        const { type, category, governorate, isResolved, page = 1, limit = 10 } = req.query;
        // بناء فلتر البحث
        const filter = {};
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (governorate)
            filter.governorate = governorate;
        if (isResolved !== undefined)
            filter.isResolved = isResolved === 'true';
        // فقط الإعلانات المعتمدة
        filter.isApproved = true;
        // الحصول على إجمالي عدد الإعلانات
        const total = await Advertisement_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب الإعلانات مع التصفية والترتيب حسب الأحدث
        let advertisements = await Advertisement_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'fullName phoneNumber');
        // إخفاء أرقام التواصل للإعلانات
        const authReq = req;
        const sanitizedAds = advertisements.map(ad => {
            const adObj = ad.toObject();
            // إخفاء رقم التواصل إذا كان مطلوبًا
            if (ad.hideContactInfo && (!authReq.user || ad.userId.toString() !== authReq.user.id)) {
                adObj.contactPhone = "********* (متاح عند طلب الاتصال)";
                if (adObj.userId && adObj.userId.phoneNumber) {
                    adObj.userId.phoneNumber = "********* (متاح عند طلب الاتصال)";
                }
            }
            return adObj;
        });
        return res.status(200).json({
            success: true,
            count: sanitizedAds.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: sanitizedAds
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
exports.getAdvertisements = getAdvertisements;
const getAdvertisementById = async (req, res) => {
    try {
        const advertisement = await Advertisement_1.default.findById(req.params.id)
            .populate('userId', 'fullName phoneNumber');
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // إخفاء رقم التواصل إذا كان مطلوبًا
        const authReq = req;
        const adObj = advertisement.toObject();
        if (advertisement.hideContactInfo && (!authReq.user || advertisement.userId.toString() !== authReq.user.id)) {
            adObj.contactPhone = "********* (متاح عند طلب الاتصال)";
            if (adObj.userId && adObj.userId.phoneNumber) {
                adObj.userId.phoneNumber = "********* (متاح عند طلب الاتصال)";
            }
        }
        return res.status(200).json({
            success: true,
            data: adObj
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'فشل في جلب الإعلان',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.getAdvertisementById = getAdvertisementById;
const getUserAdvertisements = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const { page = 1, limit = 10, status } = req.query;
        // بناء الفلتر - عرض جميع إعلانات المستخدم بما فيها التي تنتظر الموافقة
        const filter = { userId: req.user._id };
        if (status) {
            filter.status = status;
        }
        // الحصول على إجمالي عدد الإعلانات
        const total = await Advertisement_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب إعلانات المستخدم مع الترتيب حسب الأحدث
        const advertisements = await Advertisement_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
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
        console.error('خطأ في الحصول على إعلانات المستخدم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getUserAdvertisements = getUserAdvertisements;
const updateAdvertisement = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        let advertisement = await Advertisement_1.default.findById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // التحقق من أن الإعلان ينتمي للمستخدم
        if (advertisement.userId.toString() !== authReq.user.id) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن تعديل إعلان ينتمي لمستخدم آخر'
            });
        }
        // معالجة الصور الجديدة إذا وجدت
        if (req.files && req.files.length > 0) {
            const files = req.files;
            const newImagePaths = await (0, fileUploadService_1.uploadImages)(files);
            // دمج الصور الجديدة مع الصور الحالية
            const updatedImages = [...advertisement.images, ...newImagePaths];
            req.body.images = updatedImages;
        }
        // تحديث الإعلان
        advertisement = await Advertisement_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        // استدعاء خدمة المطابقة في حالة تحديث الإعلان
        await (0, matchingService_1.checkForMatches)(advertisement._id.toString());
        return res.status(200).json({
            success: true,
            data: advertisement
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'فشل في تحديث الإعلان',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.updateAdvertisement = updateAdvertisement;
const deleteAdvertisement = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const advertisement = await Advertisement_1.default.findById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // التحقق من أن الإعلان ينتمي للمستخدم
        if (advertisement.userId.toString() !== authReq.user.id) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن حذف إعلان ينتمي لمستخدم آخر'
            });
        }
        await Advertisement_1.default.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'تم حذف الإعلان بنجاح'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'فشل في حذف الإعلان',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.deleteAdvertisement = deleteAdvertisement;
const markAsResolved = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        let advertisement = await Advertisement_1.default.findById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // التحقق من أن الإعلان ينتمي للمستخدم
        if (advertisement.userId.toString() !== authReq.user.id) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن تحديث حالة إعلان ينتمي لمستخدم آخر'
            });
        }
        // تحديث حالة الإعلان
        const isResolved = req.body.isResolved === true;
        advertisement = await Advertisement_1.default.findByIdAndUpdate(req.params.id, {
            status: isResolved ? AdvertisementStatus.RESOLVED : AdvertisementStatus.APPROVED,
            isResolved: isResolved,
            resolvedAt: isResolved ? new Date() : null
        }, {
            new: true,
            runValidators: true
        });
        const message = isResolved
            ? 'تم تحديث حالة الإعلان إلى "تم الحل" بنجاح'
            : 'تم إعادة فتح الإعلان بنجاح';
        return res.status(200).json({
            success: true,
            message: message,
            data: advertisement
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'فشل في تحديث حالة الإعلان',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.markAsResolved = markAsResolved;
const getConstants = async (req, res) => {
    try {
        const constants = {
            types: Object.values(Advertisement_1.AdvertisementType).map(type => ({
                value: type,
                label: type === 'lost' ? 'مفقود' : 'موجود'
            })),
            categories: Object.values(Advertisement_1.ItemCategory).map(category => {
                let label = '';
                switch (category) {
                    case 'passport':
                        label = 'جواز سفر';
                        break;
                    case 'national_id':
                        label = 'بطاقة وطنية';
                        break;
                    case 'driving_license':
                        label = 'اجازة سوق';
                        break;
                    case 'other':
                        label = 'أخرى';
                        break;
                }
                return { value: category, label };
            }),
            governorates: Object.values(Advertisement_1.Governorate).map(gov => {
                // تحويل قيم المحافظات إلى أسماء عربية
                let label = '';
                switch (gov) {
                    case 'baghdad':
                        label = 'بغداد';
                        break;
                    case 'basra':
                        label = 'البصرة';
                        break;
                    case 'erbil':
                        label = 'أربيل';
                        break;
                    case 'sulaymaniyah':
                        label = 'السليمانية';
                        break;
                    case 'duhok':
                        label = 'دهوك';
                        break;
                    case 'nineveh':
                        label = 'نينوى';
                        break;
                    case 'kirkuk':
                        label = 'كركوك';
                        break;
                    case 'diyala':
                        label = 'ديالى';
                        break;
                    case 'anbar':
                        label = 'الأنبار';
                        break;
                    case 'babil':
                        label = 'بابل';
                        break;
                    case 'karbala':
                        label = 'كربلاء';
                        break;
                    case 'najaf':
                        label = 'النجف';
                        break;
                    case 'wasit':
                        label = 'واسط';
                        break;
                    case 'muthanna':
                        label = 'المثنى';
                        break;
                    case 'diwaniyah':
                        label = 'الديوانية';
                        break;
                    case 'maysan':
                        label = 'ميسان';
                        break;
                    case 'dhiqar':
                        label = 'ذي قار';
                        break;
                    case 'saladin':
                        label = 'صلاح الدين';
                        break;
                    default: label = gov;
                }
                return { value: gov, label };
            })
        };
        return res.status(200).json({
            success: true,
            data: constants
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على القيم الثابتة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
};
exports.getConstants = getConstants;
const removeImage = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user || !authReq.user.id) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        const { id } = req.params;
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تقديم رابط الصورة المراد حذفها'
            });
        }
        // البحث عن الإعلان
        const advertisement = await Advertisement_1.default.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // التحقق من أن الإعلان ينتمي للمستخدم
        if (advertisement.userId.toString() !== authReq.user.id) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن تعديل إعلان ينتمي لمستخدم آخر'
            });
        }
        // حذف الصورة من المصفوفة
        advertisement.images = advertisement.images.filter(img => img !== imageUrl);
        await advertisement.save();
        return res.status(200).json({
            success: true,
            message: 'تم حذف الصورة بنجاح',
            data: advertisement
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'فشل في حذف الصورة',
            error: error.message || 'خطأ غير معروف'
        });
    }
};
exports.removeImage = removeImage;
//# sourceMappingURL=advertisementController.js.map