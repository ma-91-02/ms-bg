import api from './api';
import { Advertisement } from './advertisementService';

export interface Match {
  id: string;
  lostAdvertisementId: string;
  foundAdvertisementId: string;
  matchScore: number;
  matchingFields: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  notificationSent: boolean;
  notificationSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lostAdvertisement?: Advertisement;
  foundAdvertisement?: Advertisement;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString('ar-EG') : undefined;

/**
 * تحويل الإعلان المرتبط إلى الشكل المستخدم في الواجهة.
 *
 * الخادم كان يعيد الإعلان داخل الحقل `lostAdvertisementId` نفسه لأن
 * Mongoose يستبدل المفتاح بالكائن عند populate. مع Prisma صار المفتاح
 * والعلاقة منفصلين: `lostAdvertisementId` نص، و`lostAdvertisement` كائن.
 */
const transformAd = (ad: any): Advertisement | undefined => {
  if (!ad || typeof ad !== 'object') return undefined;

  return {
    id: ad.id || '',
    documentType: ad.category || '',
    location: ad.governorate || '',
    name: ad.ownerName || '',
    // رقم المستمسك هو الحقل الذي تقوم عليه المطابقة أصلًا، وكان
    // يُسقَط هنا فلا يراه المشرف وهو يقرّر قبول المطابقة أو رفضها
    itemNumber: ad.itemNumber || '',
    type: ad.type,
    description: ad.description || '',
    images: ad.images || [],
    userId: ad.userId || '',
    publisherName: ad.user?.fullName || '',
    phone: ad.user?.phoneNumber || ad.contactPhone || '',
    status: ad.status || 'pending',
    date: ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('ar-EG') : '',
  } as Advertisement;
};

const transformMatch = (data: any): Match => ({
  id: data.id,
  lostAdvertisementId: data.lostAdvertisementId || '',
  foundAdvertisementId: data.foundAdvertisementId || '',
  matchScore: data.matchScore || 0,
  matchingFields: Array.isArray(data.matchingFields) ? data.matchingFields : [],
  status: data.status || 'pending',
  approvedBy: data.approvedById || undefined,
  approvedAt: formatDate(data.approvedAt),
  notificationSent: !!data.notificationSent,
  notificationSentAt: formatDate(data.notificationSentAt),
  notes: data.notes || '',
  createdAt: formatDate(data.createdAt) || '',
  updatedAt: formatDate(data.updatedAt) || '',
  lostAdvertisement: transformAd(data.lostAdvertisement),
  foundAdvertisement: transformAd(data.foundAdvertisement),
});

interface MatchesPage {
  matches: Match[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const emptyPage: MatchesPage = { matches: [], total: 0, totalPages: 1, currentPage: 1 };

const fetchMatches = async (path: string): Promise<MatchesPage> => {
  try {
    const response = await api.get(path);

    if (response.data?.success) {
      return {
        matches: Array.isArray(response.data.data)
          ? response.data.data.map(transformMatch)
          : [],
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1,
      };
    }

    console.warn('تنسيق بيانات المطابقات غير متوقع:', response.data);
    return emptyPage;
  } catch (error) {
    console.error('خطأ في جلب المطابقات:', error);
    return emptyPage;
  }
};

export const getAllMatches = (page = 1, limit = 10) =>
  fetchMatches(`/api/admin/matches?page=${page}&limit=${limit}`);

export const getPendingMatches = (page = 1, limit = 10) =>
  fetchMatches(`/api/admin/matches/pending?page=${page}&limit=${limit}`);

export const approveMatch = async (id: string): Promise<Match> => {
  const response = await api.put(`/api/admin/matches/${id}/approve`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'تعذّرت الموافقة على المطابقة');
  }

  return transformMatch(response.data.data);
};

export const rejectMatch = async (id: string, notes?: string): Promise<Match> => {
  const response = await api.put(`/api/admin/matches/${id}/reject`, { notes });

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'تعذّر رفض المطابقة');
  }

  return transformMatch(response.data.data);
};

/**
 * إعادة تشغيل محرك المطابقة على الخادم.
 *
 * كانت هذه الدالة تُعيد تنفيذ خوارزمية المطابقة كاملةً داخل المتصفح
 * (جلب كل الإعلانات ثم مقارنتها زوجًا زوجًا ثم إرسال النتائج للحفظ)،
 * ثم تجرّب أربع نقايات نهاية بالتتابع علّ إحداها تنجح. كان ذلك التفافًا
 * على كون المحرك الخادمي معطّلًا فعليًا — إذ لم يكن يُستدعى قط بعد
 * اعتماد الإعلان. وقد أُصلح ذلك، فصار استدعاءً واحدًا للمحرك الحقيقي
 * الذي يعمل داخل Postgres مع تطبيع الأسماء العربية.
 */
export const refreshMatches = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/admin/matches/run-matching');
    return !!response.data?.success;
  } catch (error) {
    console.error('خطأ في تحديث المطابقات:', error);
    return false;
  }
};
