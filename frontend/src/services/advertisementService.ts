import api from './api';

export interface Advertisement {
  id?: string;
  name?: string;
  documentType?: string;
  location?: string;
  landmark?: string;
  phone?: string;
  date?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'resolved';
  images?: string[];
  userId?: string;
}

// تحويل بيانات الإعلان من الصيغة التي تعود من الخادم إلى الصيغة المستخدمة في الواجهة
const transformAdvertisementData = (item: any): Advertisement => {
  return {
    id: item._id || item.id || '',
    name: item.ownerName || item.name || '',
    documentType: item.category || item.documentType || '',
    location: item.governorate || item.location || '',
    landmark: item.landmark || '',
    phone: item.contactPhone || item.phone || '',
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
    status: item.status || (item.isApproved ? 'approved' : 'pending'),
    images: Array.isArray(item.images) ? item.images : [],
    userId: item.userId || ''
  };
};

// القائمة الكاملة لمسارات API المحتملة للإعلانات
const API_PATHS = {
  ALL_ADS: '/api/admin/advertisements',
  PENDING_ADS: '/api/admin/advertisements/pending',
  ADS_BY_STATUS: '/api/admin/advertisements/status',
  ADS_BY_ID: '/api/admin/advertisements',
  APPROVE_AD: '/api/admin/advertisements/approve',
  REJECT_AD: '/api/admin/advertisements/reject',
  RESOLVE_AD: '/api/admin/advertisements/resolve',
  UPDATE_AD: '/api/admin/advertisements'
};

// مسارات بديلة للاختبار
const ALTERNATIVE_PATHS = {
  ALL_ADS: [
    '/api/advertisements',
    '/api/v1/admin/advertisements',
    '/advertisements',
    '/api/admin/documents'
  ],
  PENDING_ADS: [
    '/api/advertisements/pending',
    '/advertisements/pending',
    '/api/admin/documents/pending'
  ],
  STATUS: [
    '/api/advertisements/status',
    '/advertisements/status',
    '/api/admin/documents/status'
  ]
};

// الحصول على جميع الإعلانات
export const getAllAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    console.log('جلب جميع الإعلانات...');
    
    // محاولة استخدام المسار الأساسي
    let response = await api.get<any>(API_PATHS.ALL_ADS);
    
    // التحقق من البيانات الواردة
    console.log('استجابة API الإعلانات (المسار الأساسي):', response.data);
    
    // معالجة مختلف أشكال البيانات التي قد ترد من الـ API
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (Array.isArray(response.data)) {
      return response.data.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.advertisements)) {
      return response.data.advertisements.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.results)) {
      return response.data.results.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.documents)) {
      return response.data.documents.map(transformAdvertisementData);
    }
    
    console.warn('تم استلام بيانات غير متوقعة من API الإعلانات:', response.data);
    return [];
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    
    // محاولة استخدام المسارات البديلة إذا فشل المسار الأساسي
    for (const altPath of ALTERNATIVE_PATHS.ALL_ADS) {
      try {
        console.log(`محاولة استخدام مسار بديل ${altPath} لجلب الإعلانات...`);
        const altResponse = await api.get<any>(altPath);
        
        if (altResponse.data) {
          console.log(`استجابة المسار البديل ${altPath}:`, altResponse.data);
          
          if (Array.isArray(altResponse.data)) {
            return altResponse.data.map(transformAdvertisementData);
          } else if (altResponse.data && Array.isArray(altResponse.data.advertisements)) {
            return altResponse.data.advertisements.map(transformAdvertisementData);
          } else if (altResponse.data && altResponse.data.data && Array.isArray(altResponse.data.data)) {
            return altResponse.data.data.map(transformAdvertisementData);
          } else if (altResponse.data && Array.isArray(altResponse.data.documents)) {
            return altResponse.data.documents.map(transformAdvertisementData);
          } else if (altResponse.data && Array.isArray(altResponse.data.results)) {
            return altResponse.data.results.map(transformAdvertisementData);
          }
        }
      } catch (altError) {
        console.error(`فشلت محاولة المسار البديل ${altPath}:`, altError);
      }
    }
    
    // محاولة أخيرة - جلب البيانات حسب الحالة "pending"
    try {
      console.log('محاولة أخيرة - جلب الإعلانات المعلقة...');
      return await getAdvertisementsByStatus('pending');
    } catch (finalError) {
      console.error('فشلت جميع المحاولات لجلب الإعلانات:', finalError);
      return [];
    }
  }
};

