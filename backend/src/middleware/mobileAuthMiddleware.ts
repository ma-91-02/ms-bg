import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/mobile/User';

// ملاحظة: لا نقوم بإعادة تعريف req.user هنا لأننا نستخدم الآن التعريف المشترك في types/express.d.ts

export const protectMobile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // استخراج التوكن من الهيدر
    const authHeader = req.headers['authorization'];
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
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret) as { id: string };
    
    // التحقق من وجود المستخدم
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم المرتبط بهذا التوكن لم يعد موجوداً'
      });
    }
    
    // تعيين معلومات المستخدم
    req.user = {
      id: currentUser._id.toString()
    };
    req.userDocument = currentUser;
    
    next();
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return res.status(401).json({
      success: false,
      message: 'غير مصرح به - التوكن غير صالح'
    });
  }
}; 