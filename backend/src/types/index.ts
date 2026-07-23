/**
 * الأنواع المشتركة.
 *
 * حُذفت من هنا `AuthRequest` و`IUser` و`IAdmin` و`IReport`: كانت تعريفات
 * موازية مبنية على `mongoose.Document` تخالف ما يعرّفه المخطط فعليًا
 * (مثلًا `IUser.name`/`phone` بينما الحقول الحقيقية `fullName`/`phoneNumber`،
 * و`IReport` لكيان لا وجود له في قاعدة البيانات). المصدر الواحد الآن هو
 * الأنواع المولَّدة من `prisma/schema.prisma`.
 */
export type { AuthRequest, AuthenticatedUser, AuthenticatedAdmin } from './express';
export type { IUser } from '../models/mobile/User';
export type { IAdmin } from '../models/admin/Admin';

/**
 * أنواع فئات الأغراض المفقودة/الموجودة
 */
export const ITEM_CATEGORIES = [
  'وثائق',
  'إلكترونيات',
  'مجوهرات',
  'حقائب',
  'ملابس',
  'مفاتيح',
  'نقود',
  'أخرى'
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

/**
 * أنواع الوثائق
 */
export const DOCUMENT_TYPES = [
  'هوية وطنية',
  'رخصة قيادة',
  'جواز سفر',
  'بطاقة عائلية',
  'إقامة',
  'بطاقة جامعية',
  'أخرى'
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

/**
 * أنواع مشتركة للتطبيق
 */

// نوع الإعلان (مفقود/موجود)
export enum AdvertisementType {
  LOST = 'lost',
  FOUND = 'found'
}

// حالة الإعلان
export enum AdvertisementStatus {
  PENDING = 'pending',   // قيد المراجعة
  ACTIVE = 'active',     // نشط
  RESOLVED = 'resolved', // تم حله
  REJECTED = 'rejected'  // مرفوض
}

// فئات الإعلانات
export enum AdvertisementCategory {
  ELECTRONICS = 'electronics',     // إلكترونيات
  DOCUMENTS = 'documents',         // مستندات
  PERSONAL_ITEMS = 'personal_items', // أغراض شخصية
  PETS = 'pets',                   // حيوانات أليفة
  OTHERS = 'others'                // أخرى
}

// واجهة إنشاء إعلان جديد
export interface CreateAdvertisementDto {
  title: string;
  description: string;
  type: AdvertisementType;
  category: AdvertisementCategory | string;
  location?: {
    coordinates?: [number, number]; // [longitude, latitude]
    address?: string;
    governorate?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  reward?: number;
}

// واجهة تحديث إعلان
export interface UpdateAdvertisementDto {
  title?: string;
  description?: string;
  category?: AdvertisementCategory | string;
  location?: {
    coordinates?: [number, number];
    address?: string;
    governorate?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  reward?: number;
}

// واجهة استجابة الإعلان
export interface AdvertisementResponse {
  id: string;
  title: string;
  description: string;
  type: AdvertisementType;
  category: string;
  location?: {
    coordinates?: [number, number];
    address?: string;
    governorate?: string;
  };
  images: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    name?: string;
  };
  reward?: number;
  status: AdvertisementStatus;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// أي أنواع أخرى مشتركة يمكن إضافتها هنا 

// إعادة تصدير جميع الأنواع المشتركة
export * from './common/index';
export * from './mobile/user';
export * from './mobile/advertisement';
export * from './admin/admin'; 