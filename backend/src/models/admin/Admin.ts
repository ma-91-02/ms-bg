/**
 * المشرفون — تعريفات النوع والتعدادات.
 *
 * علة أُصلحت هنا: مخطط Mongoose السابق كان يشفّر كلمة المرور في
 * `pre('save')` بينما كان `setupAdmin` و`index.ts` يشفّرانها قبل الحفظ —
 * أي تشفير مزدوج يجعل الدخول مستحيلًا، ولهذا أُضيف باب خلفي في
 * `comparePassword` يقبل كلمة 'admin' حرفيًا. التشفير الآن يحدث مرة
 * واحدة في `adminService`، والباب الخلفي أُزيل.
 */
import { AdminRole as PrismaAdminRole } from '@prisma/client';
import type { Admin as PrismaAdmin } from '@prisma/client';

export const AdminRole = {
  SUPERADMIN: PrismaAdminRole.superadmin,
  ADMIN: PrismaAdminRole.admin,
  MODERATOR: PrismaAdminRole.moderator,
} as const;
export type AdminRole = PrismaAdminRole;

export type IAdmin = PrismaAdmin;
