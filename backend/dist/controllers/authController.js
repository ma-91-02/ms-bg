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
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
// توحيد طريقة إنشاء التوكن
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    try {
        return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });
    }
    catch (error) {
        console.error('خطأ في إنشاء التوكن:', error);
        throw new Error('خطأ في إنشاء التوكن JWT');
    }
};
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // 1) التحقق من وجود اسم المستخدم وكلمة المرور
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال اسم المستخدم وكلمة المرور'
            });
        }
        // 2) التحقق من وجود الأدمن وصحة كلمة المرور
        const admin = yield Admin_1.default.findOne({ username }).select('+password');
        if (!admin || !(yield admin.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
        // 3) إنشاء توكن JWT
        const token = signToken(admin._id.toString());
        // 4) إرسال الرد
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: admin._id,
                username: admin.username
            }
        });
    }
    catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});
exports.login = login;
