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
import { translateDocumentType, translateCity } from '../../../utils/translationUtils';
import './ContactRequestsList.css';

const ContactRequestsList: React.FC = () => {
  const navigate = useNavigate();
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
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

  // دالة لتنسيق وتحويل النوع إلى نص مفهوم
  const getTranslatedType = (type?: string): string => {
    if (!type) return 'غير محدد';
    return translateDocumentType(type);
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
        <div className="contact-requests-table-wrapper">
          <table className="table contact-requests-table">
            <thead>
              <tr>
                <th>رقم</th>
                <th>مقدم الطلب</th>
                <th>صاحب الإعلان</th>
                <th>تفاصيل الإعلان</th>
                <th>سبب الطلب</th>
                <th>حالة الطلب</th>
                <th>تاريخ التقديم</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={request.id}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>
                    {request.user ? (
                      <div className="user-link" onClick={() => navigateToUserProfile(request.user?.id || '')}>
                        <i className="fas fa-user"></i>
                        {request.user.fullName}
                      </div>
                    ) : 'غير معروف'}
                  </td>
                  <td>
                    {request.advertiserUser ? (
                      <div className="user-link" onClick={() => navigateToUserProfile(request.advertiserUser?.id || '')}>
                        <i className="fas fa-user"></i>
                        {request.advertiserUser.fullName}
                      </div>
                    ) : 'غير معروف'}
                  </td>
                  <td>
                    {request.advertisement ? (
                      <div className="ad-link" onClick={() => navigateToAdvertisement(request.advertisement?.id || '')}>
                        <div>
                          <div>{getTranslatedType(request.advertisement.type)}</div>
                          <div>{request.advertisement.category}</div>
                          <div>{getTranslatedLocation(request.advertisement.governorate)}</div>
                        </div>
                      </div>
                    ) : 'غير متاح'}
                  </td>
                  <td>
                    <div className="reason-text">{request.reason}</div>
                  </td>
                  <td>
                    {getStatusBadge(request.status)}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="rejection-reason">
                        <i className="fas fa-info-circle"></i>
                        {request.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>{request.createdAt}</td>
                  <td>
                    {request.status === 'pending' ? (
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(request.id)}
                          disabled={currentAction === 'approve'}
                        >
                          {currentAction === 'approve' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(request.id)}
                          disabled={currentAction === 'reject'}
                        >
                          {currentAction === 'reject' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                        </button>
                      </div>
                    ) : (
                      <div className="text-muted small">
                        {request.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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