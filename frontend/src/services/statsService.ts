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

export const getAdminStats = async (): Promise<AdminStats> => {
  console.log('بدء عملية الحصول على الإحصائيات من قاعدة البيانات');
  
  try {
    console.log('محاولة جلب الإحصائيات من الخادم...');
    
    // محاولة استخدام عدة مسارات محتملة
    try {
      // محاولة #1: استخدام مسار dashboard/stats
      const response = await api.get<any>('/api/admin/dashboard/stats');
      console.log('استجابة إحصائيات لوحة التحكم:', response.data);
      
      if (response.data && (response.data.success || Object.keys(response.data).length > 0)) {
        const data = response.data.data || response.data;
        
        return {
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
      }
    } catch (firstError) {
      console.warn('فشل المسار الأول للإحصائيات:', firstError);
    }
    
    try {
      // محاولة #2: استخدام مسار stats
      const response = await api.get<any>('/api/admin/stats');
      console.log('استجابة من مسار stats:', response.data);
      
      if (response.data && (response.data.success || Object.keys(response.data).length > 0)) {
        const data = response.data.data || response.data;
        
        return {
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
      }
    } catch (secondError) {
      console.warn('فشل المسار الثاني للإحصائيات:', secondError);
    }
    
    // إذا وصلنا إلى هنا، فهذا يعني أن كلا المسارين فشلا
    console.error('فشلت جميع محاولات جلب الإحصائيات');
    
    // إرجاع قيم افتراضية (أصفار) في حالة عدم القدرة على الاتصال بالخادم
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
  } catch (error) {
    console.error('خطأ عام في جلب الإحصائيات:', error);
    
    // إرجاع قيم افتراضية في حالة حدوث خطأ غير متوقع
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
  }
}; 