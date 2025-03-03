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
const mongoose_1 = __importStar(require("mongoose"));
const reportSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: [true, 'نوع الإبلاغ مطلوب'],
        enum: ['lost', 'found']
    },
    title: {
        type: String,
        required: [true, 'عنوان الإبلاغ مطلوب'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'وصف الإبلاغ مطلوب'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'فئة المستند مطلوبة']
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: [true, 'الإحداثيات مطلوبة [الطول، العرض]']
        },
        address: {
            type: String,
            required: [true, 'العنوان مطلوب']
        }
    },
    date: {
        type: Date,
        required: [true, 'تاريخ الفقدان/العثور مطلوب']
    },
    images: [String],
    documentType: {
        type: String,
        required: [true, 'نوع المستند مطلوب']
    },
    documentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'المستخدم مطلوب']
    },
    contactInfo: {
        name: {
            type: String,
            required: [true, 'اسم جهة الاتصال مطلوب']
        },
        phoneNumber: {
            type: String,
            required: [true, 'رقم هاتف جهة الاتصال مطلوب']
        }
    }
}, {
    timestamps: true
});
// إضافة فهرس جغرافي للموقع
reportSchema.index({ location: '2dsphere' });
const Report = mongoose_1.default.model('Report', reportSchema);
exports.default = Report;
