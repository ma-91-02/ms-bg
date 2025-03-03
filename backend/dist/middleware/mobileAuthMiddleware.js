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
exports.protectMobile = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/mobile/User"));
// ملاحظة: لا نقوم بإعادة تعريف req.user هنا لأننا نستخدم الآن التعريف المشترك في types/express.d.ts
const protectMobile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // استخراج التوكن من الهيدر
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به - التوكن مفقود'
            });
        }
        // التحقق من صحة التوكن
        const secret = process.env.JWT_SECRET || 'default-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // التحقق من وجود المستخدم
        const currentUser = yield User_1.default.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم المرتبط بهذا التوكن لم يعد موجوداً'
            });
        }
        // تعيين معلومات المستخدم
        req.user = {
            id: currentUser._id.toString()
        };
        req.userDocument = currentUser;
        next();
    }
    catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        return res.status(401).json({
            success: false,
            message: 'غير مصرح به - التوكن غير صالح'
        });
    }
});
exports.protectMobile = protectMobile;
