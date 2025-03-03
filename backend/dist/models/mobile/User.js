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
const userSchema = new mongoose_1.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب'],
        unique: true,
        trim: true
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    userType: {
        type: String,
        enum: ['finder', 'loser']
    },
    name: {
        type: String
    },
    idNumber: {
        type: String
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// التحقق مما إذا كان OTP صالحًا ولم تنتهي صلاحيته
userSchema.methods.compareOTP = function (candidateOTP) {
    // إذا انتهت مدة صلاحية OTP
    if (this.otpExpires && this.otpExpires < new Date()) {
        return false;
    }
    // التحقق من مطابقة OTP
    return this.otp === candidateOTP;
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
