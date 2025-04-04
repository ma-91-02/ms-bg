import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/mobile/User';

// تعريف واجهة للطلب مع إضافة حقل المستخدم
interface AuthRequest extends Request {
  user?: any;
}

// وظيفة حماية المسارات
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // التحقق من وجود رمز المصادقة في رأس الطلب
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذا المسار'
      });
    }

    try {
      // التحقق من صحة الرمز
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      // جلب بيانات المستخدم
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // إضافة بيانات المستخدم إلى الطلب
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في المصادقة'
    });
  }
  return;
}; 