// الحصول على الإعلانات المعلقة
export const getPendingAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    console.log('جلب الإعلانات المعلقة...');
    
    // محاولة استخدام المسار المباشر للإعلانات المعلقة
    let response = await api.get<any>(API_PATHS.PENDING_ADS);
    
    // التحقق من البيانات الواردة
    console.log('استجابة API الإعلانات المعلقة:', response.data);
    
    // معالجة مختلف أشكال البيانات التي قد ترد من الـ API
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (Array.isArray(response.data)) {
      return response.data.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.advertisements)) {
      return response.data.advertisements.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.results)) {
      return response.data.results.map(transformAdvertisementData);
    }
    
    console.warn('تم استلام بيانات غير متوقعة من API الإعلانات المعلقة:', response.data);
    return [];
  } catch (error) {
    console.error('خطأ في جلب الإعلانات المعلقة:', error);
    
    // محاولة استخدام مسار حالة للإعلانات المعلقة
    try {
      console.log('محاولة استخدام مسار الحالة لجلب الإعلانات المعلقة...');
      return await getAdvertisementsByStatus('pending');
    } catch (altError) {
      console.error('فشلت محاولة مسار الحالة للإعلانات المعلقة:', altError);
      return [];
    }
  }
};

// الحصول على إعلان بواسطة المعرف
export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  try {
    console.log(`جلب الإعلان بالمعرف ${id}...`);
    const response = await api.get<any>(`${API_PATHS.ADS_BY_ID}/${id}`);
    
    if (response.data && response.data.success && response.data.data) {
      return transformAdvertisementData(response.data.data);
    } else if (response.data) {
      return transformAdvertisementData(response.data);
    }
    
    return null;
  } catch (error) {
    console.error(`خطأ في جلب الإعلان بالمعرف ${id}:`, error);
    return null;
  }
};

// تحديث بيانات إعلان
export const updateAdvertisement = async (id: string, data: Partial<Advertisement>): Promise<void> => {
  try {
    console.log(`تحديث الإعلان ${id} بالبيانات:`, data);
    
    // محاولة باستخدام PATCH أولاً
    try {
      await api.patch(`${API_PATHS.UPDATE_AD}/${id}`, data);
      return;
    } catch (patchError) {
      console.warn('فشل طلب PATCH، محاولة باستخدام PUT...');
      
      // إذا فشل PATCH، نجرب PUT
      await api.put(`${API_PATHS.UPDATE_AD}/${id}`, data);
    }
  } catch (error) {
    console.error('خطأ في تحديث الإعلان:', error);
    throw error;
  }
};

// حذف إعلان
export const deleteAdvertisement = async (id: string): Promise<void> => {
  try {
    console.log(`حذف الإعلان ${id}...`);
    await api.delete(`${API_PATHS.ADS_BY_ID}/${id}`);
  } catch (error) {
    console.error('خطأ في حذف الإعلان:', error);
    throw error;
  }
};

// الموافقة على إعلان
export const approveAdvertisement = async (id: string): Promise<void> => {
  try {
    console.log(`الموافقة على الإعلان: ${id}`);
    
    // محاولة باستخدام PATCH أولاً
    try {
      await api.patch(`${API_PATHS.APPROVE_AD}/${id}`);
      return;
    } catch (patchError) {
      console.warn('فشل طلب PATCH للموافقة، محاولة باستخدام المسار المباشر...');
      
      // محاولة باستخدام المسار المباشر
      await api.patch(`${API_PATHS.ADS_BY_ID}/${id}/approve`);
    }
  } catch (error) {
    console.error('خطأ في الموافقة على الإعلان:', error);
    
    // محاولة أخيرة باستخدام PUT
    try {
      await api.put(`${API_PATHS.ADS_BY_ID}/${id}/approve`);
    } catch (finalError) {
      console.error('فشلت جميع المحاولات للموافقة على الإعلان:', finalError);
      throw finalError;
    }
  }
};

