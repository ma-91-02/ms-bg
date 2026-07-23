import { Request } from 'express';
import type { User, Admin } from '@prisma/client';

/** المستخدم المرفق بالطلب — بلا كلمة المرور */
export type AuthenticatedUser = Omit<User, 'password'>;

/** المشرف المرفق بالطلب — بلا كلمة المرور */
export type AuthenticatedAdmin = Omit<Admin, 'password'>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      admin?: AuthenticatedAdmin;
    }
  }
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  admin?: AuthenticatedAdmin;
}

// للتوافق مع TypeScript module system
export {};
