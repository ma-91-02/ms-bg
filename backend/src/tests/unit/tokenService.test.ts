import TokenService from '../../services/common/tokenService';
import jwt from 'jsonwebtoken';

// محاكاة عمل jwt لتجنب الاعتماد على المفتاح السري الحقيقي
jest.mock('jsonwebtoken');

describe('TokenService', () => {
  // الإعداد: تعيين القيم قبل كل اختبار
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '1h';
    
    // إعادة تعيين المحاكاة
    (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
      return 'mocked_token';
    });
    
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === 'valid_token') {
        return { id: 'user123', role: 'user' };
      } else {
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
    
    const token = TokenService.generateToken(payload, secret, expiresIn);
    
    expect(token).toBe('mocked_token');
    expect(jwt.sign).toHaveBeenCalledWith(
      payload,
      secret,
      { expiresIn }
    );
  });
  
  // اختبار التحقق من التوكن
  test('verifyToken يجب أن يعيد البيانات المشفرة من التوكن الصالح', () => {
    const secret = process.env.JWT_SECRET || 'test_secret';
    const payload = TokenService.verifyToken('valid_token', secret);
    
    expect(payload).toEqual({ id: 'user123', role: 'user' });
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', secret);
  });
  
  // اختبار رفض التوكن غير الصالح
  test('verifyToken يجب أن يرفض التوكن غير الصالح', () => {
    const secret = process.env.JWT_SECRET || 'test_secret';
    
    expect(() => {
      TokenService.verifyToken('invalid_token', secret);
    }).toThrow();
  });
}); 