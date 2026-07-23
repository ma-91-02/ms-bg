import { Request, Response, NextFunction } from 'express';
import { adminProtect } from '../common/authMiddleware';

export interface AdminAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * كان `authenticateAdmin` يثق بحقل `role` المكتوب داخل التوكن دون أي
 * استعلام لقاعدة البيانات — أي أن مشرفًا مُعطَّلًا أو محذوفًا يظل قادرًا
 * على الدخول حتى انتهاء صلاحية توكنه (30 يومًا).
 * صار الاسمان يشيران إلى `adminProtect` الذي يتحقق من الوجود والحالة فعليًا.
 */
export const authenticateAdmin = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => adminProtect(req, res, next);

export const protectAdmin = adminProtect;

export default { authenticateAdmin, protectAdmin };
