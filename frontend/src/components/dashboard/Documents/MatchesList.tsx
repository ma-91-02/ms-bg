import React, { useState, useEffect } from 'react';
import { getAllMatches, getPendingMatches, approveMatch, rejectMatch, refreshMatches, Match } from '../../../services/matchesService';
import { translateDocumentType, translateCity } from '../../../utils/translationUtils';
import { useNavigate } from 'react-router-dom';
import '../../../styles/MatchesList.css';

const MatchesList: React.FC = () => {
  const navigate = useNavigate();
  
  // حالة البيانات
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // حالة التصفية والبحث
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // حالة الصفحات
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  
  // حالة النوافذ المنبثقة
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');
  
  // محتوى التحميل الأولي
  useEffect(() => {
    fetchMatches();
  }, [statusFilter, currentPage]);
  
  // جلب المطابقات
  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      let response;
      if (statusFilter === 'pending') {
        response = await getPendingMatches(currentPage);
      } else {
        response = await getAllMatches(currentPage);
      }
      
      setMatches(response.matches);
      setTotalPages(response.totalPages);
      setTotalMatches(response.total);
      
    } catch (err) {
      console.error('خطأ في جلب المطابقات:', err);
      setError('حدث خطأ أثناء جلب بيانات المطابقات');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // تحديث المطابقات
  const handleRefreshMatches = async () => {
    try {
      setLoading(true);
      
      // تنفيذ عملية تحديث المطابقات
      const refreshSuccess = await refreshMatches();
      
      if (refreshSuccess) {
        setSuccessMessage('تم تحديث المطابقات بنجاح. قد تظهر مطابقات جديدة في القائمة.');
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // إعادة جلب البيانات المحدثة
        await fetchMatches();
      } else {
        setError('حدث خطأ أثناء تحديث المطابقات');
        setTimeout(() => setError(null), 3000);
      }
      
    } catch (err) {
      console.error('خطأ في تحديث المطابقات:', err);
      setError('حدث خطأ أثناء تحديث بيانات المطابقات');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // الموافقة على المطابقة
  const handleApproveMatch = async (id: string) => {
    try {
      setLoading(true);
      await approveMatch(id);
      
      // تحديث قائمة المطابقات في الواجهة
      setMatches(matches.map(match => 
        match.id === id ? { ...match, status: 'approved' } : match
      ));
      
      setSuccessMessage('تمت الموافقة على المطابقة بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // إعادة جلب البيانات بعد التحديث
      await fetchMatches();
    } catch (err) {
      console.error('خطأ في الموافقة على المطابقة:', err);
      setError('حدث خطأ أثناء الموافقة على المطابقة');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // فتح نافذة رفض المطابقة
  const openRejectModal = (id: string) => {
    setSelectedMatchId(id);
    setRejectionNotes('');
    setShowRejectModal(true);
  };
  
  // إغلاق نافذة رفض المطابقة
  const closeRejectModal = () => {
    setSelectedMatchId(null);
    setRejectionNotes('');
    setShowRejectModal(false);
  };
  
  // تأكيد رفض المطابقة
  const confirmRejectMatch = async () => {
    if (!selectedMatchId) return;
    
    try {
      setLoading(true);
      await rejectMatch(selectedMatchId, rejectionNotes);
      
      // تحديث قائمة المطابقات في الواجهة
      setMatches(matches.map(match => 
        match.id === selectedMatchId ? { ...match, status: 'rejected', notes: rejectionNotes } : match
      ));
      
      setSuccessMessage('تم رفض المطابقة بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // إغلاق النافذة المنبثقة
      closeRejectModal();
      
      // إعادة جلب البيانات بعد التحديث
      await fetchMatches();
    } catch (err) {
      console.error('خطأ في رفض المطابقة:', err);
      setError('حدث خطأ أثناء رفض المطابقة');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // الانتقال إلى صفحة تفاصيل الإعلان
  const navigateToAdvertisement = (adId: string) => {
    if (adId) {
      navigate(`/admin/advertisement/${adId}`);
    }
  };
  
  // تصفية المطابقات بناءً على البحث
  const filteredMatches = matches.filter(match => {
    const searchLower = searchQuery.toLowerCase();
    
    // البحث في بيانات المطابقة والإعلانات المرتبطة
    return (
      (match.lostAdvertisement?.name && match.lostAdvertisement.name.toLowerCase().includes(searchLower)) ||
      (match.foundAdvertisement?.name && match.foundAdvertisement.name.toLowerCase().includes(searchLower)) ||
      (match.lostAdvertisement?.documentType && match.lostAdvertisement.documentType.toLowerCase().includes(searchLower)) ||
      (match.foundAdvertisement?.documentType && match.foundAdvertisement.documentType.toLowerCase().includes(searchLower)) ||
      (match.lostAdvertisement?.location && match.lostAdvertisement.location.toLowerCase().includes(searchLower)) ||
      (match.foundAdvertisement?.location && match.foundAdvertisement.location.toLowerCase().includes(searchLower)) ||
      (match.lostAdvertisement?.publisherName && match.lostAdvertisement.publisherName.toLowerCase().includes(searchLower)) ||
      (match.foundAdvertisement?.publisherName && match.foundAdvertisement.publisherName.toLowerCase().includes(searchLower))
    );
  });
  
  // تغيير الصفحة
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // الحصول على نوع المستند مترجم
  const getTranslatedType = (type?: string): string => {
    if (!type) return 'غير محدد';
    return translateDocumentType(type);
  };
  
  // الحصول على اسم المدينة مترجم
  const getTranslatedLocation = (location?: string): string => {
    if (!location) return 'غير محدد';
    return translateCity(location);
  };
  
  // الحصول على شارة الحالة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning"><i className="fas fa-clock"></i> قيد المراجعة</span>;
      case 'approved':
        return <span className="badge badge-success"><i className="fas fa-check"></i> تمت الموافقة</span>;
      case 'rejected':
        return <span className="badge badge-danger"><i className="fas fa-times"></i> مرفوضة</span>;
      default:
        return <span className="badge badge-secondary"><i className="fas fa-question"></i> غير معروفة</span>;
    }
  };
  
  // الحصول على نسبة المطابقة مع اللون المناسب
  const getMatchScoreWithColor = (score: number) => {
    let className = 'match-score ';
    
    if (score >= 75) {
      className += 'high-match';
    } else if (score >= 50) {
      className += 'medium-match';
    } else {
      className += 'low-match';
    }
    
    return <span className={className}>{score}%</span>;
  };

  return (
    <div className="matches-list-container">
      <div className="section-header">
        <h2>إدارة مطابقات الإعلانات</h2>
        <div className="header-actions">
          <div className="search-filter-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="ابحث عن المطابقات..." 
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
                <option value="pending">قيد المراجعة</option>
                <option value="all">جميع المطابقات</option>
              </select>
            </div>
          </div>
          <button 
            className="btn btn-primary refresh-btn" 
            onClick={handleRefreshMatches}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> تحديث المطابقات
          </button>
        </div>
      </div>
      
      {/* توضيح آلية المطابقة */}
      <div className="matching-system-info">
        <details>
          <summary>معلومات عن نظام المطابقة <i className="fas fa-info-circle"></i></summary>
          {/* النصّ هنا يصف الخوارزمية كما هي في
              `backend/src/services/common/matchingService.ts`.
              النسخة السابقة كانت تقول إن التطابق «يتم فقط بين
              الإعلانات من نفس المحافظة» — وهذا غير صحيح: المحافظة
              عامل موزون بعشر نقاط لا مرشِّح، فمطابقة برقم مستمسك
              متطابق (60 نقطة) تعبر المحافظات وتتجاوز عتبة القبول
              وحدها. مشرف يقرأ الوصف الخاطئ يستبعد مطابقة صحيحة. */}
          <div className="info-content">
            <p>يبحث النظام تلقائيًا عن تطابقات محتملة بين إعلانات المستمسكات المفقودة والموجودة من النوع نفسه.</p>
            <p>لكل حقل وزن يُجمَع في درجة التطابق:</p>
            <ul>
              <li><strong>رقم المستمسك — 60 نقطة:</strong> أقوى دليل، ويكفي وحده لإنشاء مطابقة.</li>
              <li><strong>اسم صاحب المستمسك — 30 نقطة:</strong> المقارنة تتجاهل الهمزات والتشكيل، فـ«احمد» و«أحمد» سواء.</li>
              <li><strong>المحافظة — 10 نقاط:</strong> عامل مرجّح لا شرط؛ قد تتطابق إعلانات من محافظتين مختلفتين.</li>
              <li><strong>الوصف — 5 إلى 10 نقاط:</strong> حسب قوة التشابه.</li>
            </ul>
            <p>لا تُنشأ مطابقة إن كان مجموع الدرجات أقل من <strong>15</strong>.</p>
            <p>اضغط <strong>تحديث المطابقات</strong> لإعادة المسح والبحث عن تطابقات جديدة.</p>
          </div>
        </details>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage(null)}
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
      ) : filteredMatches.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-search-minus empty-icon"></i>
          <p>لا توجد مطابقات {statusFilter === 'pending' ? 'معلقة' : ''}</p>
          {statusFilter !== 'all' && (
            <button 
              className="btn btn-outline-primary" 
              onClick={() => setStatusFilter('all')}
            >
              عرض جميع المطابقات
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="matches-list">
            {filteredMatches.map((match) => {
              const matched = new Set(match.matchingFields || []);
              const lost = match.lostAdvertisement;
              const found = match.foundAdvertisement;

              /**
               * صفوف المقارنة.
               *
               * قرار المشرف هنا واحد: هل الإعلانان لمستمسك واحد؟ ولا
               * يُتّخذ إلا بمقابلة الحقول حقلًا بحقل. الجدول القديم كان
               * يضع كل إعلان في خلية واحدة كنصّ مدموج
               * («جواز سفر - أحمد علي حسن») ويترك للمشرف أن يقارن
               * بعينه سطرين متباعدين، ولا يخبره أيّ الحقول تطابق فعلًا
               * رغم أن الخادم يرسلها في `matchingFields`.
               */
              const rows: Array<{ key: string; label: string; a?: string; b?: string; ltr?: boolean }> = [
                { key: 'category', label: 'نوع المستمسك',
                  a: getTranslatedType(lost?.documentType), b: getTranslatedType(found?.documentType) },
                { key: 'itemNumber', label: 'رقم المستمسك',
                  a: lost?.itemNumber, b: found?.itemNumber, ltr: true },
                { key: 'ownerName', label: 'اسم صاحب المستمسك',
                  a: lost?.name, b: found?.name },
                { key: 'governorate', label: 'المحافظة',
                  a: getTranslatedLocation(lost?.location), b: getTranslatedLocation(found?.location) },
              ];

              return (
                <div key={match.id} className={`match-card status-${match.status}`}>
                  <div className="match-card-head">
                    <span className={`match-score-chip ${match.matchScore >= 80 ? 'is-high' : match.matchScore >= 50 ? 'is-mid' : 'is-low'}`}>
                      {match.matchScore}%
                    </span>
                    <span className="match-head-meta">
                      <i className="fas fa-calendar-alt"></i> {match.createdAt}
                    </span>
                    <span className="match-head-status">{getStatusBadge(match.status)}</span>
                  </div>

                  <div className="match-compare">
                    <div className="match-compare-head">
                      <span className="col-label" />
                      <span className="col-side is-lost">
                        <i className="fas fa-search"></i> الإعلان المفقود
                      </span>
                      <span className="col-side is-found">
                        <i className="fas fa-hand-paper"></i> الإعلان الموجود
                      </span>
                    </div>

                    {rows.map((row) => (
                      <div
                        key={row.key}
                        className={`match-compare-row ${matched.has(row.key) ? 'is-matched' : ''}`}
                      >
                        <span className="col-label">
                          {matched.has(row.key) && (
                            <i className="fas fa-check match-tick" title="تطابق هذا الحقل" />
                          )}
                          {row.label}
                        </span>
                        <span className="col-side" dir={row.ltr ? 'ltr' : undefined}>
                          {row.a || <em className="is-empty">—</em>}
                        </span>
                        <span className="col-side" dir={row.ltr ? 'ltr' : undefined}>
                          {row.b || <em className="is-empty">—</em>}
                        </span>
                      </div>
                    ))}

                    <div className="match-compare-row is-publisher">
                      <span className="col-label">الناشر</span>
                      <span className="col-side">
                        <span
                          className="ad-open-link"
                          onClick={() => lost?.id && navigateToAdvertisement(lost.id)}
                          title="فتح الإعلان"
                        >
                          <i className="fas fa-user" /> {lost?.publisherName || '—'}
                        </span>
                      </span>
                      <span className="col-side">
                        <span
                          className="ad-open-link"
                          onClick={() => found?.id && navigateToAdvertisement(found.id)}
                          title="فتح الإعلان"
                        >
                          <i className="fas fa-user" /> {found?.publisherName || '—'}
                        </span>
                        {found?.phone && (
                          <a
                            href={`https://wa.me/${found.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="match-whatsapp"
                            title="مراسلة ناشر الإعلان الموجود"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fab fa-whatsapp" />
                          </a>
                        )}
                      </span>
                    </div>
                  </div>

                  {match.status === 'rejected' && match.notes && (
                    <div className="match-rejection">
                      <i className="fas fa-info-circle" /> {match.notes}
                    </div>
                  )}

                  {match.status === 'pending' && (
                    <div className="match-card-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApproveMatch(match.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-check" /> موافقة
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openRejectModal(match.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-times" /> رفض
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* أزرار التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              
              <span className="pagination-info">
                صفحة {currentPage} من {totalPages} ({totalMatches} مطابقة)
              </span>
              
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* نافذة رفض المطابقة */}
      {showRejectModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">رفض المطابقة</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeRejectModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rejectionNotes">سبب الرفض (اختياري)</label>
                  <textarea 
                    id="rejectionNotes"
                    className="form-control"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="أدخل سبب رفض المطابقة..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeRejectModal}
                >
                  إلغاء
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmRejectMatch}
                  disabled={loading}
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesList; 