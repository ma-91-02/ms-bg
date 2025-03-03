"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// استخدام التعريف المشترك من types/express.d.ts بدلاً من التعريف المحلي
// عندما يتم استخدام الملف المشترك، لا نحتاج لإعادة تعريف الواجهة هنا
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    if (!token) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'default-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // استخدام نفس هيكل البيانات المعرف في types/express.d.ts
        req.user = {
            id: decoded.id
        };
        next();
    }
    catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        return res.status(401).json({ message: 'غير مصرح به' });
    }
};
exports.authenticateToken = authenticateToken;
