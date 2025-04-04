import { Document } from 'mongoose';
import { Request } from 'express';
import { MatchStatus } from '../../models/mobile/AdvertisementMatch';

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
 * واجهة طلب المصادقة للأدمن
 */
export interface AdminAuthRequest extends Request {
  admin?: {
    _id: string;
    id: string;
    username: string;
    role: string;
  };
}

/**
 * واجهة المطابقة
 */
export interface IMatch {
  lostAdvertisementId: string;
  foundAdvertisementId: string;
  matchScore: number;
  matchingFields: string[];
  status: MatchStatus;
  notificationSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 