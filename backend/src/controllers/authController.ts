import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

// توحيد طريقة إنشاء التوكن
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  try {
    return jwt.sign(
      { id },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );
  } catch (error) {
    console.error('خطأ في إنشاء التوكن:', error);
    throw new Error('خطأ في إنشاء التوكن JWT');
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    
    // 1) التحقق من وجود اسم المستخدم وكلمة المرور
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال اسم المستخدم وكلمة المرور'
      });
    }
    
    // 2) التحقق من وجود الأدمن وصحة كلمة المرور
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }
    
    // 3) إنشاء توكن JWT
    const token = signToken(admin._id.toString());
    
    // 4) إرسال الرد
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};