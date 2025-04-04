"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * خدمة مركزية لإدارة توكن المصادقة
 */
class TokenService {
    /**
     * إنشاء JWT توكن جديد
     * @param payload - البيانات المراد إرسالها في التوكن
     * @param secret - المفتاح الذي سيتم استخدامه لتوليد التوكن
     * @param expiresIn - مدة صلاحية التوكن
     * @returns توكن JWT
     */
    static generateToken(payload, secret, expiresIn) {
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    /**
     * التحقق من صحة التوكن
     * @param token - توكن JWT للتحقق
     * @param secret - المفتاح الذي سيتم استخدامه للتحقق
     * @returns البيانات المشفرة في التوكن
     */
    static verifyToken(token, secret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            throw new Error('توكن غير صالح أو منتهي الصلاحية');
        }
    }
}
exports.TokenService = TokenService;
exports.default = TokenService;
//# sourceMappingURL=tokenService.js.map