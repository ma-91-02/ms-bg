import React, { useState, useEffect } from 'react';
import { getAllAdvertisements, getAdvertisementsByStatus, Advertisement, deleteAdvertisement, approveAdvertisement, rejectAdvertisement, resolveAdvertisement } from '../../../services/advertisementService';
import { translateDocumentType, translateCity } from '../../../utils/translationUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import AdvertisementDetails from './AdvertisementDetails';
import '../../../styles/AdvertisementsList.css';

// Import necessary components from bootstrap library
// If these imports cause linter errors, ensure bootstrap and react-bootstrap are correctly installed
// You may need to run: npm install react-bootstrap bootstrap

const AdvertisementsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvertisements();
  }, [statusFilter]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Advertisement[];
      
      if (statusFilter === 'all') {
        data = await getAllAdvertisements();
      } else {
        data = await getAdvertisementsByStatus(statusFilter);
      }
      
      console.log('تم استلام الإعلانات:', data);
      setAdvertisements(data);
    } catch (error) {
      console.error('فشل في استرجاع الإعلانات:', error);
      setError('حدث خطأ أثناء جلب الإعلانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على نوع المستند مترجم
  const getTranslatedDocumentType = (type?: string): string => {
    if (!type) return 'مستند';
    return translateDocumentType(type);
  };
  
  // دالة للحصول على اسم المدينة مترجم
  const getTranslatedLocation = (location?: string): string => {
    if (!location) return 'غير محدد';
    return translateCity(location);
  };

  // التوجيه إلى صفحة المستخدم الشخصية
  const navigateToUserProfile = (userId: string | { _id?: string } | undefined, event: React.MouseEvent) => {
    event.stopPropagation(); // منع انتشار الحدث إلى العنصر الأب
    
    if (!userId) return;
    
    let userIdString: string;
    
    // التعامل مع الحالة عندما يكون userId كائنًا
    if (typeof userId === 'object') {
      // إذا كان كائن، نستخدم حقل _id إذا كان متوفرًا
      if (userId._id) {
        userIdString = userId._id;
      } else {
        console.warn('كائن المستخدم لا يحتوي على معرف صالح:', userId);
        return;
      }
    } else {
      // إذا كان نصًا، نستخدمه مباشرة
      userIdString = userId;
    }
    
    // التوجيه مباشرة إلى صفحة المستخدم الشخصية مع تحديد القسم الحالي بوضوح
    navigate(`/admin/user/${userIdString}`, {
      state: { previousSection: 'advertisements' }
    });
    console.log('تم التوجيه إلى صفحة المستخدم مع حفظ القسم النشط:', 'advertisements');
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان؟')) {
      try {
        setCurrentAction('delete');
        await deleteAdvertisement(id);
        setAdvertisements(advertisements.filter(ad => ad.id !== id));
        setActionSuccess('تم حذف الإعلان بنجاح');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (error) {
        console.error('فشل في حذف الإعلان:', error);
        setError('حدث خطأ أثناء حذف الإعلان');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleApprove = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setCurrentAction('approve');
      await approveAdvertisement(id);
      setAdvertisements(
        advertisements.map(ad => 
          ad.id === id ? { ...ad, status: 'approved' as const } : ad
        )
      );
      setActionSuccess('تمت الموافقة على الإعلان بنجاح');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error) {
      console.error('فشل في الموافقة على الإعلان:', error);
      setError('حدث خطأ أثناء الموافقة على الإعلان');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReject = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setCurrentAction('reject');
      await rejectAdvertisement(id);
      setAdvertisements(
        advertisements.map(ad => 
          ad.id === id ? { ...ad, status: 'rejected' as const } : ad
        )
      );
      setActionSuccess('تم رفض الإعلان بنجاح');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error) {
      console.error('فشل في رفض الإعلان:', error);
      setError('حدث خطأ أثناء رفض الإعلان');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleResolve = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setCurrentAction('resolve');
      console.log(`بدء تنفيذ تحديد الإعلان رقم ${id} كمحلول`);
      await resolveAdvertisement(id);
      
      // تحديث حالة الإعلان في قائمة الإعلانات
      setAdvertisements(
        advertisements.map(ad => 
          ad.id === id ? { ...ad, status: 'resolved' as const } : ad
        )
      );
      
      setActionSuccess('تم تحديد الإعلان كمحلول بنجاح');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error) {
      console.error('فشل في تحديد الإعلان كمحلول:', error);
      setError('حدث خطأ أثناء تحديد الإعلان كمحلول');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openImageModal = (ad: Advertisement, image: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAd(ad);
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  const handleViewDetails = (adId: string) => {
    setSelectedAdId(adId);
  };

  const closeDetails = () => {
    setSelectedAdId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning status-badge-list"><i className="fas fa-hourglass-half"></i> قيد المراجعة</span>;
      case 'approved':
        return <span className="badge bg-success status-badge-list"><i className="fas fa-check-circle"></i> موافق عليه</span>;
      case 'rejected':
        return <span className="badge bg-danger status-badge-list"><i className="fas fa-times-circle"></i> مرفوض</span>;
      case 'resolved':
        return <span className="badge bg-info status-badge-list"><i className="fas fa-check-double"></i> تم استرداده</span>;
      default:
        return <span className="badge bg-secondary status-badge-list"><i className="fas fa-question-circle"></i> غير معروف</span>;
    }
  };

  // تصفية الإعلانات بناءً على البحث
  const filteredAdvertisements = advertisements.filter(ad => {
    // البحث في مختلف حقول الإعلان
    const searchLower = searchQuery.toLowerCase();
    return (
      (ad.name && ad.name.toLowerCase().includes(searchLower)) ||
      (ad.documentType && ad.documentType.toLowerCase().includes(searchLower)) ||
      (ad.location && ad.location.toLowerCase().includes(searchLower)) ||
      (ad.landmark && ad.landmark.toLowerCase().includes(searchLower)) ||
      (ad.phone && ad.phone.includes(searchQuery))
    );
  });

  // دالة للتحقق من القيمة قبل عرضها
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) {
      return 'غير متوفر';
    }
    
    if (typeof value === 'object') {
      if (value._id || value.phoneNumber || value.fullName) {
        return value.fullName || value.name || JSON.stringify(value);
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // دالة للحصول على اسم ناشر الإعلان
  const getPublisherName = (ad: Advertisement): string => {
    // التحقق من وجود كائن userId وحقل fullName
    if (ad.userId && typeof ad.userId === 'object') {
      // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن userId يمكن أن يكون كائنًا بخاصية fullName
      if (ad.userId.fullName) {
        // @ts-ignore
        return ad.userId.fullName;
      }
    }
    
    // استخدام publisherName كاحتياطي
    if (ad.publisherName) {
      return ad.publisherName;
    }
    
    return 'ناشر الإعلان';
  };

  // دالة للتعامل مع طلب التواصل عبر البريد الإلكتروني
  const handleContactUser = (userId: string | undefined, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (userId) {
      // هنا يمكن إضافة منطق فتح نموذج المراسلة أو الانتقال إلى صفحة المراسلة
      navigate(`/admin/message/${userId}`);
    }
  };

  // دالة للتعامل مع طلب الاتصال بالواتساب
  const handleWhatsappUser = (ad: Advertisement, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // طباعة بيانات الإعلان للتصحيح
    console.log('بيانات الإعلان الكاملة:', ad);
    console.log('بيانات المستخدم (userId):', ad.userId);
    
    // استخدام رقم الهاتف الخاص بالمستخدم الذي نشر الإعلان
    let phoneNumber = '';
    
    // التحقق من وجود كائن userId وحقل phoneNumber
    if (ad.userId && typeof ad.userId === 'object') {
      // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن userId يمكن أن يكون كائنًا
      if (ad.userId.phoneNumber) {
        // @ts-ignore
        phoneNumber = ad.userId.phoneNumber;
        console.log('تم العثور على رقم الهاتف من بيانات المستخدم:', phoneNumber);
      } else {
        console.warn('لم يتم العثور على رقم الهاتف في بيانات المستخدم:', ad.userId);
      }
    } else {
      console.warn('userId ليس كائنًا أو غير موجود:', ad.userId);
    }
    
    // التحقق من وجود رقم هاتف
    if (phoneNumber) {
      // تنظيف رقم الهاتف من أي أحرف غير رقمية (مثل +)
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
      console.log('رقم الهاتف النظيف:', cleanedPhoneNumber);
      window.open(`https://wa.me/${cleanedPhoneNumber}`, '_blank');
    } else {
      // تجربة استخدام رقم الهاتف من الإعلان نفسه كاحتياطي
      if (ad.phone) {
        const cleanedPhoneNumber = ad.phone.replace(/\D/g, '');
        console.log('استخدام رقم الهاتف من الإعلان كاحتياطي:', cleanedPhoneNumber);
        window.open(`https://wa.me/${cleanedPhoneNumber}`, '_blank');
      } else {
        console.error('لا يوجد رقم هاتف متاح في بيانات الإعلان أو المستخدم');
        alert('رقم الهاتف غير متوفر');
      }
    }
  };

  return (
    <div className="advertisements-list">
      <div className="section-header">
        <h2>إدارة الإعلانات</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="ابحث عن الإعلانات..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الإعلانات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">موافق عليها</option>
              <option value="rejected">مرفوضة</option>
              <option value="resolved">تم استردادها</option>
            </select>
          </div>
          <button className="btn btn-primary refresh-btn" onClick={() => fetchAdvertisements()}>
            تحديث
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {actionSuccess}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setActionSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">جار التحميل...</span>
          </div>
        </div>
      ) : (
        <>
          {filteredAdvertisements.length === 0 ? (
            <div className="text-center my-5">
              <p>لا توجد إعلانات متاحة</p>
            </div>
          ) : (
            <div className="ad-cards-container">
              {filteredAdvertisements.map((ad) => (
                <div 
                  key={ad.id} 
                  className="ad-card"
                  onClick={() => ad.id && handleViewDetails(ad.id)}
                >
                  <div className="ad-card-header">
                    <div className="ad-image-container">
                      {ad.images && ad.images.length > 0 ? (
                        <img 
                          src={ad.images[0]} 
                          alt={getTranslatedDocumentType(ad.documentType)} 
                          className="ad-thumbnail"
                          onClick={(e) => ad.images && openImageModal(ad, ad.images[0], e)}
                        />
                      ) : (
                        <div className="no-image">
                          <span>لا توجد صورة</span>
                        </div>
                      )}
                      <div className="image-status-overlay">
                        {getStatusBadge(ad.status || 'pending')}
                      </div>
                    </div>
                    <div className="ad-info">
                      <h3>{getTranslatedDocumentType(ad.documentType)}</h3>
                      <div className="ad-document-info">
                        <span className="document-title">اسم:</span>
                        <span className="document-value">{safeRender(ad.name)}</span>
                      </div>
                      
                      <div className="ad-user-info">
                        <span 
                          className="user-name-link"
                          onClick={(e) => navigateToUserProfile(ad.userId, e)}
                          title="عرض ملف الناشر"
                        >
                          <i className="fas fa-user publisher-icon"></i> {getPublisherName(ad)}
                          <span className="user-actions">
                            <i 
                              className="fab fa-whatsapp user-whatsapp-icon" 
                              title="اتصال واتساب"
                              onClick={(e) => handleWhatsappUser(ad, e)}
                            ></i>
                          </span>
                        </span>
                      </div>
                      
                      <div className="ad-meta">
                        <span className="ad-location">
                          <i className="fas fa-map-marker-alt location-icon"></i> {getTranslatedLocation(ad.location)}
                        </span>
                        <span className="ad-date">
                          <i className="fas fa-calendar-alt"></i> {ad.date || 'غير متوفر'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ad-card-footer">
                    <button 
                      className="btn btn-sm btn-outline-primary details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        ad.id && handleViewDetails(ad.id);
                      }}
                    >
                      <i className="fas fa-eye"></i> عرض التفاصيل
                    </button>
                    <div className="action-buttons">
                      {ad.status !== 'approved' && (
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={(e) => ad.id && handleApprove(ad.id, e)}
                          disabled={!ad.id || currentAction === 'approve'}
                        >
                          <i className="fas fa-check"></i> موافقة
                        </button>
                      )}
                      
                      {ad.status !== 'rejected' && (
                        <button 
                          className="btn btn-sm btn-danger mx-1" 
                          onClick={(e) => ad.id && handleReject(ad.id, e)}
                          disabled={!ad.id || currentAction === 'reject'}
                        >
                          <i className="fas fa-times"></i> رفض
                        </button>
                      )}
                      
                      {ad.status !== 'resolved' && (
                        <button 
                          className="btn btn-sm btn-info" 
                          onClick={(e) => ad.id && handleResolve(ad.id, e)}
                          disabled={!ad.id || currentAction === 'resolve'}
                        >
                          <i className="fas fa-check-double"></i> تحديد كمحلول
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-sm btn-outline-danger mx-1" 
                        onClick={(e) => ad.id && handleDelete(ad.id, e)}
                        disabled={!ad.id || currentAction === 'delete'}
                      >
                        <i className="fas fa-trash"></i> حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Image Modal - مربع حوار الصور */}
      {showImageModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">صور المستند</h5>
                <button type="button" className="btn-close" onClick={closeImageModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {selectedImage && (
                  <div className="text-center">
                    <img src={selectedImage} className="img-fluid" alt="صورة المستند" />
                  </div>
                )}
                {selectedAd && selectedAd.images && selectedAd.images.length > 1 && (
                  <div className="image-thumbnails mt-3 d-flex flex-wrap">
                    {selectedAd.images.map((img, index) => (
                      <img 
                        key={index}
                        src={img} 
                        className="img-thumbnail mx-2" 
                        style={{ width: '100px', cursor: 'pointer' }}
                        onClick={() => setSelectedImage(img)}
                        alt={`صورة رقم ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeImageModal}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* تفاصيل الإعلان */}
      {selectedAdId && (
        <AdvertisementDetails 
          adId={selectedAdId}
          onClose={closeDetails}
        />
      )}
    </div>
  );
};

export default AdvertisementsList; 