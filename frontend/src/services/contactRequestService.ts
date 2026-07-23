import api from './api';

export interface ContactRequest {
  id: string;
  userId: string;
  advertisementId: string;
  advertiserUserId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  // البيانات المضمنة
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  advertiserUser?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  advertisement?: {
    id: string;
    type: string;
    category: string;
    governorate: string;
    description: string;
    status: string;
  };
}

// واجهة معلومات الاتصال المُسترجعة
export interface ContactInfo {
  advertiserName: string;
  contactPhone: string;
  userPhone: string;
}

/**
 * تحويل البيانات من صيغة API إلى صيغة الواجهة.
 *
 * علّة أُصلحت هنا: كانت الدالة تقرأ البيانات المضمَّنة من
 * `data.userId` و`data.advertiserUserId` و`data.advertisementId`
 * باعتبارها كائنات — وهو صحيح مع Mongoose الذي يستبدل المفتاح
 * بالكائن عند populate. ومع Prisma صار المفتاح والعلاقة حقلين
 * منفصلين: `userId` نصّ و`user` كائن.
 *
 * فكان الشرط `typeof data.userId === 'object'` يفشل دائمًا، وتخرج
 * كل البيانات المضمَّنة `undefined`. النتيجة أن شاشة طلبات التواصل
 * تعرض «غير معروف» في مكان مقدّم الطلب وصاحب الإعلان معًا — وهي
 * الشاشة التي يُقرَّر فيها كشف رقم هاتف شخص لشخص آخر.
 */
const transformContactRequest = (data: any): ContactRequest => {
  // كلا الشكلين مقبولان: كائن مضمَّن (Mongo) أو حقل علاقة (Prisma)
  const embedded = (relation: any, legacyKey: any) =>
    relation && typeof relation === 'object'
      ? relation
      : legacyKey && typeof legacyKey === 'object'
      ? legacyKey
      : undefined;

  const requester = embedded(data.user, data.userId);
  const advertiser = embedded(data.advertiserUser, data.advertiserUserId);
  const ad = embedded(data.advertisement, data.advertisementId);

  return {
    id: data._id || data.id,
    userId: requester?.id || requester?._id || (typeof data.userId === 'string' ? data.userId : ''),
    advertisementId: ad?.id || ad?._id || (typeof data.advertisementId === 'string' ? data.advertisementId : ''),
    advertiserUserId: advertiser?.id || advertiser?._id || (typeof data.advertiserUserId === 'string' ? data.advertiserUserId : ''),
    reason: data.reason || '',
    status: data.status || 'pending',
    approvedBy: data.approvedBy || undefined,
    approvedAt: data.approvedAt ? new Date(data.approvedAt).toLocaleString('ar-EG') : undefined,
    rejectionReason: data.rejectionReason || undefined,
    createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString('ar-EG') : '',
    updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString('ar-EG') : '',
    // البيانات المضمنة
    user: requester ? {
      id: requester.id || requester._id || '',
      fullName: requester.fullName || '',
      phoneNumber: requester.phoneNumber || ''
    } : undefined,
    advertiserUser: advertiser ? {
      id: advertiser.id || advertiser._id || '',
      fullName: advertiser.fullName || '',
      phoneNumber: advertiser.phoneNumber || ''
    } : undefined,
    advertisement: ad ? {
      id: ad.id || ad._id || '',
      type: ad.type || '',
      category: ad.category || '',
      governorate: ad.governorate || '',
      description: ad.description || '',
      status: ad.status || ''
    } : undefined
  };
};

// ============ API functions for Admin Dashboard ============

