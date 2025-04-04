import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/mobile/User';

/**
 * وسيط حماية مسارات التطبيق المحمول
 * يتحقق من وجود توكن JWT وإضافة المستخدم إلى الطلب
 */
export const protectMobile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // التحقق من وجود توكن في الهيدر
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }
    
    // التحقق من صحة التوكن
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    
    // البحث عن المستخدم
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى'
      });
    }
    
    // التحقق من حالة حظر المستخدم
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'تم حظر حسابك. يرجى التواصل مع الدعم'
      });
    }
    
    // إرفاق المستخدم بالطلب مع تحويل القيم بأمان
    req.user = {
      _id: user._id?.toString() || '',
      id: user._id?.toString() || '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      email: user.email,
      role: user.isAdmin ? 'admin' : 'user'
    };
    
    return next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'توكن غير صالح. يرجى تسجيل الدخول مرة أخرى'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية التوكن. يرجى تسجيل الدخول مرة أخرى'
      });
    }
    
    console.error('خطأ في middleware التوثيق:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في التوثيق'
    });
  }
};

export default {
  protectMobile
}; 