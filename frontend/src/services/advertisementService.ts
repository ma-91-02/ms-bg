import api from './api';
import { translateDocumentType, translateCity } from '../utils/translationUtils';

export interface Advertisement {
  id?: string;
  name?: string;
  documentType?: string;
  /**
   * مفقود أو موجود — أهمّ تصنيف في الإعلان، وكان الخادم يرسله
   * وتُسقطه طبقة التحويل فلا يظهر على الكرت إطلاقًا. المشرف يقرأ
   * قائمة الإعلانات دون أن يعرف أيّها بلاغ فقدان وأيّها عثور.
   */
  type?: 'lost' | 'found';
  /** رقم المستمسك — أقوى دليل للمطابقة */
  itemNumber?: string;
  /** سبب الرفض — كان يُخزَّن ولا يُعرض */
  rejectionReason?: string;
  location?: string;
  landmark?: string;
  phone?: string;
  date?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'resolved';
  images?: string[];
  userId?: string | {
    _id?: string;
    phoneNumber?: string;
    fullName?: string;
    name?: string;
    [key: string]: any;
  };
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  publisherName?: string;
}

// تحويل بيانات الإعلان من الصيغة التي تعود من الخادم إلى الصيغة المستخدمة في الواجهة
const transformAdvertisementData = (item: any): Advertisement => {
  // معالجة التاريخ إذا كان كائن تاريخ منغو
  const formatMongoDate = (date: any): string => {
    if (!date) return '';
    
    try {
      // إذا كان التاريخ كائناً يحتوي على $date
      if (typeof date === 'object' && date.$date) {
        return new Date(date.$date).toLocaleDateString('ar-EG');
      }
      
      // إذا كان سلسلة نصية أو تاريخ JavaScript
      return new Date(date).toLocaleDateString('ar-EG');
    } catch (e) {
      console.warn('خطأ في تنسيق التاريخ:', e);
      return String(date);
    }
  };

  // معالجة قيمة userID التي قد تكون كائناً بدلاً من نص
  const processUserId = (userId: any): any => {
    if (!userId) return '';
    
    // إذا كان كائن مستخدم، نعيده كما هو للاحتفاظ بجميع البيانات
    if (typeof userId === 'object') {
      return userId; // إرجاع الكائن كما هو للاحتفاظ بجميع البيانات مثل phoneNumber
    }
    
    // عودة المعرف كما هو
    return String(userId);
  };

  // التحقق من وجود بيانات المستخدم في كائن مختلف
  let publisherName = '';
  if (item.userId && typeof item.userId === 'object') {
    publisherName = item.userId.fullName || item.userId.name || '';
  } else if (item.user && typeof item.user === 'object') {
    publisherName = item.user.fullName || item.user.name || '';
  } else if (item.publisher && typeof item.publisher === 'object') {
    publisherName = item.publisher.fullName || item.publisher.name || '';
  }

  // تجميع بيانات الإعلان بالشكل المطلوب
  return {
    id: item._id || item.id || '',
    // استخدام اسم المستخدم إذا كان مُضمناً في كائن المستخدم
    name: item.ownerName || item.name || '',
    documentType: item.category || item.documentType || '',
    type: item.type,
    itemNumber: item.itemNumber || '',
    rejectionReason: item.rejectionReason || '',
    location: item.governorate || item.location || '',
    landmark: item.landmark || '',
    phone: item.contactPhone || item.phone || '',
    date: item.createdAt ? formatMongoDate(item.createdAt) : '',
    status: item.status || (item.isApproved ? 'approved' : 'pending'),
    images: Array.isArray(item.images) ? item.images : [],
    userId: processUserId(item.userId || item.user),
    description: item.description || '',
    category: item.category || item.documentType || '',
    createdAt: formatMongoDate(item.createdAt),
    updatedAt: item.updatedAt ? formatMongoDate(item.updatedAt) : '',
    publisherName: publisherName
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

// استخراج البيانات من الاستجابة
const extractDataFromResponse = (response: any): any[] => {
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.advertisements)) {
    return response.data.advertisements;
  } else if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  } else if (response.data && Array.isArray(response.data.documents)) {
    return response.data.documents;
  }
  
  return [];
};

