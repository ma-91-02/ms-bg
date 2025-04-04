"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../../models/admin/Admin"));
/**
 * وسيط المصادقة للوحة الإدارة
 */
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح به'
        });
    }
    try {
        const secret = process.env.JWT_SECRET || 'default-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // التحقق من أن المستخدم هو مسؤول
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحيات كافية'
            });
        }
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        return res.status(401).json({
            success: false,
            message: 'غير مصرح به'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
/**
 * وسيط لحماية مسارات الأدمن (يتطلب تسجيل دخول المشرف)
 */
const protectAdmin = async (req, res, next) => {
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
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // البحث عن المشرف
        const admin = await Admin_1.default.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'المشرف غير موجود. يرجى تسجيل الدخول مرة أخرى'
            });
        }
        // التحقق من حالة المشرف
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'تم تعطيل حسابك. يرجى التواصل مع المشرف الأعلى'
            });
        }
        // إضافة المشرف إلى الطلب
        req.user = {
            _id: admin._id.toString(),
            id: admin._id.toString(),
            fullName: admin.fullName,
            username: admin.username,
            email: admin.email,
            role: admin.role
        };
        next();
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
        console.error('خطأ في وسيط المصادقة للأدمن:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في المصادقة'
        });
    }
};
exports.default = {
    authenticateAdmin: exports.authenticateAdmin,
    protectAdmin
};
//# sourceMappingURL=authMiddleware.js.map