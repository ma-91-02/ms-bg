import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin';

interface JwtPayload {
  id: string;
}

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const payload: JwtPayload = { id };
  const options: jwt.SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  };

  try {
    return jwt.sign(payload, secret);
  } catch (error) {
    throw new Error('Error signing JWT token');
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // التحقق من وجود اسم المستخدم وكلمة المرور
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم اسم المستخدم وكلمة المرور'
      });
    }
    
    // البحث عن المستخدم
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }
    
    // إنشاء التوكن
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '30d' }
    );
    
    // إرجاع التوكن ومعلومات المستخدم
    const responseData = {
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username
      }
    };
    
    console.log('Login response:', responseData);
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};