// الحصول على جميع الإعلانات
export const getAllAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    console.log('جلب جميع الإعلانات...');
    
    // محاولة استخدام المسار الأساسي
    let response = await api.get<any>(API_PATHS.ALL_ADS);
    
    // التحقق من البيانات الواردة
    console.log('استجابة API الإعلانات (المسار الأساسي):', response.data);
    
    // استخراج البيانات من الاستجابة
    const data = extractDataFromResponse(response);
    if (data.length > 0) {
      return data.map(transformAdvertisementData);
    }
    
    console.warn('تم استلام بيانات غير متوقعة من API الإعلانات:', response.data);
    
    // محاولة استخدام المسارات البديلة
    for (const altPath of ALTERNATIVE_PATHS.ALL_ADS) {
      try {
        console.log(`محاولة استخدام مسار بديل ${altPath} لجلب الإعلانات...`);
        const altResponse = await api.get<any>(altPath);
        
        if (altResponse.data) {
          console.log(`استجابة المسار البديل ${altPath}:`, altResponse.data);
          
          const altData = extractDataFromResponse(altResponse);
          if (altData.length > 0) {
            return altData.map(transformAdvertisementData);
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
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    
    // محاولة استخدام المسارات البديلة
    for (const altPath of ALTERNATIVE_PATHS.ALL_ADS) {
      try {
        console.log(`محاولة استخدام مسار بديل ${altPath} لجلب الإعلانات...`);
        const altResponse = await api.get<any>(altPath);
        
        const altData = extractDataFromResponse(altResponse);
        if (altData.length > 0) {
          return altData.map(transformAdvertisementData);
        }
      } catch (altError) {
        console.error(`فشلت محاولة المسار البديل ${altPath}:`, altError);
      }
    }
    
    return [];
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
    
    // استخراج البيانات من الاستجابة
    const data = extractDataFromResponse(response);
    if (data.length > 0) {
      return data.map(transformAdvertisementData);
    }
    
    console.warn('تم استلام بيانات غير متوقعة من API الإعلانات المعلقة:', response.data);
    
    // محاولة استخدام مسار حالة للإعلانات المعلقة
    try {
      console.log('محاولة استخدام مسار الحالة لجلب الإعلانات المعلقة...');
      return await getAdvertisementsByStatus('pending');
    } catch (altError) {
      console.error('فشلت محاولة مسار الحالة للإعلانات المعلقة:', altError);
      return [];
    }
  } catch (error) {
    console.error('خطأ في جلب الإعلانات المعلقة:', error);
    
    // محاولة استخدام مسار حالة للإعلانات المعلقة
    try {
      return await getAdvertisementsByStatus('pending');
    } catch {
      return [];
    }
  }
};

// الحصول على إعلان بواسطة المعرف
export const getAdvertisementById = async (id: string): Promise<Advertisement | null> => {
  try {
    console.log(`جلب الإعلان بالمعرف ${id}...`);
    const response = await api.get<any>(`${API_PATHS.ADS_BY_ID}/${id}`);
    
    console.log('استجابة الحصول على الإعلان بالمعرف:', response.data);
    
    let adData;
    if (response.data && response.data.success && response.data.data) {
      // التحقق من الهيكل المتداخل
      if (response.data.data.advertisement) {
        adData = response.data.data.advertisement;
      } else {
        adData = response.data.data;
      }
    } else if (response.data) {
      adData = response.data;
    } else {
      return null;
    }
    
    // التحقق من وجود قيم كائنية بدلاً من قيم نصية
    const transformedData = transformAdvertisementData(adData);
    
    // تسجيل البيانات المحولة للتصحيح
    console.log('البيانات المحولة للإعلان:', transformedData);
    
    return transformedData;
  } catch (error) {
    console.error(`خطأ في جلب الإعلان بالمعرف ${id}:`, error);
    return null;
  }
};

// تحديث بيانات إعلان
export const updateAdvertisement = async (id: string, data: Partial<Advertisement>): Promise<void> => {
  try {
    console.log(`تحديث الإعلان ${id} بالبيانات:`, data);
    
    // تنظيف وتحويل البيانات قبل الإرسال
    const cleanedData: Record<string, any> = {};
    
    // نسخ الحقول المحددة فقط من البيانات
    if (data.name !== undefined) cleanedData.ownerName = data.name;
    if (data.documentType !== undefined) cleanedData.category = data.documentType;
    if (data.location !== undefined) cleanedData.governorate = data.location;
    if (data.landmark !== undefined) cleanedData.landmark = data.landmark;
    if (data.phone !== undefined) cleanedData.contactPhone = data.phone;
    if (data.status !== undefined) cleanedData.status = data.status;
    
    // إضافة سجل للبيانات المُنظفة
    console.log(`البيانات المُنظفة:`, cleanedData);
    
    // محاولة باستخدام PATCH أولاً
    try {
      const response = await api.patch(`${API_PATHS.UPDATE_AD}/${id}`, cleanedData);
      console.log('استجابة PATCH للتحديث:', response.data);
      return;
    } catch (patchError) {
      console.warn('فشل طلب PATCH للتحديث، محاولة باستخدام PUT...', patchError);
      
      // إذا فشل PATCH، نجرب PUT
      try {
        const response = await api.put(`${API_PATHS.UPDATE_AD}/${id}`, cleanedData);
        console.log('استجابة PUT للتحديث:', response.data);
        return;
      } catch (putError) {
        console.warn('فشل طلب PUT أيضاً، محاولة باستخدام مسار بديل...', putError);
        
        // محاولة أخيرة باستخدام مسار بديل
        const directResponse = await api.patch(`/api/advertisements/${id}`, cleanedData);
        console.log('استجابة المسار البديل للتحديث:', directResponse.data);
      }
    }
  } catch (error) {
    console.error('خطأ في تحديث الإعلان:', error);
    // إعادة توجيه الخطأ للتعامل معه في المكون
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

/**
 * الموافقة على إعلان.
 *
 * الخادم يعرّف `PUT /advertisements/:id/approve` حصرًا. النسخة
 * السابقة كانت تجرّب `PATCH /approve/:id` ثم `PATCH /:id/approve`
 * قبل أن تصل إلى PUT في `catch` متداخل — والاثنان PATCH يردّان 404
 * على كل نقرة. وحين تُبتلع المحاولة الأخيرة في مسار الخطأ لا تُعتمد
 * الموافقة إطلاقًا: المشرف يضغط «موافقة» فلا يحدث شيء، ويبقى الإعلان
 * محجوبًا عن العموم بلا سبب ظاهر.
 *
 * المسار الصحيح مباشرةً، بلا تجريب.
 */
export const approveAdvertisement = async (id: string): Promise<void> => {
  await api.put(`${API_PATHS.ADS_BY_ID}/${id}/approve`);
};

// رفض إعلان — `PUT /:id/reject` حصرًا، انظر تعليق `approveAdvertisement`
export const rejectAdvertisement = async (id: string, reason?: string): Promise<void> => {
  await api.put(`${API_PATHS.ADS_BY_ID}/${id}/reject`, reason ? { reason } : {});
};

// حل إعلان
// تحديد إعلان كمحلول — `PUT /:id/resolve` حصرًا
export const resolveAdvertisement = async (id: string): Promise<void> => {
  await api.put(`${API_PATHS.ADS_BY_ID}/${id}/resolve`, { isResolved: true });
};

// الحصول على الإعلانات حسب الحالة
export const getAdvertisementsByStatus = async (status: string): Promise<Advertisement[]> => {
  try {
    console.log(`جلب الإعلانات بالحالة ${status}...`);
    
    // محاولة باستخدام المسار المباشر
    let response = await api.get<any>(`${API_PATHS.ADS_BY_STATUS}/${status}`);
    
    console.log(`استجابة API الإعلانات ذات الحالة ${status}:`, response.data);
    
    // استخراج البيانات من الاستجابة
    const data = extractDataFromResponse(response);
    if (data.length > 0) {
      return data.map(transformAdvertisementData);
    }
    
    console.warn(`تم استلام بيانات غير متوقعة من API الإعلانات ذات الحالة ${status}:`, response.data);
    
    // محاولة استخدام المسار البديل
    try {
      console.log(`محاولة استخدام مسار بديل لجلب الإعلانات بالحالة ${status}...`);
      const altResponse = await api.get<any>(`${API_PATHS.ALL_ADS}?status=${status}`);
      
      const altData = extractDataFromResponse(altResponse);
      if (altData.length > 0) {
        return altData.map(transformAdvertisementData);
      }
      
      return [];
    } catch (altError) {
      console.error(`فشلت محاولة المسار البديل لجلب الإعلانات بالحالة ${status}:`, altError);
      return [];
    }
  } catch (error) {
    console.error(`خطأ في جلب الإعلانات ذات الحالة ${status}:`, error);
    
    // محاولة استخدام المسار البديل
    try {
      const altResponse = await api.get<any>(`${API_PATHS.ALL_ADS}?status=${status}`);
      
      const altData = extractDataFromResponse(altResponse);
      if (altData.length > 0) {
        return altData.map(transformAdvertisementData);
      }
      
      return [];
    } catch {
      return [];
    }
  }
}; 