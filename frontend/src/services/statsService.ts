import api from './api';
import { mockStats } from './mockData';

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
    
    // إرجاع إحصائيات افتراضية في حالة عدم الحصول على بيانات صحيحة
    return getDefaultStats();
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    
    // محاولة استخدام البيانات المخزنة حتى لو كانت قديمة
    if (cachedStats) {
      console.log('استخدام الإحصائيات المخزنة مؤقتًا بالرغم من انتهاء صلاحيتها');
      return cachedStats;
    }
    
    // إرجاع إحصائيات افتراضية
    return getDefaultStats();
  }
};

// وظيفة للحصول على إحصائيات افتراضية
const getDefaultStats = (): AdminStats => {
  return {
    totalUsers: 0,
    totalAdvertisements: 0,
    pendingAdvertisements: 0,
    approvedAdvertisements: 0,
    rejectedAdvertisements: 0,
    resolvedAdvertisements: 0,
    totalContacts: 0,
    pendingContacts: 0,
    approvedContacts: 0,
    rejectedContacts: 0
  };
};

// دالة لتحديث الإحصائيات يدويًا
export const refreshAdminStats = (): void => {
  cachedStats = null;
  lastFetchTime = 0;
};

// الحصول على إحصائيات مقسمة حسب الزمن لعرض التطور
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
    
    // في حالة عدم توفر بيانات، نقوم بإنشاء بيانات عشوائية للاختبار
    console.warn('لم يتم العثور على بيانات زمنية من الخادم، سيتم استخدام بيانات اختبار');
    return generateMockTimelineData(period);
  } catch (error) {
    console.error('خطأ في جلب البيانات الزمنية:', error);
    return generateMockTimelineData(period);
  }
};

// توليد بيانات عشوائية للاختبار في حالة غياب API
function generateMockTimelineData(period: 'week' | 'month' | 'year'): TimelineStats[] {
  const result: TimelineStats[] = [];
  let days = 7;
  
  if (period === 'month') {
    days = 30;
  } else if (period === 'year') {
    days = 12; // سنستخدم 12 شهر
  }
  
  const today = new Date();
  const baseUsers = 100 + Math.floor(Math.random() * 50);
  const baseAds = 50 + Math.floor(Math.random() * 30);
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    if (period === 'year') {
      // للسنة، نضبط التاريخ للشهر
      date.setMonth(today.getMonth() - (days - i - 1));
      date.setDate(1);
    } else {
      // للأسبوع أو الشهر، نضبط التاريخ لليوم
      date.setDate(today.getDate() - (days - i - 1));
    }
    
    // زيادة تدريجية للقيم لتحاكي النمو الطبيعي
    const growthFactor = 1 + (i * 0.03);
    const users = Math.floor(baseUsers * growthFactor);
    const advertisements = Math.floor(baseAds * growthFactor);
    const pendingAds = Math.floor(advertisements * 0.2);
    const approvedAds = Math.floor(advertisements * 0.6);
    const resolvedAds = Math.floor(advertisements * 0.2);
    
    result.push({
      date: date.toISOString().split('T')[0],
      users,
      advertisements,
      pendingAds,
      approvedAds,
      resolvedAds
    });
  }
  
  return result;
}

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
    
    console.warn('لم يتم العثور على بيانات نشاط النظام، سيتم استخدام بيانات وهمية للاختبار');
    return generateMockActivityData(limit);
  } catch (error) {
    console.error('خطأ في جلب بيانات نشاط النظام:', error);
    return generateMockActivityData(limit);
  }
};

// توليد بيانات وهمية للنشاط
function generateMockActivityData(limit: number): Array<{
  id: string;
  type: string;
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  documentId?: string;
  documentType?: string;
}> {
  const result = [];
  const activityTypes = [
    'document_added',
    'document_approved',
    'document_rejected',
    'document_resolved',
    'user_registered',
    'contact_request'
  ];
  
  const userNames = ['محمد علي', 'أحمد محمود', 'عبدالله عمر', 'سارة أحمد', 'فاطمة محمد'];
  const documentTypes = ['بطاقة هوية', 'جواز سفر', 'رخصة قيادة', 'بطاقة عائلية', 'شهادة ميلاد'];
  
  const messageTemplates = {
    document_added: ['تم إضافة مستند جديد', 'إضافة مستند للمراجعة'],
    document_approved: ['تمت الموافقة على المستند', 'الموافقة على مستند معلق'],
    document_rejected: ['تم رفض المستند', 'رفض مستند غير مطابق للشروط'],
    document_resolved: ['تم استرداد المستند بنجاح', 'إغلاق إعلان بعد استرداد المستند'],
    user_registered: ['انضمام مستخدم جديد', 'تسجيل عضو جديد في النظام'],
    contact_request: ['طلب تواصل مع صاحب إعلان', 'طلب معلومات لاسترداد مستند']
  };
  
  for (let i = 0; i < limit; i++) {
    const typeIndex = Math.floor(Math.random() * activityTypes.length);
    const type = activityTypes[typeIndex];
    
    // توليد تاريخ عشوائي في الأيام السبعة الماضية، مع ترتيب تنازلي (الأحدث أولاً)
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * (i * 0.5)));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    // اختيار رسالة عشوائية بناءً على نوع النشاط
    const messageOptions = messageTemplates[type as keyof typeof messageTemplates];
    const message = messageOptions[Math.floor(Math.random() * messageOptions.length)];
    
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    
    const activity = {
      id: `activity-${i + 1}`,
      type,
      message,
      timestamp: date.toISOString(),
      userId: `user-${Math.floor(Math.random() * 20) + 1}`,
      userName,
      documentId: type.includes('document') ? `doc-${Math.floor(Math.random() * 50) + 1}` : undefined,
      documentType: type.includes('document') ? documentType : undefined
    };
    
    result.push(activity);
  }
  
  // ترتيب النتائج بحسب التاريخ (الأحدث أولاً)
  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
} 