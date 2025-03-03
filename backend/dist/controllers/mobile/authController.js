"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProfile = exports.verifyOTP = exports.sendOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/mobile/User"));
const smsService_1 = require("../../services/smsService");
// إنشاء JWT token
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'your-default-secret-key';
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: '30d' });
};
// إرسال رمز OTP
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        // التحقق من صحة رقم الهاتف
        if (!phoneNumber || !/^\+[1-9]\d{10,14}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'رقم هاتف غير صالح. يجب أن يكون بتنسيق دولي مثل +9647123456789'
            });
        }
        // إنشاء رمز OTP (6 أرقام)
        const otp = (0, smsService_1.generateOTP)(6);
        // حفظ OTP في قاعدة البيانات مع وقت انتهاء الصلاحية (15 دقيقة)
        let user = yield User_1.default.findOne({ phoneNumber });
        if (!user) {
            // إنشاء مستخدم جديد إذا لم يكن موجودًا
            user = new User_1.default({
                phoneNumber,
                otp,
                otpExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 دقيقة
            });
        }
        else {
            // تحديث OTP للمستخدم الموجود
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        }
        yield user.save();
        // إرسال OTP عبر رسالة نصية
        const message = `رمز التحقق الخاص بك هو: ${otp}. يرجى استخدامه خلال 15 دقيقة.`;
        yield (0, smsService_1.sendSMS)(phoneNumber, message);
        return res.status(200).json({
            success: true,
            message: 'تم إرسال رمز التحقق بنجاح',
            data: {
                phoneNumber
            }
        });
    }
    catch (error) {
        console.error('خطأ في إرسال رمز التحقق:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إرسال رمز التحقق'
        });
    }
});
exports.sendOTP = sendOTP;
// التحقق من رمز OTP
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, otp } = req.body;
        // التحقق من وجود رقم الهاتف ورمز OTP
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف ورمز التحقق مطلوبان'
            });
        }
        // البحث عن المستخدم برقم الهاتف
        const user = yield User_1.default.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'رقم الهاتف غير مسجل'
            });
        }
        // التحقق من صحة OTP
        if (!user.compareOTP(otp)) {
            return res.status(401).json({
                success: false,
                message: 'رمز التحقق غير صحيح أو انتهت صلاحيته'
            });
        }
        // إنشاء JWT token
        const token = signToken(user._id.toString());
        // إزالة OTP بعد التحقق الناجح
        user.otp = undefined;
        user.otpExpires = undefined;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: 'تم التحقق بنجاح',
            token,
            data: {
                isProfileComplete: user.isProfileComplete,
                user: {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    name: user.name,
                    userType: user.userType
                }
            }
        });
    }
    catch (error) {
        console.error('خطأ في التحقق من رمز OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من رمز التحقق'
        });
    }
});
exports.verifyOTP = verifyOTP;
// إكمال ملف تعريف المستخدم
const completeProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userType, name, idNumber } = req.body;
        // تأكد من أن req.user موجود
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به - يرجى تسجيل الدخول'
            });
        }
        const userId = req.user.id;
        // التحقق من صحة نوع المستخدم
        if (!['finder', 'loser'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: 'نوع مستخدم غير صالح. يجب أن يكون إما finder أو loser'
            });
        }
        // تحديث ملف تعريف المستخدم
        const user = yield User_1.default.findByIdAndUpdate(userId, {
            userType,
            name,
            idNumber,
            isProfileComplete: true
        }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'تم تحديث الملف الشخصي بنجاح',
            data: {
                user: {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    name: user.name,
                    userType: user.userType,
                    isProfileComplete: user.isProfileComplete
                }
            }
        });
    }
    catch (error) {
        console.error('خطأ في تكملة الملف الشخصي:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الملف الشخصي'
        });
    }
});
exports.completeProfile = completeProfile;
