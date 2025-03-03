import { Request } from 'express';
import { Document } from 'mongoose';

/**
 * توسيع واجهة الطلب Express لتضمين المستخدم
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * واجهة المستخدم
 */
export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * واجهة الأدمن
 */
export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'admin' | 'super';
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

/**
 * واجهة التقرير
 */
export interface IReport extends Document {
  type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  images: string[];
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  documentType?: string;
  documentNumber?: string;
  userId: string | IUser;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

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