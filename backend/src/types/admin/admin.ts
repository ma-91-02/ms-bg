import { MatchStatus } from '../../models/mobile/AdvertisementMatch';

/**
 * أنواع لوحة التحكم.
 *
 * `IAdmin` و`AdminAuthRequest` كانا يعرّفان هنا شكلًا يخالف ما يضعه وسيط
 * المصادقة فعليًا في `req.admin` (وكان `role` مقيّدًا بـ 'admin' | 'super'
 * بينما التعداد الحقيقي superadmin/admin/moderator). صارا يشيران إلى
 * التعريف الواحد في `types/express`.
 */
export type { AuthenticatedAdmin as IAdmin, AuthRequest as AdminAuthRequest } from '../express';

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
