import jwt from 'jsonwebtoken';

/**
 * نوع البيانات المخزنة في التوكن
 */
export interface TokenPayload {
  id: string;
  [key: string]: any;
}

/**
 * خدمة مركزية لإدارة توكن المصادقة
 */
export class TokenService {
  /**
   * إنشاء JWT توكن جديد
   * @param payload - البيانات المراد إرسالها في التوكن
   * @param secret - المفتاح الذي سيتم استخدامه لتوليد التوكن
   * @param expiresIn - مدة صلاحية التوكن
   * @returns توكن JWT
   */
  static generateToken(payload: TokenPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * التحقق من صحة التوكن
   * @param token - توكن JWT للتحقق
   * @param secret - المفتاح الذي سيتم استخدامه للتحقق
   * @returns البيانات المشفرة في التوكن
   */
  static verifyToken(token: string, secret: string): TokenPayload {
    try {
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      throw new Error('توكن غير صالح أو منتهي الصلاحية');
    }
  }
}

export default TokenService;
