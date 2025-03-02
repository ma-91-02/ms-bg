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
const signToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const payload = { id };
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    };
    try {
        return jsonwebtoken_1.default.sign(payload, secret);
    }
    catch (error) {
        throw new Error('Error signing JWT token');
    }
};
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // 1) التحقق من وجود اسم المستخدم وكلمة المرور
        if (!username || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'الرجاء إدخال اسم المستخدم وكلمة المرور'
            });
        }
        // 2) التحقق من وجود الأدمن وصحة كلمة المرور
        const admin = yield Admin_1.default.findOne({ username }).select('+password');
        if (!admin || !(yield admin.comparePassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
        // 3) إنشاء توكن JWT
        const token = signToken(admin._id.toString());
        return res.status(200).json({
            status: 'success',
            token,
            data: {
                admin: {
                    id: admin._id,
                    username: admin.username
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'خطأ في تسجيل الدخول'
        });
    }
});
exports.login = login;