export const getAllContactRequests = async (page = 1, limit = 10): Promise<{ requests: ContactRequest[], total: number, totalPages: number, currentPage: number }> => {
  try {
    console.log(`📊 جلب جميع طلبات التواصل (صفحة ${page})...`);
    const response = await api.get(`/api/admin/contact-requests?page=${page}&limit=${limit}`);
    
    console.log('✅ استجابة جلب جميع طلبات التواصل:', {
      success: response.data?.success,
      count: response.data?.count,
      total: response.data?.total
    });
    
    if (response.data && response.data.success) {
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map(transformContactRequest) 
        : [];
      
      return {
        requests: transformedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error: any) {
    console.error('❌ خطأ في جلب جميع طلبات التواصل:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { requests: [], total: 0, totalPages: 1, currentPage: 1 };
  }
};

export const getContactRequestsByStatus = async (status: string, page = 1, limit = 10): Promise<{ requests: ContactRequest[], total: number, totalPages: number, currentPage: number }> => {
  try {
    console.log(`📊 جلب طلبات التواصل بحالة ${status} (صفحة ${page})...`);
    const response = await api.get(`/api/admin/contact-requests?status=${status}&page=${page}&limit=${limit}`);
    
    console.log('✅ استجابة جلب طلبات التواصل بحالة معينة:', {
      status,
      success: response.data?.success,
      count: response.data?.count,
      total: response.data?.total
    });
    
    if (response.data && response.data.success) {
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map(transformContactRequest) 
        : [];
      
      return {
        requests: transformedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error: any) {
    console.error(`❌ خطأ في جلب طلبات التواصل بحالة ${status}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { requests: [], total: 0, totalPages: 1, currentPage: 1 };
  }
};

export const getPendingContactRequests = async (page = 1, limit = 10): Promise<{ requests: ContactRequest[], total: number, totalPages: number, currentPage: number }> => {
  return getContactRequestsByStatus('pending', page, limit);
};

export const approveContactRequest = async (id: string): Promise<ContactRequest> => {
  try {
    console.log(`الموافقة على طلب التواصل بمعرف ${id}...`);
    const response = await api.put(`/api/admin/contact-requests/${id}/approve`);
    
    if (response.data && response.data.success) {
      return transformContactRequest(response.data.data);
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error) {
    console.error('خطأ في الموافقة على طلب التواصل:', error);
    throw error;
  }
};

export const rejectContactRequest = async (id: string, rejectionReason: string): Promise<ContactRequest> => {
  try {
    console.log(`رفض طلب التواصل بمعرف ${id}...`);
    const response = await api.put(`/api/admin/contact-requests/${id}/reject`, { rejectionReason });
    
    if (response.data && response.data.success) {
      return transformContactRequest(response.data.data);
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error) {
    console.error('خطأ في رفض طلب التواصل:', error);
    throw error;
  }
};

// ============ API functions for Mobile App ============

// إنشاء طلب تواصل جديد
export const createContactRequest = async (advertisementId: string, reason: string): Promise<ContactRequest> => {
  try {
    if (!advertisementId) {
      throw new Error('معرف الإعلان مطلوب لإنشاء طلب تواصل');
    }
    
    console.log(`🔔 إنشاء طلب تواصل جديد للإعلان ${advertisementId}...`, {
      advertisementId,
      reason
    });
    
    const response = await api.post('/api/mobile/contact-requests', { 
      advertisementId, 
      reason 
    });
    
    console.log('✅ استجابة API لإنشاء طلب تواصل:', response.data);
    
    if (response.data && response.data.success) {
      return transformContactRequest(response.data.data);
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء طلب تواصل:', {
      error: error.message,
      status: error.response?.status,
      responseData: error.response?.data
    });
    
    // إعادة رمي الخطأ مع رسالة الخطأ من الخادم إن وجدت
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

// الحصول على طلبات التواصل الخاصة بالمستخدم الحالي
export const getUserContactRequests = async (status?: string, page = 1, limit = 10): Promise<{ requests: ContactRequest[], total: number, totalPages: number, currentPage: number }> => {
  try {
    let url = `/api/mobile/contact-requests/my-requests?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    console.log('جلب طلبات التواصل الخاصة بالمستخدم...');
    const response = await api.get(url);
    
    if (response.data && response.data.success) {
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map(transformContactRequest) 
        : [];
      
      return {
        requests: transformedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error) {
    console.error('خطأ في جلب طلبات التواصل الخاصة بالمستخدم:', error);
    return { requests: [], total: 0, totalPages: 1, currentPage: 1 };
  }
};

// الحصول على معلومات الاتصال (بعد الموافقة على الطلب)
export const getContactInfo = async (requestId: string): Promise<ContactInfo> => {
  try {
    console.log(`جلب معلومات الاتصال للطلب ${requestId}...`);
    const response = await api.get(`/api/mobile/contact-requests/${requestId}/contact-info`);
    
    if (response.data && response.data.success) {
      return response.data.data as ContactInfo;
    }
    
    throw new Error('تنسيق البيانات غير متوقع');
  } catch (error) {
    console.error('خطأ في جلب معلومات الاتصال:', error);
    throw error;
  }
}; 