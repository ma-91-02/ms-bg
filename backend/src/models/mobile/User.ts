/**
 * المستخدمون — تعريفات النوع.
 *
 * تشفير كلمة المرور ومقارنتها كانا hooks على مخطط Mongoose
 * (`pre('save')` و `methods.comparePassword`)؛ انتقلا صراحةً إلى
 * `services/common/userService.ts`.
 */
import type { User as PrismaUser } from '@prisma/client';

export type IUser = PrismaUser;

/** المستخدم كما يُرسَل في استجابات الـ API — بلا كلمة المرور */
export type PublicUser = Omit<PrismaUser, 'password'>;
