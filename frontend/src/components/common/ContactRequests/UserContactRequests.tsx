import React, { useState, useEffect } from 'react';
import { getUserContactRequests, getContactInfo, ContactRequest, ContactInfo } from '../../../services/contactRequestService';
import './UserContactRequests.css';

interface UserContactRequestsProps {
  onClose?: () => void;
}

const UserContactRequests: React.FC<UserContactRequestsProps> = ({ onClose }) => {
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingContactInfo, setLoadingContactInfo] = useState<boolean>(false);
  const [contactInfoError, setContactInfoError] = useState<string | null>(null);
  const [showContactInfoModal, setShowContactInfoModal] = useState<boolean>(false);

  useEffect(() => {
    fetchContactRequests();
  }, [statusFilter, currentPage]);

  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getUserContactRequests(
        statusFilter !== 'all' ? statusFilter : undefined, 
        currentPage
      );
      
      setContactRequests(result.requests);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch (error: any) {
      console.error('فشل في استرجاع طلبات التواصل:', error);
      setError('حدث خطأ أثناء جلب طلبات التواصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const viewContactInfo = async (request: ContactRequest) => {
    if (request.status !== 'approved') {
      return;
    }
    
    setSelectedRequest(request);
    setShowContactInfoModal(true);
    setContactInfo(null);
    setContactInfoError(null);
    
    try {
      setLoadingContactInfo(true);
      const info = await getContactInfo(request.id);
      setContactInfo(info);
    } catch (error: any) {
      console.error('فشل في استرجاع معلومات التواصل:', error);
      setContactInfoError(error.response?.data?.message || 'حدث خطأ أثناء جلب معلومات التواصل');
    } finally {
      setLoadingContactInfo(false);
    }
  };

  const closeContactInfoModal = () => {
    setShowContactInfoModal(false);
    setSelectedRequest(null);
    setContactInfo(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning status-badge"><i className="fas fa-hourglass-half"></i> قيد المراجعة</span>;
      case 'approved':
        return <span className="badge bg-success status-badge"><i className="fas fa-check-circle"></i> تمت الموافقة</span>;
      case 'rejected':
        return <span className="badge bg-danger status-badge"><i className="fas fa-times-circle"></i> مرفوض</span>;
      default:
        return <span className="badge bg-secondary status-badge"><i className="fas fa-question-circle"></i> غير معروف</span>;
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== 'غير متوفر') {
      // تنظيف رقم الهاتف من أي أحرف غير رقمية
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanedNumber}`, '_blank');
    } else {
      alert('رقم الهاتف غير متوفر');
    }
  };

  return (
    <div className="user-contact-requests-container">
      <div className="section-header">
        <h2>طلبات التواصل الخاصة بك</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>&times;</button>
        )}
      </div>

      <div className="filters-container">
        <div className="status-filter">
          <label>تصفية حسب الحالة:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">جميع الطلبات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">تمت الموافقة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
        <button 
          className="refresh-button"
          onClick={fetchContactRequests}
          disabled={loading}
        >
          <i className="fas fa-sync-alt"></i> تحديث
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل طلبات التواصل...</p>
        </div>
      ) : contactRequests.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <p>لا توجد طلبات تواصل {statusFilter !== 'all' ? `بحالة "${statusFilter === 'pending' ? 'قيد المراجعة' : statusFilter === 'approved' ? 'تمت الموافقة' : 'مرفوض'}"` : ''}</p>
        </div>
      ) : (
        <div className="contact-requests-list">
          {contactRequests.map((request) => (
            <div 
              key={request.id} 
              className={`contact-request-card ${request.status}`}
            >
              <div className="request-header">
                <h3>
                  {request.advertisement?.type === 'lost' ? 'مستند مفقود' : 'مستند موجود'}: {request.advertisement?.category}
                </h3>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="request-details">
                <p className="publisher">
                  <strong>ناشر الإعلان:</strong> {request.advertiserUser?.fullName || 'غير متوفر'}
                </p>
                <p className="governorate">
                  <strong>المحافظة:</strong> {request.advertisement?.governorate || 'غير متوفر'}
                </p>
                <p className="reason">
                  <strong>سبب الطلب:</strong> {request.reason}
                </p>
                <p className="date">
                  <strong>تاريخ الطلب:</strong> {request.createdAt}
                </p>
                
                {request.status === 'rejected' && request.rejectionReason && (
                  <p className="rejection-reason">
                    <strong>سبب الرفض:</strong> {request.rejectionReason}
                  </p>
                )}
              </div>
              
              <div className="request-actions">
                {request.status === 'approved' ? (
                  <button 
                    className="view-contact-btn"
                    onClick={() => viewContactInfo(request)}
                  >
                    <i className="fas fa-eye"></i> عرض معلومات التواصل
                  </button>
                ) : (
                  <div className="status-note">
                    {request.status === 'pending' ? (
                      <span>في انتظار موافقة الإدارة</span>
                    ) : (
                      <span>تم رفض الطلب</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <span className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                السابق
              </span>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <span className="page-link" onClick={() => handlePageChange(page)}>
                  {page}
                </span>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <span className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                التالي
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* نافذة معلومات التواصل */}
      {showContactInfoModal && (
        <div className="contact-info-modal-backdrop">
          <div className="contact-info-modal">
            <div className="modal-header">
              <h5 className="modal-title">معلومات التواصل</h5>
              <button type="button" className="close-button" onClick={closeContactInfoModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {loadingContactInfo ? (
                <div className="loading-container small">
                  <div className="spinner"></div>
                  <p>جاري تحميل معلومات التواصل...</p>
                </div>
              ) : contactInfoError ? (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle"></i> {contactInfoError}
                </div>
              ) : contactInfo ? (
                <div className="contact-info">
                  <div className="info-item">
                    <i className="fas fa-user"></i>
                    <div>
                      <label>اسم ناشر الإعلان</label>
                      <p>{contactInfo.advertiserName}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <label>رقم الهاتف</label>
                      <p>{contactInfo.contactPhone || contactInfo.userPhone}</p>
                      <button 
                        className="whatsapp-button"
                        onClick={() => openWhatsApp(contactInfo.contactPhone || contactInfo.userPhone)}
                      >
                        <i className="fab fa-whatsapp"></i> اتصال عبر واتساب
                      </button>
                    </div>
                  </div>
                  
                  <div className="contact-note">
                    <i className="fas fa-info-circle"></i>
                    <p>
                      يرجى التعامل مع معلومات الاتصال بسرية تامة واستخدامها فقط للغرض المذكور في طلب التواصل.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state small">
                  <p>لا توجد معلومات متاحة</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeContactInfoModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContactRequests; 