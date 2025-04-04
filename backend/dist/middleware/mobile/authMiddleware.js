"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectMobile = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/mobile/User"));
/**
 * وسيط حماية مسارات التطبيق المحمول
 * يتحقق من وجود توكن JWT وإضافة المستخدم إلى الطلب
 */
const protectMobile = async (req, res, next) => {
    var _a, _b;
    try {
        let token;
        // التحقق من وجود توكن في الهيدر
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يرجى تسجيل الدخول'
            });
        }
        // التحقق من صحة التوكن
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        // البحث عن المستخدم
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى'
            });
        }
        // التحقق من حالة حظر المستخدم
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'تم حظر حسابك. يرجى التواصل مع الدعم'
            });
        }
        // إرفاق المستخدم بالطلب مع تحويل القيم بأمان
        req.user = {
            _id: ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
            id: ((_b = user._id) === null || _b === void 0 ? void 0 : _b.toString()) || '',
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            email: user.email,
            role: user.isAdmin ? 'admin' : 'user'
        };
        return next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'توكن غير صالح. يرجى تسجيل الدخول مرة أخرى'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية التوكن. يرجى تسجيل الدخول مرة أخرى'
            });
        }
        console.error('خطأ في middleware التوثيق:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في التوثيق'
        });
    }
};
exports.protectMobile = protectMobile;
exports.default = {
    protectMobile: exports.protectMobile
};
//# sourceMappingURL=authMiddleware.js.map