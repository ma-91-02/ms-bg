/**
 * الإعلانات — تعريفات النوع والتعدادات.
 *
 * لم يعد هذا الملف يعرّف مخطط Mongoose؛ الجدول معرَّف في
 * `prisma/schema.prisma`. أُبقي المسار وأسماء التعدادات كما هي
 * (`AdvertisementType.LOST` بأحرف كبيرة) لأن عشرات المواضع تستوردها،
 * بينما القيم نفسها ('lost') تطابق تعداد Postgres حرفيًا.
 *
 * الوصول للبيانات: `prisma.advertisement.*` عبر `config/prisma`.
 */
import {
  AdvertisementType as PrismaAdType,
  ItemCategory as PrismaCategory,
  Governorate as PrismaGovernorate,
  AdvertisementStatus as PrismaAdStatus,
} from '@prisma/client';
import type { Advertisement as PrismaAdvertisement } from '@prisma/client';

export const AdvertisementType = {
  LOST: PrismaAdType.lost,
  FOUND: PrismaAdType.found,
} as const;
export type AdvertisementType = PrismaAdType;

export const ItemCategory = {
  PASSPORT: PrismaCategory.passport,
  NATIONAL_ID: PrismaCategory.national_id,
  DRIVING_LICENSE: PrismaCategory.driving_license,
  OTHER: PrismaCategory.other,
} as const;
export type ItemCategory = PrismaCategory;

export const Governorate = {
  BAGHDAD: PrismaGovernorate.baghdad,
  BASRA: PrismaGovernorate.basra,
  ERBIL: PrismaGovernorate.erbil,
  SULAYMANIYAH: PrismaGovernorate.sulaymaniyah,
  DUHOK: PrismaGovernorate.duhok,
  NINEVEH: PrismaGovernorate.nineveh,
  KIRKUK: PrismaGovernorate.kirkuk,
  DIYALA: PrismaGovernorate.diyala,
  ANBAR: PrismaGovernorate.anbar,
  BABIL: PrismaGovernorate.babil,
  KARBALA: PrismaGovernorate.karbala,
  NAJAF: PrismaGovernorate.najaf,
  WASIT: PrismaGovernorate.wasit,
  MUTHANNA: PrismaGovernorate.muthanna,
  DIWANIYAH: PrismaGovernorate.diwaniyah,
  MAYSAN: PrismaGovernorate.maysan,
  DHIQAR: PrismaGovernorate.dhiqar,
  SALADIN: PrismaGovernorate.saladin,
} as const;
export type Governorate = PrismaGovernorate;

export const AdvertisementStatus = {
  PENDING: PrismaAdStatus.pending,
  APPROVED: PrismaAdStatus.approved,
  REJECTED: PrismaAdStatus.rejected,
  RESOLVED: PrismaAdStatus.resolved,
} as const;
export type AdvertisementStatus = PrismaAdStatus;

/** كان `IAdvertisement extends Document` — صار النوع المولَّد من المخطط */
export type IAdvertisement = PrismaAdvertisement;
