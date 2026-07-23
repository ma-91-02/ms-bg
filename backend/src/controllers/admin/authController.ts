import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { verifyPassword } from '../../services/common/userService';

/**
 * مصادقة لوحة التحكم.
 *
 * أُزيل من هنا باب خلفي: كان الكود يقبل الدخول بـ username='admin'
 * وpassword='admin' متى كان ADMIN_PASSWORD='admin'، ثم يعيد كتابة كلمة
 * المرور المشفَّرة. كان التفافًا على علّة التشفير المزدوج في مخطط Mongoose
 * — وقد عولجت العلّة نفسها في `setupAdmin`، فلم يعد للباب الخلفي مبرر.
 */

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET غير مضبوط — لا يمكن إصدار التوكنات');
  }
  return jwt.sign({ id, role: 'admin' }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم اسم المستخدم وكلمة المرور',
      });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    // رسالة واحدة للحالتين حتى لا يكشف الرد أي أسماء المستخدمين موجودة
    const invalid = () =>
      res.status(401).json({
        success: false,
        message: 'خطأ في اسم المستخدم أو كلمة المرور',
      });

    if (!admin) return invalid();

    const isMatch = await verifyPassword(password, admin.password);
    if (!isMatch) return invalid();

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'تم تعطيل حسابك. يرجى التواصل مع المشرف الأعلى',
      });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: signToken(admin.id),
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('❌ خطأ في تسجيل دخول المشرف:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
    });
  }
};

export const validateToken = async (req: Request, res: Response): Promise<Response> => {
  // الوصول إلى هنا يعني أن الوسيط تحقق من التوكن بالفعل
  return res.status(200).json({
    success: true,
    message: 'التوكن صالح',
    admin: req.admin ?? null,
  });
};
