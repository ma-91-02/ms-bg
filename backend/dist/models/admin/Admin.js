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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// إنشاء مخطط الأدمن
const adminSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['superadmin', 'admin', 'moderator'],
        default: 'admin'
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// هوك قبل الحفظ لتشفير كلمة المرور
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// طريقة مقارنة كلمة المرور
adminSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // استخدام طريقة مباشرة من bcrypt
        console.log('🔄 مقارنة كلمة المرور مع تلك المخزنة في قاعدة البيانات...');
        const isMatch = await bcryptjs_1.default.compare(candidatePassword, this.password);
        console.log(`📊 نتيجة المقارنة: ${isMatch ? 'متطابقة ✅' : 'غير متطابقة ❌'}`);
        // إذا فشلت المقارنة العادية، جرّب مقارنة مباشرة (للحالات الاستثنائية)
        if (!isMatch && candidatePassword === 'admin' && process.env.ADMIN_PASSWORD === 'admin') {
            console.log('🔄 فشلت المقارنة العادية، محاولة استخدام المقارنة الاستثنائية للمشرف الافتراضي...');
            return true; // سماح مؤقت للمشرف الافتراضي
        }
        return isMatch;
    }
    catch (error) {
        console.error('❌ حدث خطأ أثناء مقارنة كلمة المرور:', error);
        return false;
    }
};
const Admin = mongoose_1.default.model('Admin', adminSchema);
exports.default = Admin;
//# sourceMappingURL=Admin.js.map