// رفض إعلان
export const rejectAdvertisement = async (id: string): Promise<void> => {
  try {
    console.log(`رفض الإعلان: ${id}`);
    
    // محاولة باستخدام PATCH أولاً
    try {
      await api.patch(`${API_PATHS.REJECT_AD}/${id}`);
      return;
    } catch (patchError) {
      console.warn('فشل طلب PATCH للرفض، محاولة باستخدام المسار المباشر...');
      
      // محاولة باستخدام المسار المباشر
      await api.patch(`${API_PATHS.ADS_BY_ID}/${id}/reject`);
    }
  } catch (error) {
    console.error('خطأ في رفض الإعلان:', error);
    
    // محاولة أخيرة باستخدام PUT
    try {
      await api.put(`${API_PATHS.ADS_BY_ID}/${id}/reject`);
    } catch (finalError) {
      console.error('فشلت جميع المحاولات لرفض الإعلان:', finalError);
      throw finalError;
    }
  }
};

// حل إعلان
export const resolveAdvertisement = async (id: string): Promise<void> => {
  try {
    console.log(`تحديد الإعلان ${id} كمحلول...`);
    
    // محاولة باستخدام PATCH أولاً
    try {
      await api.patch(`${API_PATHS.RESOLVE_AD}/${id}`);
      return;
    } catch (patchError) {
      console.warn('فشل طلب PATCH للحل، محاولة باستخدام المسار المباشر...');
      
      // محاولة باستخدام المسار المباشر
      await api.patch(`${API_PATHS.ADS_BY_ID}/${id}/resolve`);
    }
  } catch (error) {
    console.error('خطأ في تحديد الإعلان كمحلول:', error);
    
    // محاولة أخيرة باستخدام PUT
    try {
      await api.put(`${API_PATHS.ADS_BY_ID}/${id}/resolve`);
    } catch (finalError) {
      console.error('فشلت جميع المحاولات لتحديد الإعلان كمحلول:', finalError);
      throw finalError;
    }
  }
};

// الحصول على الإعلانات حسب الحالة
export const getAdvertisementsByStatus = async (status: string): Promise<Advertisement[]> => {
  try {
    console.log(`جلب الإعلانات بالحالة ${status}...`);
    
    // محاولة باستخدام المسار المباشر
    let response = await api.get<any>(`${API_PATHS.ADS_BY_STATUS}/${status}`);
    
    console.log(`استجابة API الإعلانات ذات الحالة ${status}:`, response.data);
    
    // معالجة مختلف أشكال البيانات التي قد ترد من الـ API
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(transformAdvertisementData);
    } else if (Array.isArray(response.data)) {
      return response.data.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.advertisements)) {
      return response.data.advertisements.map(transformAdvertisementData);
    } else if (response.data && Array.isArray(response.data.results)) {
      return response.data.results.map(transformAdvertisementData);
    }
    
    console.warn(`تم استلام بيانات غير متوقعة من API الإعلانات ذات الحالة ${status}:`, response.data);
    return [];
  } catch (error) {
    console.error(`خطأ في جلب الإعلانات ذات الحالة ${status}:`, error);
    
    // محاولة استخدام المسار البديل
    try {
      console.log(`محاولة استخدام مسار بديل لجلب الإعلانات بالحالة ${status}...`);
      const altResponse = await api.get<any>(`${API_PATHS.ALL_ADS}?status=${status}`);
      
      if (Array.isArray(altResponse.data)) {
        return altResponse.data.map(transformAdvertisementData);
      } else if (altResponse.data && Array.isArray(altResponse.data.advertisements)) {
        return altResponse.data.advertisements.map(transformAdvertisementData);
      }
      
      return [];
    } catch (altError) {
      console.error(`فشلت محاولة المسار البديل لجلب الإعلانات بالحالة ${status}:`, altError);
      return [];
    }
  }
}; 