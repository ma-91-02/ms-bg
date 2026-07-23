/**
 * نقطة تصدير موحّدة لطبقة البيانات.
 *
 * سابقًا كان هذا الملف يصدّر نماذج Mongoose (كائنات فيها `.find()`).
 * الآن الوصول للبيانات يتم عبر عميل Prisma المفرد، والنماذج صارت أنواعًا
 * وتعدادات فقط. المسار محفوظ حتى لا تنكسر الاستيرادات القائمة.
 */
export { default as prisma } from '../config/prisma';

export {
  AdvertisementType,
  ItemCategory,
  Governorate,
  AdvertisementStatus,
} from './mobile/Advertisement';
export type { IAdvertisement } from './mobile/Advertisement';

export { MatchStatus } from './mobile/AdvertisementMatch';
export type { IAdvertisementMatch } from './mobile/AdvertisementMatch';

export { ContactRequestStatus } from './mobile/ContactRequest';
export type { IContactRequest } from './mobile/ContactRequest';

export { AdminRole } from './admin/Admin';
export type { IAdmin } from './admin/Admin';

export type { IUser, PublicUser } from './mobile/User';
export type { INotification } from './mobile/Notification';
export type { IOtp } from './mobile/Otp';
