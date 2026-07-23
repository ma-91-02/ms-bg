import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import type { User } from '@prisma/client';

/**
 * خدمة المستخدمين.
 *
 * كانت هذه المنطقيات موزّعة على hooks في مخطط Mongoose
 * (`pre('save')` و `methods.comparePassword`). مع Prisma لا توجد hooks،
 * وهذا مقصود: التشفير يحدث في مكان واحد صريح بدل أن يكون أثرًا جانبيًا
 * خفيًا للحفظ — وهو ما سبّب مشكلة التشفير المزدوج في الكود السابق.
 */

const SALT_ROUNDS = 10;

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = async (
  plain: string,
  hashed: string | null
): Promise<boolean> => {
  // مستخدم أُنشئ عبر OTP فقط وليس له كلمة مرور
  if (!hashed) return false;
  return bcrypt.compare(plain, hashed);
};

/** حذف حقل كلمة المرور قبل إرسال المستخدم في أي استجابة */
export const sanitizeUser = <T extends Partial<User>>(user: T): Omit<T, 'password'> => {
  const { password, ...safe } = user as T & { password?: string | null };
  return safe as Omit<T, 'password'>;
};

export const findByPhone = (phoneNumber: string) =>
  prisma.user.findUnique({ where: { phoneNumber } });

export const findById = (id: string) => prisma.user.findUnique({ where: { id } });

/**
 * إنشاء مستخدم أو جلبه إن كان موجودًا — يحل محل نمط
 * `findOne() ثم new User() ثم save()` المتكرر في authController.
 */
export const findOrCreateByPhone = (phoneNumber: string) =>
  prisma.user.upsert({
    where: { phoneNumber },
    update: {},
    create: { phoneNumber, isProfileComplete: false },
  });

export const setPassword = async (userId: string, plain: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(plain) },
  });

/**
 * منح أو خصم نقاط ضمن معاملة ذرّية.
 *
 * هذا ما كان مستحيلًا فعليًا في الإعداد السابق: الرصيد وسجل الحركة
 * يتغيّران معًا أو لا يتغيّر أيٌّ منهما.
 */
export const adjustPoints = (
  userId: string,
  amount: number,
  reason: 'ad_created' | 'contact_confirmed' | 'item_returned' | 'monthly_active' | 'admin_adjustment' | 'reward_redeemed',
  referenceId?: string,
  note?: string
) =>
  prisma.$transaction(async (tx) => {
    await tx.pointsEntry.create({
      data: { userId, amount, reason, referenceId, note },
    });
    return tx.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });
  });

export default {
  hashPassword,
  verifyPassword,
  sanitizeUser,
  findByPhone,
  findById,
  findOrCreateByPhone,
  setPassword,
  adjustPoints,
};
