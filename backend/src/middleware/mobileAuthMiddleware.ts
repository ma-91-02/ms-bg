import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/mobile/User';
import { AuthRequest } from '../types/express';

/**
 * وسيط حماية مسارات التطبيق المحمول
 * يتحقق من وجود توكن JWT وإضافة المستخدم إلى الطلب
 */
export const protectMobile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // تحقق من وجود التوكن في هيدر Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(' ')[1];

      // فك تشفير التوكن
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      // البحث عن المستخدم استناداً إلى معرف المستخدم في التوكن
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      next();
    } catch (error) {
      console.error('خطأ في التحقق من التوكن:', error);
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. التوكن غير صالح أو منتهي الصلاحية'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح به. يرجى تسجيل الدخول'
    });
  }
};

/**
 * وسيط للتحقق من دور المستخدم
 * @param roles الأدوار المسموح بها
 */
export const checkRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }

    next();
  };
};

export default {
  protectMobile,
  checkRole
}; 