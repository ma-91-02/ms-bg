import { adminProtect } from '../common/authMiddleware';
import type { AuthRequest } from '../../types/express';

/**
 * كان `authenticateAdmin` يثق بحقل `role` المكتوب داخل التوكن دون أي
 * استعلام لقاعدة البيانات — أي أن مشرفًا مُعطَّلًا أو محذوفًا يظل قادرًا
 * على الدخول حتى انتهاء صلاحية توكنه (90 يومًا).
 * صار الاسمان يشيران إلى `adminProtect` الذي يتحقق من الوجود والحالة فعليًا.
 */
export type AdminAuthRequest = AuthRequest;

export const authenticateAdmin = adminProtect;
export const protectAdmin = adminProtect;

export default { authenticateAdmin, protectAdmin };
