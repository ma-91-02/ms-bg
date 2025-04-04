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
exports.AdvertisementStatus = exports.Governorate = exports.ItemCategory = exports.AdvertisementType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// تعريف نوع الإعلان (مفقود أو موجود)
var AdvertisementType;
(function (AdvertisementType) {
    AdvertisementType["LOST"] = "lost";
    AdvertisementType["FOUND"] = "found";
})(AdvertisementType || (exports.AdvertisementType = AdvertisementType = {}));
// تعريف فئة العنصر
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["PASSPORT"] = "passport";
    ItemCategory["NATIONAL_ID"] = "national_id";
    ItemCategory["DRIVING_LICENSE"] = "driving_license";
    ItemCategory["OTHER"] = "other";
})(ItemCategory || (exports.ItemCategory = ItemCategory = {}));
// قائمة المحافظات
var Governorate;
(function (Governorate) {
    Governorate["BAGHDAD"] = "baghdad";
    Governorate["BASRA"] = "basra";
    Governorate["ERBIL"] = "erbil";
    Governorate["SULAYMANIYAH"] = "sulaymaniyah";
    Governorate["DUHOK"] = "duhok";
    Governorate["NINEVEH"] = "nineveh";
    Governorate["KIRKUK"] = "kirkuk";
    Governorate["DIYALA"] = "diyala";
    Governorate["ANBAR"] = "anbar";
    Governorate["BABIL"] = "babil";
    Governorate["KARBALA"] = "karbala";
    Governorate["NAJAF"] = "najaf";
    Governorate["WASIT"] = "wasit";
    Governorate["MUTHANNA"] = "muthanna";
    Governorate["DIWANIYAH"] = "diwaniyah";
    Governorate["MAYSAN"] = "maysan";
    Governorate["DHIQAR"] = "dhiqar";
    Governorate["SALADIN"] = "saladin";
})(Governorate || (exports.Governorate = Governorate = {}));
// حالة الإعلان
var AdvertisementStatus;
(function (AdvertisementStatus) {
    AdvertisementStatus["PENDING"] = "pending";
    AdvertisementStatus["APPROVED"] = "approved";
    AdvertisementStatus["REJECTED"] = "rejected";
    AdvertisementStatus["RESOLVED"] = "resolved"; // تم حله (وجد صاحبه)
})(AdvertisementStatus || (exports.AdvertisementStatus = AdvertisementStatus = {}));
// مخطط الإعلان
const advertisementSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المستخدم مطلوب']
    },
    type: {
        type: String,
        enum: Object.values(AdvertisementType),
        required: [true, 'نوع الإعلان مطلوب (مفقود/موجود)']
    },
    category: {
        type: String,
        enum: Object.values(ItemCategory),
        required: [true, 'فئة العنصر مطلوبة']
    },
    governorate: {
        type: String,
        enum: Object.values(Governorate),
        required: [true, 'المحافظة مطلوبة']
    },
    ownerName: {
        type: String,
        // اختياري حسب الحالة
    },
    itemNumber: {
        type: String,
        // اختياري حسب الحالة
    },
    description: {
        type: String,
        required: [true, 'وصف العنصر مطلوب']
    },
    images: {
        type: [String],
        default: []
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    contactPhone: {
        type: String,
        required: [true, 'رقم الاتصال مطلوب']
    },
    status: {
        type: String,
        enum: Object.values(AdvertisementStatus),
        default: AdvertisementStatus.PENDING
    },
    isApproved: {
        type: Boolean,
        default: false // تعيين افتراضي: الإعلان يحتاج موافقة
    },
    approvedAt: Date,
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectionReason: String,
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedAt: Date,
    hideContactInfo: {
        type: Boolean,
        default: true // إخفاء معلومات التواصل افتراضيًا
    }
}, {
    timestamps: true
});
// إضافة مؤشر جغرافي للبحث حسب الموقع
advertisementSchema.index({ location: '2dsphere' });
const Advertisement = mongoose_1.default.model('Advertisement', advertisementSchema);
exports.default = Advertisement;
//# sourceMappingURL=Advertisement.js.map