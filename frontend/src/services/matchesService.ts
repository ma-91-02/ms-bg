import api from './api';
import { Advertisement } from './advertisementService';
import { translateDocumentType, translateCity } from '../utils/translationUtils';

export interface Match {
  id: string;
  lostAdvertisementId: string;
  foundAdvertisementId: string;
  matchScore: number;
  matchingFields: string[];
  status: 'pending' | 'approved' | 'rejected';
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

// تحويل بيانات المطابقة من صيغة الخادم إلى الصيغة المستخدمة في الواجهة
const transformMatch = (data: any): Match => {
  return {
    id: data._id || data.id,
    lostAdvertisementId: data.lostAdvertisementId?._id || (typeof data.lostAdvertisementId === 'string' ? data.lostAdvertisementId : ''),
    foundAdvertisementId: data.foundAdvertisementId?._id || (typeof data.foundAdvertisementId === 'string' ? data.foundAdvertisementId : ''),
    matchScore: data.matchScore || 0,
    matchingFields: Array.isArray(data.matchingFields) ? data.matchingFields : [],
    status: data.status || 'pending',
    approvedBy: data.approvedBy || undefined,
    approvedAt: data.approvedAt ? new Date(data.approvedAt).toLocaleString('ar-EG') : undefined,
    notificationSent: !!data.notificationSent,
    notificationSentAt: data.notificationSentAt ? new Date(data.notificationSentAt).toLocaleString('ar-EG') : undefined,
    notes: data.notes || '',
    createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString('ar-EG') : '',
    updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString('ar-EG') : '',
    lostAdvertisement: data.lostAdvertisementId && typeof data.lostAdvertisementId === 'object' ? {
      id: data.lostAdvertisementId._id || '',
      documentType: data.lostAdvertisementId.category || '',
      location: data.lostAdvertisementId.governorate || '',
      name: data.lostAdvertisementId.ownerName || '',
      description: data.lostAdvertisementId.description || '',
      images: data.lostAdvertisementId.images || [],
      userId: data.lostAdvertisementId.userId?._id || data.lostAdvertisementId.userId || '',
      publisherName: data.lostAdvertisementId.userId?.fullName || '',
      status: data.lostAdvertisementId.status || 'pending',
      date: data.lostAdvertisementId.createdAt ? new Date(data.lostAdvertisementId.createdAt).toLocaleDateString('ar-EG') : ''
    } : undefined,
    foundAdvertisement: data.foundAdvertisementId && typeof data.foundAdvertisementId === 'object' ? {
      id: data.foundAdvertisementId._id || '',
      documentType: data.foundAdvertisementId.category || '',
      location: data.foundAdvertisementId.governorate || '',
      name: data.foundAdvertisementId.ownerName || '',
      description: data.foundAdvertisementId.description || '',
      images: data.foundAdvertisementId.images || [],
      userId: data.foundAdvertisementId.userId?._id || data.foundAdvertisementId.userId || '',
      publisherName: data.foundAdvertisementId.userId?.fullName || '',
      phone: data.foundAdvertisementId.userId?.phoneNumber || data.foundAdvertisementId.contactPhone || '',
      status: data.foundAdvertisementId.status || 'pending',
      date: data.foundAdvertisementId.createdAt ? new Date(data.foundAdvertisementId.createdAt).toLocaleDateString('ar-EG') : ''
    } : undefined
  };
};

export const getAllMatches = async (page = 1, limit = 10): Promise<{ matches: Match[], total: number, totalPages: number, currentPage: number }> => {
  try {
    console.log('جلب جميع المطابقات...');
    const response = await api.get(`/api/admin/matches?page=${page}&limit=${limit}`);
    
    if (response.data && response.data.success) {
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map(transformMatch) 
        : [];
      
      return {
        matches: transformedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    }
    
    console.warn('تنسيق بيانات المطابقات غير متوقع:', response.data);
    return { matches: [], total: 0, totalPages: 1, currentPage: 1 };
  } catch (error) {
    console.error('خطأ في جلب المطابقات:', error);
    return { matches: [], total: 0, totalPages: 1, currentPage: 1 };
  }
};

export const getPendingMatches = async (page = 1, limit = 10): Promise<{ matches: Match[], total: number, totalPages: number, currentPage: number }> => {
  try {
    console.log('جلب المطابقات المعلقة...');
    const response = await api.get(`/api/admin/matches/pending?page=${page}&limit=${limit}`);
    
    if (response.data && response.data.success) {
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map(transformMatch) 
        : [];
      
      return {
        matches: transformedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    }
    
    console.warn('تنسيق بيانات المطابقات المعلقة غير متوقع:', response.data);
    return { matches: [], total: 0, totalPages: 1, currentPage: 1 };
  } catch (error) {
    console.error('خطأ في جلب المطابقات المعلقة:', error);
    return { matches: [], total: 0, totalPages: 1, currentPage: 1 };
  }
};

export const approveMatch = async (id: string): Promise<Match> => {
  try {
    console.log(`الموافقة على المطابقة بمعرف ${id}...`);
    const response = await api.put(`/api/admin/matches/${id}/approve`);
    
    if (response.data && response.data.success) {
      return transformMatch(response.data.data);
    }
    
    throw new Error('تنسيق البيانات غير متوقع أثناء الموافقة على المطابقة');
  } catch (error) {
    console.error('خطأ في الموافقة على المطابقة:', error);
    throw error;
  }
};

export const rejectMatch = async (id: string, notes?: string): Promise<Match> => {
  try {
    console.log(`رفض المطابقة بمعرف ${id}...`);
    const response = await api.put(`/api/admin/matches/${id}/reject`, { notes });
    
    if (response.data && response.data.success) {
      return transformMatch(response.data.data);
    }
    
    throw new Error('تنسيق البيانات غير متوقع أثناء رفض المطابقة');
  } catch (error) {
    console.error('خطأ في رفض المطابقة:', error);
    throw error;
  }
};

export const refreshMatches = async (): Promise<boolean> => {
  try {
    console.log('تحديث قائمة المطابقات...');
    
    // محاولة تحديث المطابقات باستخدام نقطة النهاية API المناسبة
    let response;
    
    // إضافة المزيد من معلومات التصحيح في السجلات
    console.log('🔍 البدء في تحديث المطابقات وإنشاء مطابقات جديدة...');
    
    try {
      // المحاولة الأولى: استخدام نقطة نهاية مخصصة لإجراء مطابقة أكثر مرونة
      // تتجاوز التطابق الدقيق للمحافظة
      console.log('محاولة تحديث المطابقات باستخدام نقطة نهاية مخصصة...');
      
      // جلب جميع الإعلانات المعتمدة أولاً
      const adsResponse = await api.get('/api/admin/advertisements?status=approved');
      console.log('تم جلب الإعلانات المعتمدة:', adsResponse.data?.data?.length || 0, 'إعلان');
      
      // إذا كان هناك إعلانات، نقوم بمعالجتها يدوياً للبحث عن تطابقات
      if (adsResponse.data?.data && Array.isArray(adsResponse.data.data) && adsResponse.data.data.length > 0) {
        const advertisements = adsResponse.data.data;
        
        // فصل الإعلانات حسب النوع
        const lostAds = advertisements.filter((ad: any) => ad.type === 'lost' || ad.type === 'لقطة');
        const foundAds = advertisements.filter((ad: any) => ad.type === 'found' || ad.type === 'عثور');
        
        console.log(`تم العثور على ${lostAds.length} إعلان مفقودات و ${foundAds.length} إعلان موجودات`);
        
        // إنشاء مصفوفة لتخزين المطابقات المحتملة
        const potentialMatches = [];
        
        // البحث عن المطابقات المحتملة
        for (const lostAd of lostAds) {
          for (const foundAd of foundAds) {
            // المطابقة أولاً - يجب أن تكون من نفس الفئة (جواز، هوية، إلخ)
            if (lostAd.category === foundAd.category || 
                lostAd.documentType === foundAd.documentType) {
              
              // حساب درجة التطابق
              let matchScore = 0;
              const matchingFields = [];
              
              // 1. التحقق من تطابق رقم المستمسك - هذا مهم جداً
              if (lostAd.itemNumber && foundAd.itemNumber && 
                  (lostAd.itemNumber === foundAd.itemNumber || 
                   lostAd.itemNumber.includes(foundAd.itemNumber) || 
                   foundAd.itemNumber.includes(lostAd.itemNumber))) {
                matchScore += 60;
                matchingFields.push('itemNumber');
              }
              
              // 2. التحقق من تطابق اسم المالك - مهم أيضاً
              if (lostAd.ownerName && foundAd.ownerName) {
                if (lostAd.ownerName === foundAd.ownerName) {
                  matchScore += 30;
                  matchingFields.push('ownerName');
                } else if (lostAd.ownerName.includes(foundAd.ownerName) || 
                           foundAd.ownerName.includes(lostAd.ownerName)) {
                  matchScore += 20;
                  matchingFields.push('ownerName');
                } else {
                  // تقسيم الاسم إلى أجزاء والبحث عن تطابق جزئي
                  const lostNameParts = lostAd.ownerName.split(' ');
                  const foundNameParts = foundAd.ownerName.split(' ');
                  
                  let partialMatch = false;
                  for (const lostPart of lostNameParts) {
                    if (lostPart.length < 3) continue; // تجاهل المقاطع القصيرة
                    
                    for (const foundPart of foundNameParts) {
                      if (foundPart.length < 3) continue;
                      
                      if (lostPart === foundPart) {
                        partialMatch = true;
                        break;
                      }
                    }
                    
                    if (partialMatch) break;
                  }
                  
                  if (partialMatch) {
                    matchScore += 15;
                    matchingFields.push('ownerName_partial');
                  }
                }
              }
              
              // 3. التحقق من المحافظة - إعطاء وزن صغير إذا كانت متطابقة
              if (lostAd.governorate && foundAd.governorate && lostAd.governorate === foundAd.governorate) {
                matchScore += 10;
                matchingFields.push('governorate');
              }
              
              // 4. التحقق من الوصف
              if (lostAd.description && foundAd.description) {
                if (lostAd.description === foundAd.description) {
                  matchScore += 10;
                  matchingFields.push('description');
                } else if (lostAd.description.includes(foundAd.description) || 
                           foundAd.description.includes(lostAd.description)) {
                  matchScore += 5;
                  matchingFields.push('description_partial');
                }
              }
              
              // إذا كان هناك تطابق كافي، إضافة إلى قائمة التطابقات المحتملة
              if (matchScore >= 20 || matchingFields.length > 0) {
                console.log(`تطابق محتمل: ${lostAd._id} مع ${foundAd._id} (${matchScore}%)`);
                
                // إضافة التطابق إلى القائمة
                potentialMatches.push({
                  lostAdvertisementId: lostAd._id,
                  foundAdvertisementId: foundAd._id,
                  matchScore,
                  matchingFields,
                  reason: 'Client-side matching'
                });
              }
            }
          }
        }
        
        // إذا وجدنا تطابقات، قم بإرسالها إلى الخادم للتحقق/التخزين
        if (potentialMatches.length > 0) {
          console.log(`تم العثور على ${potentialMatches.length} تطابق محتمل، إرسالها إلى الخادم...`);
          try {
            // محاولة حفظ المطابقات باستخدام نقطة نهاية مخصصة
            const saveResponse = await api.post('/api/admin/matches/bulk-create', { 
              matches: potentialMatches 
            });
            console.log('استجابة حفظ المطابقات:', saveResponse.data);
          } catch (saveError) {
            console.warn('لم يمكن حفظ المطابقات مباشرة:', saveError);
            // سنستمر مع المحاولات الأخرى
          }
        }
      }
    } catch (customError) {
      console.warn('فشلت المحاولة المخصصة للتطابق:', customError);
    }
    
    try {
      // المحاولة الأولى: استخدام مسار تشغيل المطابقة لجميع الإعلانات
      console.log('محاولة تحديث المطابقات باستخدام /api/admin/matches/run-matching...');
      response = await api.get('/api/admin/matches/run-matching');
      console.log('استجابة تحديث المطابقات:', response.data);
      
      // إذا نجحت المحاولة الأولى، أرجع النجاح
      if (response.data && response.data.success) {
        return true;
      }
    } catch (firstError) {
      console.warn('فشلت المحاولة الأولى لتحديث المطابقات:', firstError);
    }
    
    try {
      // المحاولة الثانية: استخدام مسار POST للتحديث
      console.log('محاولة تحديث المطابقات باستخدام POST /api/admin/matches/refresh...');
      response = await api.post('/api/admin/matches/refresh');
      console.log('استجابة تحديث المطابقات (POST):', response.data);
      
      // إذا نجحت المحاولة الثانية، أرجع النجاح
      if (response.data && response.data.success) {
        return true;
      }
    } catch (secondError) {
      console.warn('فشلت المحاولة الثانية لتحديث المطابقات:', secondError);
    }
    
    try {
      // المحاولة الثالثة: استخدام مسار التنظيف لإزالة التكرارات
      console.log('محاولة تنظيف المطابقات المكررة...');
      response = await api.post('/api/admin/matches/cleanup-duplicates');
      console.log('استجابة تنظيف المطابقات:', response.data);
      
      // المحاولة الرابعة: استخدام مسار المطابقات المعلقة، الذي يقوم تلقائيًا بتحديث المطابقات
      console.log('محاولة استرداد المطابقات المعلقة، والذي يؤدي إلى تحديث المطابقات...');
      const pendingResponse = await api.get('/api/admin/matches/pending?limit=1');
      console.log('استجابة المطابقات المعلقة:', pendingResponse.data);
      
      // إذا نجحت المحاولة الرابعة، أرجع النجاح
      if (pendingResponse.data && pendingResponse.data.success) {
        return true;
      }
    } catch (thirdError) {
      console.warn('فشلت المحاولات الإضافية لتحديث المطابقات:', thirdError);
    }
    
    // في حالة عدم النجاح الواضح، أرجع false
    return false;
  } catch (error) {
    console.error('خطأ في تحديث المطابقات:', error);
    return false;
  }
}; 