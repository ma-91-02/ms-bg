import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalAdvertisements: number;
  pendingAdvertisements: number;
  approvedAdvertisements: number;
  rejectedAdvertisements: number;
  resolvedAdvertisements: number;
  totalContacts: number;
  pendingContacts: number;
  approvedContacts: number;
  rejectedContacts: number;
}

export interface TimelineStats {
  date: string;
  users: number;
  advertisements: number;
  pendingAds: number;
  approvedAds: number;
  resolvedAds: number;
}

// تنفيذ مؤقت لتخزين الإحصائيات
let cachedStats: AdminStats | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق بالمللي ثانية

export const getAdminStats = async (): Promise<AdminStats> => {
  const now = Date.now();
  
  // استخدم البيانات المخزنة مؤقتًا إذا كانت متوفرة ولم تنتهي صلاحيتها
  if (cachedStats && (now - lastFetchTime < CACHE_TTL)) {
    console.log('استخدام الإحصائيات المخزنة مؤقتًا');
    return cachedStats;
  }
  
  console.log('جلب إحصائيات جديدة من الخادم...');
  
  try {
    // محاولة استخدام المسار الرئيسي
    const response = await api.get<any>('/api/admin/dashboard/stats');
    
    if (response.data && response.data.success) {
      const data = response.data.data || response.data;
      
      const stats: AdminStats = {
        totalUsers: data.totalUsers || data.users || data.usersCount || 0,
        totalAdvertisements: data.totalAdvertisements || data.advertisements || data.adsCount || data.ads?.total || 0,
        pendingAdvertisements: data.pendingAdvertisements || data.pendingAds || data.ads?.pending || 0,
        approvedAdvertisements: data.approvedAdvertisements || data.approvedAds || data.ads?.approved || 0,
        rejectedAdvertisements: data.rejectedAdvertisements || data.rejectedAds || data.ads?.rejected || 0,
        resolvedAdvertisements: data.resolvedAdvertisements || data.resolvedAds || data.ads?.resolved || 0,
        totalContacts: data.totalContacts || data.contacts || data.contactRequests?.total || 0,
        pendingContacts: data.pendingContacts || data.contactRequests?.pending || 0,
        approvedContacts: data.approvedContacts || data.contactRequests?.approved || 0,
        rejectedContacts: data.rejectedContacts || data.contactRequests?.rejected || 0
      };
      
      // تخزين الإحصائيات وتوقيت الجلب
      cachedStats = stats;
      lastFetchTime = now;
      
      return stats;
    }
    
    throw new Error('شكل غير متوقّع لاستجابة الإحصائيات');
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    // الأصفار الافتراضية كانت تُعرض كأنها قراءة صحيحة، فتظهر رسالة
    // «لا توجد بيانات» بينما الخادم متوقّف — تشخيصان مختلفان تمامًا
    // لمن يقرأ اللوحة. الفشل يصل الآن إلى شاشة الخطأ الصريحة.
    throw error;
  }
};

// دالة لتحديث الإحصائيات يدويًا
export const refreshAdminStats = (): void => {
  cachedStats = null;
  lastFetchTime = 0;
};

// الحصول على إحصائيات مقسمة حسب الزمن لعرض التطور
/*
 * لا بيانات مُصطنَعة عند الفشل — انظر التعليق نفسه في `userService`.
 *
 * كان منحنى «تحليل النمو» وسجلّ النشاط يُولَّدان محليًا كلّما فشل
 * الطلب: منحنى صاعد ورسائل نشاط بأسماء مستخدمين مخترعة. المشرف يرى
 * لوحةً تعمل بينما لا يصله شيء من الخادم.
 */
export const getTimelineStats = async (period: 'week' | 'month' | 'year' = 'week'): Promise<TimelineStats[]> => {
  try {
    // محاولة استخدام المسار الأساسي للإحصائيات الزمنية
    const response = await api.get<any>(`/api/admin/stats/timeline?period=${period}`);
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.timeline)) {
      return response.data.timeline;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    throw new Error('شكل غير متوقّع لاستجابة البيانات الزمنية');
  } catch (error) {
    console.error('خطأ في جلب البيانات الزمنية:', error);
    throw error;
  }
};


// استرجاع النشاط الأخير في النظام
export const getRecentActivity = async (limit: number = 10): Promise<any[]> => {
  try {
    console.log(`جلب آخر ${limit} أنشطة في النظام...`);
    
    // محاولة استخدام المسار المباشر لنشاط النظام
    const response = await api.get<any>(`/api/admin/activity?limit=${limit}`);
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.activities)) {
      return response.data.activities;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    throw new Error('شكل غير متوقّع لاستجابة نشاط النظام');
  } catch (error) {
    console.error('خطأ في جلب بيانات نشاط النظام:', error);
    throw error;
  }
};
