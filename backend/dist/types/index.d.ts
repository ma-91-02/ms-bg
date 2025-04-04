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
export declare const ITEM_CATEGORIES: readonly ["وثائق", "إلكترونيات", "مجوهرات", "حقائب", "ملابس", "مفاتيح", "نقود", "أخرى"];
export type ItemCategory = typeof ITEM_CATEGORIES[number];
/**
 * أنواع الوثائق
 */
export declare const DOCUMENT_TYPES: readonly ["هوية وطنية", "رخصة قيادة", "جواز سفر", "بطاقة عائلية", "إقامة", "بطاقة جامعية", "أخرى"];
export type DocumentType = typeof DOCUMENT_TYPES[number];
/**
 * أنواع مشتركة للتطبيق
 */
export declare enum AdvertisementType {
    LOST = "lost",
    FOUND = "found"
}
export declare enum AdvertisementStatus {
    PENDING = "pending",// قيد المراجعة
    ACTIVE = "active",// نشط
    RESOLVED = "resolved",// تم حله
    REJECTED = "rejected"
}
export declare enum AdvertisementCategory {
    ELECTRONICS = "electronics",// إلكترونيات
    DOCUMENTS = "documents",// مستندات
    PERSONAL_ITEMS = "personal_items",// أغراض شخصية
    PETS = "pets",// حيوانات أليفة
    OTHERS = "others"
}
export interface CreateAdvertisementDto {
    title: string;
    description: string;
    type: AdvertisementType;
    category: AdvertisementCategory | string;
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
export * from './common/index';
export * from './mobile/user';
export * from './mobile/advertisement';
export * from './admin/admin';
//# sourceMappingURL=index.d.ts.map