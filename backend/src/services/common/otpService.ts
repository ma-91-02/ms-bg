import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';

/**
 * خدمة رموز التحقق.
 *
 * ثلاثة فوارق عن نسخة Mongo:
 *  1. الرمز يُخزَّن مشفّرًا بـ bcrypt — كان نصًا صريحًا، فمن يقرأ قاعدة
 *     البيانات يستطيع انتحال أي حساب.
 *  2. عدّاد محاولات يبطل الرمز بعد 5 محاولات فاشلة — لم يكن هناك ما يمنع
 *     تخمين ستة أرقام.
 *  3. انتهاء الصلاحية كان TTL تلقائيًا في Mongo؛ في Postgres يتولاه
 *     `purgeExpired()`.
 */

const OTP_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

/** وضع الديمو — كان ثابتًا `const isDemoMode = true` مكرّرًا في 5 مواضع */
export const isDemoMode = (): boolean =>
  process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

export const DEMO_CODE = '000000';

export const generateCode = (): string =>
  isDemoMode() ? DEMO_CODE : Math.floor(100000 + Math.random() * 900000).toString();

/**
 * إنشاء رمز جديد لرقم هاتف.
 * يُبطل أي رموز سابقة غير مستعملة لنفس الرقم والغرض حتى لا يبقى أكثر
 * من رمز صالح في وقت واحد.
 */
export const issueOtp = async (
  phoneNumber: string,
  isForPasswordReset = false
): Promise<{ code: string; expiresAt: Date }> => {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.otp.updateMany({
      where: { phoneNumber, isForPasswordReset, isUsed: false },
      data: { isUsed: true },
    }),
    prisma.otp.create({
      data: {
        phoneNumber,
        code: await bcrypt.hash(code, 10),
        expiresAt,
        isForPasswordReset,
      },
    }),
  ]);

  return { code, expiresAt };
};

export type OtpFailureReason = 'not_found' | 'expired' | 'too_many_attempts' | 'invalid';

/**
 * نوع واحد بحقل اختياري بدل اتحاد مميَّز، لأن `strictNullChecks: false`
 * في tsconfig يمنع TypeScript من تضييق الاتحادات المميَّزة.
 */
export interface VerifyResult {
  ok: boolean;
  reason?: OtpFailureReason;
}

/**
 * التحقق من رمز واستهلاكه عند النجاح.
 * الرمز يُستهلك مرة واحدة فقط — كان الكود السابق لا يضبط `isUsed` إطلاقًا،
 * أي أن الرمز يظل صالحًا حتى انتهاء مدته مهما استُخدم.
 */
export const verifyOtp = async (
  phoneNumber: string,
  code: string,
  isForPasswordReset = false
): Promise<VerifyResult> => {
  if (isDemoMode() && code === DEMO_CODE) return { ok: true };

  const otp = await prisma.otp.findFirst({
    where: { phoneNumber, isForPasswordReset, isUsed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return { ok: false, reason: 'not_found' };
  if (otp.expiresAt < new Date()) return { ok: false, reason: 'expired' };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' };

  const matches = await bcrypt.compare(code, otp.code);

  if (!matches) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: 'invalid' };
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { isUsed: true } });
  return { ok: true };
};

/** حذف الرموز المنتهية — بديل TTL الذي كان Mongo يوفّره تلقائيًا */
export const purgeExpired = async (): Promise<number> => {
  const result = await prisma.otp.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
};

export default { issueOtp, verifyOtp, purgeExpired, isDemoMode, generateCode };
