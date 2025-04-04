"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementStatus = exports.AdvertisementType = void 0;
// أنواع الإعلانات
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
    AdvertisementStatus["REJECTED"] = "rejected";
})(AdvertisementStatus || (exports.AdvertisementStatus = AdvertisementStatus = {}));
//# sourceMappingURL=advertisement.js.map