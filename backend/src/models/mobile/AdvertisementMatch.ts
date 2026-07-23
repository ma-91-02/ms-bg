/**
 * مطابقات الإعلانات — تعريفات النوع والتعدادات.
 * الجدول معرَّف في `prisma/schema.prisma`؛ الوصول عبر `prisma.advertisementMatch.*`.
 *
 * قيد `@@unique([lostAdvertisementId, foundAdvertisementId])` في المخطط
 * يجعل المطابقات المكررة مستحيلة على مستوى قاعدة البيانات.
 */
import { MatchStatus as PrismaMatchStatus } from '@prisma/client';
import type { AdvertisementMatch as PrismaAdvertisementMatch } from '@prisma/client';

export const MatchStatus = {
  PENDING: PrismaMatchStatus.pending,
  APPROVED: PrismaMatchStatus.approved,
  REJECTED: PrismaMatchStatus.rejected,
  COMPLETED: PrismaMatchStatus.completed,
} as const;
export type MatchStatus = PrismaMatchStatus;

export type IAdvertisementMatch = PrismaAdvertisementMatch;
