import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin/Admin';

/**
 * واجهة طلب المصادقة المخصصة للإدارة
 */
export interface AdminAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * وسيط المصادقة للوحة الإدارة
 */
export const authenticateAdmin = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'غير مصرح به' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded: any = jwt.verify(token, secret);
    
    // التحقق من أن المستخدم هو مسؤول
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحيات كافية'
      });
    }
    
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return res.status(401).json({
      success: false,
      message: 'فشل في المصادقة'
    });
  }
  return;
};

/**
 * وسيط لحماية مسارات الأدمن (يتطلب تسجيل دخول المشرف)
 */
const protectAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    
    // البحث عن المشرف
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'المشرف غير موجود. يرجى تسجيل الدخول مرة أخرى'
      });
    }
    
    // التحقق من حالة المشرف
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'تم تعطيل حسابك. يرجى التواصل مع المشرف الأعلى'
      });
    }
    
    // إضافة المشرف إلى الطلب
    req.admin = {
      _id: String(admin._id),
      id: String(admin._id),
      username: admin.username,
      role: admin.role
    };
    
    next();
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
    
    console.error('خطأ في وسيط المصادقة للأدمن:', error);
    return res.status(401).json({
      success: false,
      message: 'غير مصرح به'
    });
  }
  return;
};

export default {
  authenticateAdmin,
  protectAdmin
}; 