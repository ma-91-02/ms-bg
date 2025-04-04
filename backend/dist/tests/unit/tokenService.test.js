"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService_1 = __importDefault(require("../../services/common/tokenService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// محاكاة عمل jwt لتجنب الاعتماد على المفتاح السري الحقيقي
jest.mock('jsonwebtoken');
describe('TokenService', () => {
    // الإعداد: تعيين القيم قبل كل اختبار
    beforeEach(() => {
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRES_IN = '1h';
        // إعادة تعيين المحاكاة
        jsonwebtoken_1.default.sign.mockImplementation((payload, secret, options) => {
            return 'mocked_token';
        });
        jsonwebtoken_1.default.verify.mockImplementation((token, secret) => {
            if (token === 'valid_token') {
                return { id: 'user123', role: 'user' };
            }
            else {
                throw new Error('توكن غير صالح');
            }
        });
    });
    // اختبار إنشاء التوكن
    test('generateToken يجب أن ينشئ توكن صالح', () => {
        // تحديث الوسائط لتتوافق مع تنفيذ TokenService
        const payload = { id: 'user123' };
        const secret = process.env.JWT_SECRET || 'test_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = tokenService_1.default.generateToken(payload, secret, expiresIn);
        expect(token).toBe('mocked_token');
        expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith(payload, secret, { expiresIn });
    });
    // اختبار التحقق من التوكن
    test('verifyToken يجب أن يعيد البيانات المشفرة من التوكن الصالح', () => {
        const secret = process.env.JWT_SECRET || 'test_secret';
        const payload = tokenService_1.default.verifyToken('valid_token', secret);
        expect(payload).toEqual({ id: 'user123', role: 'user' });
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid_token', secret);
    });
    // اختبار رفض التوكن غير الصالح
    test('verifyToken يجب أن يرفض التوكن غير الصالح', () => {
        const secret = process.env.JWT_SECRET || 'test_secret';
        expect(() => {
            tokenService_1.default.verifyToken('invalid_token', secret);
        }).toThrow();
    });
});
//# sourceMappingURL=tokenService.test.js.map