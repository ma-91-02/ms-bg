import { TokenService, TokenPayload } from '../../services/tokenService';
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
    const token = TokenService.generateToken('user123', 'user');
    
    expect(token).toBe('mocked_token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user123', role: 'user' },
      'test_secret',
      { expiresIn: '1h' }
    );
  });
  
  // اختبار التحقق من التوكن
  test('verifyToken يجب أن يعيد البيانات المشفرة من التوكن الصالح', () => {
    const payload = TokenService.verifyToken('valid_token');
    
    expect(payload).toEqual({ id: 'user123', role: 'user' });
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
  });
  
  // اختبار رفض التوكن غير الصالح
  test('verifyToken يجب أن يرفض التوكن غير الصالح', () => {
    expect(() => {
      TokenService.verifyToken('invalid_token');
    }).toThrow('توكن غير صالح أو منتهي الصلاحية');
  });
}); 