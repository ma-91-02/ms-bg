import jwt from 'jsonwebtoken';

/**
 * نوع البيانات المخزنة في التوكن
 */
export interface TokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * خدمة مركزية لإدارة توكن المصادقة
 */
export class TokenService {
  /**
   * إنشاء JWT توكن جديد
   * @param id - معرف المستخدم أو المسؤول
   * @param role - دور المستخدم (user/admin)
   * @param expiresIn - مدة صلاحية التوكن
   * @returns توكن JWT
   */
  static generateToken(
    id: string, 
    role: string = 'user', 
    expiresIn: string = process.env.JWT_EXPIRES_IN || '30d'
  ): string {
    return jwt.sign(
      { id, role } as TokenPayload,
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
      { expiresIn }
    );
  }

  /**
   * التحقق من صحة التوكن
   * @param token - توكن JWT للتحقق
   * @returns البيانات المشفرة في التوكن
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
      ) as TokenPayload;
    } catch (error) {
      throw new Error('توكن غير صالح أو منتهي الصلاحية');
    }
  }
}

export default TokenService;
