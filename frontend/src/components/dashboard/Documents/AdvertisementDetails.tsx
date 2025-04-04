import React, { useState, useEffect } from 'react';
import { Advertisement, getAdvertisementById } from '../../../services/advertisementService';
import { translateDocumentType, translateCity } from '../../../utils/translationUtils';
import { useNavigate } from 'react-router-dom';
import { createContactRequest } from '../../../services/contactRequestService';
import '../../../styles/AdvertisementDetails.css';

interface AdvertisementDetailsProps {
  adId: string;
  onClose: () => void;
  isAdminView?: boolean;
}

const AdvertisementDetails: React.FC<AdvertisementDetailsProps> = ({ adId, onClose, isAdminView = true }) => {
  const navigate = useNavigate();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [contactReason, setContactReason] = useState<string>('');
  const [submittingContact, setSubmittingContact] = useState<boolean>(false);
  const [contactRequestSuccess, setContactRequestSuccess] = useState<boolean>(false);
  const [contactRequestError, setContactRequestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvertisementDetails = async () => {
      try {
        setLoading(true);
        const adData = await getAdvertisementById(adId);
        console.log('تم استلام بيانات الإعلان:', adData);
        if (adData) {
          Object.entries(adData).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              console.warn(`حقل الإعلان "${key}" هو كائن وليس قيمة بسيطة:`, value);
            }
          });
        }
        setAdvertisement(adData);
      } catch (err) {
        console.error('خطأ في جلب تفاصيل الإعلان:', err);
        setError('حدث خطأ أثناء جلب بيانات الإعلان');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisementDetails();
  }, [adId]);

  // توجيه إلى صفحة المستخدم الشخصية
  const navigateToUserProfile = () => {
    if (advertisement && advertisement.userId) {
      onClose(); // إغلاق النافذة المنبثقة أولاً
      
      // التحقق مما إذا كان userId كائنًا أم لا
      const userId = typeof advertisement.userId === 'object' && advertisement.userId._id 
        ? advertisement.userId._id 
        : advertisement.userId;
      
      console.log('التوجيه إلى صفحة المستخدم من تفاصيل الإعلان مع القسم: advertisements');
      
      // التوجيه إلى صفحة الملف الشخصي للمستخدم مع الاحتفاظ بالقسم النشط
      navigate(`/admin/user/${userId}`, {
        state: { previousSection: 'advertisements' } // حفظ المعلومات عن القسم الحالي
      });
    }
  };

  // الحصول على رقم هاتف المستخدم
  const getUserPhoneNumber = (): string => {
    if (!advertisement) return 'غير متوفر';

    // التحقق من وجود رقم الهاتف في كائن المستخدم
    if (advertisement.userId && typeof advertisement.userId === 'object') {
      // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن userId يمكن أن يكون كائنًا
      const userPhone = advertisement.userId.phoneNumber;
      if (userPhone) {
        return userPhone;
      }
    }
    
    // استخدام رقم الهاتف من الإعلان كاحتياطي
    return advertisement.phone || 'غير متوفر';
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'resolved': return 'resolved';
      default: return 'pending';
    }
  };

  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'معتمد';
      case 'rejected': return 'مرفوض';
      case 'resolved': return 'تم الحل';
      default: return '';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير متوفر';
    
    try {
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  const safeRender = (value: any, isDocType = false, isLocation = false): string => {
    if (!value) return 'غير متوفر';
    
    if (isDocType) {
      return translateDocumentType(String(value));
    }
    
    if (isLocation) {
      return translateCity(String(value));
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('ar-EG');
    }
    
    return String(value);
  };

  const getTranslatedDocumentType = (): string => {
    if (!advertisement || !advertisement.documentType) return 'مستند';
    
    return translateDocumentType(advertisement.documentType);
  };

  // الحصول على اسم ناشر الإعلان
  const getPublisherName = (): string => {
    if (!advertisement) return 'غير معروف';
    
    if (advertisement.userId && typeof advertisement.userId === 'object') {
      // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن userId يمكن أن يكون كائنًا بخاصية fullName
      const userName = advertisement.userId.fullName || advertisement.userId.name;
      if (userName) {
        return userName;
      }
    }
    
    if (advertisement.publisherName) {
      return advertisement.publisherName;
    }
    
    return 'ناشر الإعلان';
  };

  // دالة لفتح واتساب باستخدام رقم الهاتف
  const openWhatsApp = (event: React.MouseEvent) => {
    event.preventDefault();
    const phoneNumber = getUserPhoneNumber();
    if (phoneNumber && phoneNumber !== 'غير متوفر') {
      // تنظيف رقم الهاتف من أي أحرف غير رقمية
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanedNumber}`, '_blank');
    } else {
      alert('رقم الهاتف غير متوفر');
    }
  };

  // فتح نافذة طلب التواصل
  const openContactModal = () => {
    setContactReason('');
    setContactRequestSuccess(false);
    setContactRequestError(null);
    setShowContactModal(true);
  };

  // إغلاق نافذة طلب التواصل
  const closeContactModal = () => {
    setShowContactModal(false);
  };

  // إرسال طلب التواصل
  const handleContactRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!advertisement || !contactReason.trim()) {
      setContactRequestError('الرجاء كتابة سبب طلب التواصل');
      return;
    }
    
    try {
      setSubmittingContact(true);
      setContactRequestError(null);
      
      // استخدام معرف الإعلان مع تسجيل تفصيلي
      const adId = advertisement.id || '';
      console.log('بيانات الإعلان المرسلة لطلب التواصل:', { 
        adId,
        advertisementData: advertisement,
        reason: contactReason 
      });
      
      if (!adId) {
        throw new Error('معرف الإعلان غير متوفر');
      }
      
      // إرسال الطلب مع إضافة معالجة خطأ أكثر تفصيلاً
      try {
        await createContactRequest(adId, contactReason);
        console.log('تم إرسال طلب التواصل بنجاح للإعلان:', adId);
        
        setContactRequestSuccess(true);
        setContactReason('');
        
        // إغلاق النافذة بعد 3 ثواني
        setTimeout(() => {
          setShowContactModal(false);
        }, 3000);
      } catch (apiError: any) {
        // تسجيل تفاصيل الخطأ
        console.error('خطأ API في إرسال طلب التواصل:', {
          status: apiError.response?.status,
          message: apiError.response?.data?.message,
          error: apiError.message
        });
        throw apiError;
      }
      
    } catch (error: any) {
      console.error('خطأ في إرسال طلب التواصل:', error);
      setContactRequestError(error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال طلب التواصل');
    } finally {
      setSubmittingContact(false);
    }
  };

  // التحقق مما إذا كانت معلومات الاتصال مخفية
  const isContactInfoHidden = (): boolean => {
    if (!advertisement) return false;
    
    // إذا كان العرض في واجهة المسؤول، لا تخفِ المعلومات
    if (isAdminView) return false;
    
    // التحقق من خاصية hideContactInfo أينما وجدت
    return (advertisement as any).hideContactInfo === true;
  };

  return (
    <div className="ad-details-modal-backdrop" onClick={onClose}>
      <div className="ad-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>إعادة المحاولة</button>
          </div>
        ) : advertisement ? (
          <div className="ad-details-content">
            <div className="ad-header">
              <h2>{getTranslatedDocumentType()} {getStatusText(advertisement.status)}</h2>
              <span className={`status-badge ${getStatusClass(advertisement.status)}`}>
                {getStatusText(advertisement.status)}
              </span>
            </div>
            
            {advertisement.images && advertisement.images.length > 0 ? (
              <div className="ad-images-container">
                <div className="main-image">
                  <img 
                    src={advertisement.images[activeImageIndex]} 
                    alt={`صورة ${getTranslatedDocumentType()}`}
                    className="img-fluid main-image-display"
                  />
                </div>
                {advertisement.images.length > 1 && (
                  <div className="image-thumbnails">
                    {advertisement.images.map((img, index) => (
                      <div 
                        key={index}
                        className={`thumbnail-container ${index === activeImageIndex ? 'active' : ''}`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img 
                          src={img} 
                          alt={`صورة مصغرة ${index + 1}`}
                          className="thumbnail-image"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-images">
                <div className="no-image-placeholder">
                  <span>لا توجد صور متاحة</span>
                </div>
              </div>
            )}
            
            <div className="ad-info-grid">
              <div className="info-item">
                <div className="info-label">اسم المستند</div>
                <div className="info-value">{safeRender(advertisement.name)}</div>
                <div className="info-description">الاسم المسجل على المستند المفقود/الموجود</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">نوع المستند</div>
                <div className="info-value">{safeRender(advertisement.documentType, true)}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">رقم هاتف ناشر الإعلان</div>
                <div className="info-value phone-with-whatsapp">
                  {isContactInfoHidden() ? (
                    <>
                      <span>********* (متاح عند طلب الاتصال)</span>
                      {!isAdminView && (
                        <button 
                          className="btn btn-primary contact-request-btn"
                          onClick={openContactModal}
                        >
                          <i className="fas fa-phone-alt"></i> طلب التواصل
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {getUserPhoneNumber()}
                      <a href="#" onClick={openWhatsApp} className="whatsapp-link">
                        <i className="fab fa-whatsapp"></i> اتصال واتساب
                      </a>
                    </>
                  )}
                </div>
                <div className="info-description">رقم الاتصال الخاص بالشخص الذي نشر الإعلان</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">المحافظة</div>
                <div className="info-value">{safeRender(advertisement.location, false, true)}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">أقرب نقطة دالة</div>
                <div className="info-value">{safeRender(advertisement.landmark) || 'لم يتم تحديد معلم قريب'}</div>
                <div className="info-description">مكان معروف أو معلم مميز قريب من موقع العثور/الفقدان</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">تاريخ النشر</div>
                <div className="info-value">{safeRender(advertisement.date)}</div>
              </div>

              <div className="info-item full-width">
                <div className="info-label">ناشر الإعلان</div>
                <div className="info-value">
                  <span 
                    className={isAdminView ? "user-name-link" : ""}
                    onClick={isAdminView ? navigateToUserProfile : undefined}
                    title={isAdminView ? "عرض ملف المستخدم" : ""}
                  >
                    {getPublisherName()}
                  </span>
                </div>
                <div className="info-description">المستخدم الذي قام بنشر إعلان العثور أو الفقدان</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-ad-found">
            <p>لم يتم العثور على بيانات الإعلان</p>
          </div>
        )}
      </div>

      {/* نافذة طلب التواصل */}
      {showContactModal && (
        <div className="contact-request-modal-backdrop">
          <div className="contact-request-modal">
            <div className="modal-header">
              <h5 className="modal-title">طلب التواصل مع ناشر الإعلان</h5>
              <button type="button" className="close-button" onClick={closeContactModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {contactRequestSuccess ? (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <p>تم إرسال طلب التواصل بنجاح وسيتم مراجعته من قبل الإدارة</p>
                </div>
              ) : (
                <form onSubmit={handleContactRequest}>
                  {contactRequestError && (
                    <div className="alert alert-danger">{contactRequestError}</div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="contactReason">سبب طلب التواصل*</label>
                    <textarea
                      id="contactReason"
                      className="form-control"
                      rows={4}
                      placeholder="يرجى ذكر سبب طلب التواصل مع ناشر الإعلان..."
                      value={contactReason}
                      onChange={(e) => setContactReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-info">
                    <p>
                      <i className="fas fa-info-circle"></i>
                      سيتم مراجعة طلبك من قبل الإدارة وإبلاغك عند الموافقة عليه.
                    </p>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={closeContactModal}
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submittingContact || !contactReason.trim()}
                    >
                      {submittingContact ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          جارِ الإرسال...
                        </>
                      ) : (
                        'إرسال الطلب'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementDetails; 