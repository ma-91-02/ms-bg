import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { sanitizeUser } from '../../services/common/userService';

/**
 * وسائط المصادقة.
 *
 * كانت موزّعة على أربعة ملفات، كلٌّ منها يتحقق من التوكن بقيمة احتياطية
 * مختلفة لـ JWT_SECRET ('default-secret-key' · 'default-secret' ·
 * 'your_jwt_secret' · 'your-secret-key'). أي غياب للمتغير في الإنتاج كان
 * يعني توكنات قابلة للتزوير. صار مصدر السر واحدًا وبلا قيمة احتياطية.
 */

interface JwtPayload {
  id?: string;
  userId?: string;
  role?: string;
  username?: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // خطأ إعداد لا خطأ مصادقة — يجب أن يظهر بوضوح لا أن يُتجاوَز بقيمة افتراضية
    throw new Error('JWT_SECRET غير مضبوط — لا يمكن التحقق من التوكنات');
  }
  return secret;
};

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

const unauthorized = (res: Response, message: string) =>
  res.status(401).json({ success: false, message });

/** يفكّ التوكن ويعيد الحمولة، أو null إن كان غير صالح/منتهيًا */
const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      return null;
    }
    throw error; // خطأ إعداد — يُمرَّر لمعالج الأخطاء
  }
};

/** حماية مسارات تطبيق الجوال */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized(res, 'غير مصرح به. يرجى تسجيل الدخول');

    const decoded = decodeToken(token);
    if (!decoded) return unauthorized(res, 'توكن غير صالح أو منتهي الصلاحية');

    const userId = decoded.id || decoded.userId;
    if (!userId) return unauthorized(res, 'توكن غير صالح');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return unauthorized(res, 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى');

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'تم حظر حسابك. يرجى التواصل مع الدعم',
      });
    }

    // بلا كلمة المرور — كان `.select('-password')` في نسخة Mongoose
    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
};

/** حماية مسارات لوحة التحكم */
export const adminProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized(res, 'غير مصرح به. يرجى تسجيل الدخول');

    const decoded = decodeToken(token);
    if (!decoded?.id) return unauthorized(res, 'توكن غير صالح أو منتهي الصلاحية');

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return unauthorized(res, 'المشرف غير موجود. يرجى تسجيل الدخول مرة أخرى');

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'تم تعطيل حسابك. يرجى التواصل مع المشرف الأعلى',
      });
    }

    const { password, ...safeAdmin } = admin;
    req.admin = safeAdmin;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default { protect, adminProtect };
