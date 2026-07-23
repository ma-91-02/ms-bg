import { Request } from 'express';
import type { User, Admin } from '@prisma/client';

/**
 * توسعة نوع طلب Express.
 *
 * دُمج هنا ما كان موزّعًا على `express.d.ts` و`express.ts` معًا — وجودهما
 * جنبًا إلى جنب كان يجعل ملف `.ts` يحجب توسعة `declare global` في `.d.ts`،
 * فلا يرى المُصرِّف `req.admin` إطلاقًا.
 */

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
