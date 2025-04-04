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
exports.MatchStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING"] = "pending";
    MatchStatus["APPROVED"] = "approved";
    MatchStatus["REJECTED"] = "rejected";
    MatchStatus["COMPLETED"] = "completed"; // تم استكمال عملية الاسترجاع
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
const advertisementMatchSchema = new mongoose_1.Schema({
    lostAdvertisementId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Advertisement',
        required: [true, 'إعلان المفقود مطلوب']
    },
    foundAdvertisementId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Advertisement',
        required: [true, 'إعلان الموجود مطلوب']
    },
    matchScore: {
        type: Number,
        required: [true, 'درجة التطابق مطلوبة'],
        min: 0,
        max: 100
    },
    matchingFields: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: Object.values(MatchStatus),
        default: MatchStatus.PENDING
    },
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    notificationSent: {
        type: Boolean,
        default: false
    },
    notificationSentAt: Date,
    notes: String
}, {
    timestamps: true
});
// إضافة مؤشر على الإعلانات
advertisementMatchSchema.index({ lostAdvertisementId: 1, foundAdvertisementId: 1 }, { unique: true });
const AdvertisementMatch = mongoose_1.default.model('AdvertisementMatch', advertisementMatchSchema);
exports.default = AdvertisementMatch;
//# sourceMappingURL=AdvertisementMatch.js.map