/**
 * رموز التحقق OTP — تعريفات النوع.
 * الجدول معرَّف في `prisma/schema.prisma`؛ الوصول عبر `prisma.otp.*` و`otpService`.
 *
 * فارقان عن نسخة Mongo:
 *  - الرمز يُخزَّن مشفّرًا بـ bcrypt لا كنص صريح.
 *  - انتهاء الصلاحية كان TTL تلقائيًا في Mongo (expires: 900)؛ في Postgres
 *    يتولاه `otpService.purgeExpired()` ويُستدعى دوريًا.
 */
import type { Otp as PrismaOtp } from '@prisma/client';

export type IOtp = PrismaOtp;
