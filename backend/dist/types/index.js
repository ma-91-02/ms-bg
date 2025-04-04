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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementCategory = exports.AdvertisementStatus = exports.AdvertisementType = exports.DOCUMENT_TYPES = exports.ITEM_CATEGORIES = void 0;
/**
 * أنواع فئات الأغراض المفقودة/الموجودة
 */
exports.ITEM_CATEGORIES = [
    'وثائق',
    'إلكترونيات',
    'مجوهرات',
    'حقائب',
    'ملابس',
    'مفاتيح',
    'نقود',
    'أخرى'
];
/**
 * أنواع الوثائق
 */
exports.DOCUMENT_TYPES = [
    'هوية وطنية',
    'رخصة قيادة',
    'جواز سفر',
    'بطاقة عائلية',
    'إقامة',
    'بطاقة جامعية',
    'أخرى'
];
/**
 * أنواع مشتركة للتطبيق
 */
// نوع الإعلان (مفقود/موجود)
var AdvertisementType;
(function (AdvertisementType) {
    AdvertisementType["LOST"] = "lost";
    AdvertisementType["FOUND"] = "found";
})(AdvertisementType || (exports.AdvertisementType = AdvertisementType = {}));
// حالة الإعلان
var AdvertisementStatus;
(function (AdvertisementStatus) {
    AdvertisementStatus["PENDING"] = "pending";
    AdvertisementStatus["ACTIVE"] = "active";
    AdvertisementStatus["RESOLVED"] = "resolved";
    AdvertisementStatus["REJECTED"] = "rejected"; // مرفوض
})(AdvertisementStatus || (exports.AdvertisementStatus = AdvertisementStatus = {}));
// فئات الإعلانات
var AdvertisementCategory;
(function (AdvertisementCategory) {
    AdvertisementCategory["ELECTRONICS"] = "electronics";
    AdvertisementCategory["DOCUMENTS"] = "documents";
    AdvertisementCategory["PERSONAL_ITEMS"] = "personal_items";
    AdvertisementCategory["PETS"] = "pets";
    AdvertisementCategory["OTHERS"] = "others"; // أخرى
})(AdvertisementCategory || (exports.AdvertisementCategory = AdvertisementCategory = {}));
// أي أنواع أخرى مشتركة يمكن إضافتها هنا 
// إعادة تصدير جميع الأنواع المشتركة
__exportStar(require("./common/index"), exports);
__exportStar(require("./mobile/user"), exports);
__exportStar(require("./mobile/advertisement"), exports);
__exportStar(require("./admin/admin"), exports);
//# sourceMappingURL=index.js.map