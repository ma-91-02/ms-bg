import { Document } from 'mongoose';

// أنواع الإعلانات
export enum AdvertisementType {
  LOST = 'lost',
  FOUND = 'found'
}

// حالة الإعلان
export enum AdvertisementStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

// واجهة إنشاء الإعلان
export interface CreateAdvertisementDTO {
  title: string;
  description: string;
  type: AdvertisementType;
  category: string;
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
    governorate?: string;
  };
  date?: Date;
  contactInfo: {
    phone?: string;
    email?: string;
    name?: string;
  };
  reward?: number;
}

// واجهة تحديث الإعلان
export interface UpdateAdvertisementDTO {
  title?: string;
  description?: string;
  category?: string;
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
    governorate?: string;
  };
  date?: Date;
  contactInfo?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  reward?: number;
  status?: AdvertisementStatus;
}

// واجهة فلترة الإعلانات
export interface AdvertisementFilters {
  type?: AdvertisementType;
  category?: string;
  status?: AdvertisementStatus;
  search?: string;
  page?: number;
  limit?: number;
} 