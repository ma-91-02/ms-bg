import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// واجهة لإضافة خاصية user إلى الـ Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // الحصول على رأس التصريح
    const authHeader = req.headers['authorization'];
    
    // التحقق مما إذا كان التصريح موجودًا وبدأ بـ "Bearer "
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به - التوكن مفقود'
      });
    }

    // التحقق من صحة التوكن
    const secret = process.env.JWT_SECRET || 'your-default-secret-key';
    
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح به - التوكن غير صالح'
        });
      }

      // إضافة معلومات المستخدم إلى الطلب
      req.user = { id: decoded.id };
      next();
    });
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
}; 