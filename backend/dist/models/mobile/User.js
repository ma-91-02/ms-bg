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
const userSchema = new mongoose_1.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'يرجى تقديم بريد إلكتروني صالح'
        }
    },
    password: {
        type: String,
        minlength: [6, 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل']
    },
    birthDate: {
        type: Date
    },
    address: {
        type: String
    },
    profileImage: {
        type: String
    },
    points: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    favorites: {
        type: [mongoose_1.default.Types.ObjectId],
        ref: 'Advertisement'
    }
}, {
    timestamps: true
});
// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
    const user = this;
    // فقط إذا تم تعديل كلمة المرور أو كانت جديدة
    if (user.password && (user.isModified('password') || user.isNew)) {
        try {
            const salt = await bcryptjs_1.default.genSalt(10);
            const hash = await bcryptjs_1.default.hash(user.password, salt);
            user.password = hash;
            next();
        }
        catch (error) {
            return next(error);
        }
    }
    else {
        return next();
    }
});
// طريقة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function (password) {
    try {
        // إذا لم يكن لدى المستخدم كلمة مرور (تم إنشاؤه من OTP فقط)
        if (!this.password) {
            return false;
        }
        return await bcryptjs_1.default.compare(password, this.password);
    }
    catch (error) {
        throw error;
    }
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map