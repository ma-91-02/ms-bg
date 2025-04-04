"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/mobile/User"));
// وظيفة حماية المسارات
const protect = async (req, res, next) => {
    try {
        let token;
        // التحقق من وجود رمز المصادقة في رأس الطلب
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // التحقق من وجود الرمز
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح لك بالوصول إلى هذا المسار'
            });
        }
        try {
            // التحقق من صحة الرمز
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // جلب بيانات المستخدم
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'المستخدم غير موجود'
                });
            }
            // إضافة بيانات المستخدم إلى الطلب
            req.user = user;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'رمز المصادقة غير صالح'
            });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في المصادقة'
        });
    }
    return;
};
exports.protect = protect;
//# sourceMappingURL=auth.js.map