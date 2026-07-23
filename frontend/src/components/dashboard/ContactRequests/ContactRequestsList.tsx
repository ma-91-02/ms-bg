import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllContactRequests, 
  getPendingContactRequests, 
  approveContactRequest, 
  rejectContactRequest,
  getContactRequestsByStatus,
  ContactRequest
} from '../../../services/contactRequestService';
import { translateDocumentType, translateCity, translateAdvertisementType } from '../../../utils/translationUtils';
import '../../../styles/ContactRequestsList.css';

const ContactRequestsList: React.FC = () => {
  const navigate = useNavigate();
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  // الافتراضي «الكل»: كان `pending` فيفتح القسم فارغًا حين لا توجد
  // طلبات معلّقة، ويبدو معطّلًا بينما فيه طلبات مُعالَجة
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  useEffect(() => {
    fetchContactRequests();
  }, [statusFilter, currentPage]);

  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let result;

      if (statusFilter === 'all') {
        result = await getAllContactRequests(currentPage, 10);
      } else {
        result = await getContactRequestsByStatus(statusFilter, currentPage, 10);
      }

      setContactRequests(result.requests);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch (error) {
      console.error('فشل في استرجاع طلبات التواصل:', error);
      setError('حدث خطأ أثناء جلب طلبات التواصل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setCurrentAction('approve');
      await approveContactRequest(id);
      
      // تحديث القائمة بعد الموافقة
      setContactRequests(
        contactRequests.map(req => 
          req.id === id ? { ...req, status: 'approved' } : req
        )
      );
      
      setActionSuccess('تمت الموافقة على طلب التواصل بنجاح');
      setTimeout(() => setActionSuccess(null), 3000);
      
      // إعادة تحميل البيانات بعد تغيير الحالة
      fetchContactRequests();
    } catch (error) {
      console.error('فشل في الموافقة على طلب التواصل:', error);
      setError('حدث خطأ أثناء الموافقة على طلب التواصل');
      setTimeout(() => setError(null), 3000);
    } finally {
      setCurrentAction('');
    }
  };

  const handleReject = async (id: string) => {
    setSelectedRequestId(id);
    setShowRejectionModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequestId) return;
    
    try {
      setCurrentAction('reject');
      await rejectContactRequest(selectedRequestId, rejectionReason);
      
      // تحديث القائمة بعد الرفض
      setContactRequests(
        contactRequests.map(req => 
          req.id === selectedRequestId ? { ...req, status: 'rejected', rejectionReason } : req
        )
      );
      
      setActionSuccess('تم رفض طلب التواصل بنجاح');
      setTimeout(() => setActionSuccess(null), 3000);
      
      // إعادة تحميل البيانات بعد تغيير الحالة
      fetchContactRequests();
    } catch (error) {
      console.error('فشل في رفض طلب التواصل:', error);
      setError('حدث خطأ أثناء رفض طلب التواصل');
      setTimeout(() => setError(null), 3000);
    } finally {
      setCurrentAction('');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequestId('');
    }
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
    setSelectedRequestId('');
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const navigateToUserProfile = (userId: string) => {
    if (userId) {
      navigate(`/admin/user/${userId}`, { 
        state: { previousSection: 'contacts' } 
      });
    }
  };

  const navigateToAdvertisement = (adId: string) => {
    if (adId) {
      navigate(`/admin/advertisement/${adId}`, { 
        state: { previousSection: 'contacts' } 
      });
    }
  };

  // دالة لتنسيق وتحويل الموقع إلى نص مفهوم
  const getTranslatedLocation = (location?: string): string => {
    if (!location) return 'غير محدد';
    return translateCity(location);
  };

  // تصفية طلبات التواصل بناءً على البحث
  const filteredRequests = contactRequests.filter(req => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (req.user?.fullName && req.user.fullName.toLowerCase().includes(searchLower)) ||
      (req.advertiserUser?.fullName && req.advertiserUser.fullName.toLowerCase().includes(searchLower)) ||
      (req.advertisement?.category && req.advertisement.category.toLowerCase().includes(searchLower)) ||
      (req.advertisement?.governorate && req.advertisement.governorate.toLowerCase().includes(searchLower)) ||
      (req.reason && req.reason.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning status-badge-list"><i className="fas fa-hourglass-half"></i> قيد المراجعة</span>;
      case 'approved':
        return <span className="badge bg-success status-badge-list"><i className="fas fa-check-circle"></i> تمت الموافقة</span>;
      case 'rejected':
        return <span className="badge bg-danger status-badge-list"><i className="fas fa-times-circle"></i> مرفوض</span>;
      default:
        return <span className="badge bg-secondary status-badge-list"><i className="fas fa-question-circle"></i> غير معروف</span>;
    }
  };

  return (
    <div className="contact-requests-container">
      <div className="section-header">
        <h2>إدارة طلبات التواصل</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="البحث في طلبات التواصل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
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
            className="btn btn-outline-secondary refresh-btn"
            onClick={() => fetchContactRequests()}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success" role="alert">
          <i className="fas fa-check-circle"></i> {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جارِ التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل طلبات التواصل...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="alert alert-info my-4">
          <i className="fas fa-info-circle"></i> لا توجد طلبات تواصل {statusFilter !== 'all' ? `بحالة "${statusFilter === 'pending' ? 'قيد المراجعة' : statusFilter === 'approved' ? 'تمت الموافقة' : 'مرفوض'}"` : ''}.
        </div>
      ) : (
        <div className="contact-requests-list">
          {filteredRequests.map((request) => (
            /*
             * القرار هنا كشف رقم هاتف شخص لشخص آخر.
             *
             * الجدول القديم كان يعرض ثمانية أعمدة بينها رقم متسلسل لا
             * فائدة منه، ويقصّ سبب الطلب إلى بضعة أحرف — وهو المُدخَل
             * الوحيد الذي يبني عليه المشرف قراره — ويختصر الموافقة
             * والرفض إلى أيقونتين بلا نصّ. البطاقة تعرض الطرفين
             * والإعلان والسبب كاملًا.
             */
            <div key={request.id} className={`contact-card status-${request.status}`}>
              <div className="contact-card-head">
                {getStatusBadge(request.status)}
                <span className="contact-date">
                  <i className="fas fa-calendar-alt" /> {request.createdAt}
                </span>
              </div>

              <div className="contact-parties">
                <div className="party is-requester">
                  <span className="party-role">مقدّم الطلب</span>
                  {request.user ? (
                    <>
                      <span
                        className="party-name"
                        onClick={() => navigateToUserProfile(request.user?.id || '')}
                        title="عرض ملف المستخدم"
                      >
                        <i className="fas fa-user" /> {request.user.fullName || 'بلا اسم'}
                      </span>
                      <span className="party-phone" dir="ltr">{request.user.phoneNumber}</span>
                    </>
                  ) : (
                    <span className="party-name is-empty">غير معروف</span>
                  )}
                </div>

                <i className="fas fa-arrow-left party-arrow" aria-hidden="true" />

                <div className="party is-advertiser">
                  <span className="party-role">صاحب الإعلان</span>
                  {request.advertiserUser ? (
                    <>
                      <span
                        className="party-name"
                        onClick={() => navigateToUserProfile(request.advertiserUser?.id || '')}
                        title="عرض ملف المستخدم"
                      >
                        <i className="fas fa-user" /> {request.advertiserUser.fullName || 'بلا اسم'}
                      </span>
                      {/* رقمه هو ما سيُكشَف عند الموافقة، فيبقى محجوبًا
                          في القائمة ولا يُعرض إلا في ملفّه */}
                      <span className="party-phone is-hidden">
                        <i className="fas fa-eye-slash" /> يُكشف عند الموافقة
                      </span>
                    </>
                  ) : (
                    <span className="party-name is-empty">غير معروف</span>
                  )}
                </div>
              </div>

              {request.advertisement && (
                <div
                  className="contact-ad"
                  onClick={() => navigateToAdvertisement(request.advertisement?.id || '')}
                  title="فتح الإعلان"
                >
                  <span className={`ad-type-tag ${request.advertisement.type === 'lost' ? 'is-lost' : 'is-found'}`}>
                    {/* `type` هنا نوع البلاغ (مفقود/موجود) لا نوع
                        المستمسك، وكان يمرّ على قاموس المستمسكات
                        فيخرج `lost` بالإنجليزية */}
                    {translateAdvertisementType(request.advertisement.type)}
                  </span>
                  <span className="ad-category">{translateDocumentType(request.advertisement.category)}</span>
                  <span className="ad-gov">
                    <i className="fas fa-map-marker-alt" /> {getTranslatedLocation(request.advertisement.governorate)}
                  </span>
                </div>
              )}

              <div className="contact-reason">
                <span className="reason-label">سبب الطلب</span>
                <p>{request.reason || '—'}</p>
              </div>

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="contact-rejection">
                  <i className="fas fa-info-circle" /> {request.rejectionReason}
                </div>
              )}

              {request.status === 'pending' && (
                <div className="contact-card-actions">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleApprove(request.id)}
                    disabled={currentAction === 'approve'}
                  >
                    {currentAction === 'approve'
                      ? <><i className="fas fa-spinner fa-spin" /> جارٍ…</>
                      : <><i className="fas fa-check" /> موافقة وكشف الرقم</>}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleReject(request.id)}
                    disabled={currentAction === 'reject'}
                  >
                    {currentAction === 'reject'
                      ? <><i className="fas fa-spinner fa-spin" /> جارٍ…</>
                      : <><i className="fas fa-times" /> رفض</>}
                  </button>
                </div>
              )}
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

      {/* Modal for rejection reason */}
      {showRejectionModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">سبب رفض طلب التواصل</h5>
                <button type="button" className="btn-close" onClick={closeRejectionModal}></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rejectionReason">يرجى تحديد سبب الرفض:</label>
                  <textarea
                    className="form-control mt-2"
                    id="rejectionReason"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="اكتب سبب رفض طلب التواصل هنا..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRejectionModal}>
                  إلغاء
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmReject}
                  disabled={currentAction === 'reject'}
                >
                  {currentAction === 'reject' ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      جارِ الرفض...
                    </>
                  ) : (
                    'تأكيد الرفض'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequestsList; 