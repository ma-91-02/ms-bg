import React, { useState, useEffect } from 'react';
import { getAllAdvertisements, approveAdvertisement, rejectAdvertisement, Advertisement } from '../../../services/advertisementService';
import '../../../styles/DocumentsList.css';

const DocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // جلب بيانات الإعلانات من الباك اند
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await getAllAdvertisements();
        console.log('بيانات الإعلانات:', data);
        
        // التحقق من أن data هو مصفوفة وليس null أو undefined
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
          console.warn('تم استلام بيانات غير صالحة من API:', data);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        setError('حدث خطأ أثناء جلب بيانات الإعلانات');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleApprove = async (docId: string) => {
    try {
      await approveAdvertisement(docId);
      // تحديث حالة الإعلان في واجهة المستخدم
      setDocuments(documents.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'approved' } 
          : doc
      ));
    } catch (err) {
      console.error('Error approving document:', err);
      alert('حدث خطأ أثناء الموافقة على الإعلان');
    }
  };
  
  const handleReject = async (docId: string) => {
    try {
      await rejectAdvertisement(docId);
      // تحديث حالة الإعلان في واجهة المستخدم
      setDocuments(documents.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'rejected' } 
          : doc
      ));
    } catch (err) {
      console.error('Error rejecting document:', err);
      alert('حدث خطأ أثناء رفض الإعلان');
    }
  };
  
  const handleEdit = (docId: string) => {
    // يمكن توجيه المستخدم إلى صفحة تحرير الإعلان
    window.location.href = `#/admin/advertisements/${docId}/edit`;
  };
  
  if (loading) {
    return <div className="loading-container">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (documents.length === 0) {
    return <div className="no-data">لا توجد إعلانات متاحة</div>;
  }
  
  return (
    <div className="documents-container">
      <h1>الإعلانات المطابقة</h1>
      
      <div className="documents-grid">
        {documents.map(doc => (
          <div className="document-card" key={doc.id || Math.random().toString()}>
            <div className="document-info">
              <h3>{doc.name || 'بدون اسم'}</h3>
              <p>{doc.documentType || 'نوع غير معروف'}</p>
              <p>{doc.location || 'موقع غير معروف'}</p>
              <p>{doc.date || 'تاريخ غير معروف'}</p>
              <p className={`document-status status-${doc.status || 'unknown'}`}>
                {doc.status === 'pending' && 'قيد الانتظار'}
                {doc.status === 'approved' && 'تمت الموافقة'}
                {doc.status === 'rejected' && 'تم الرفض'}
                {doc.status === 'resolved' && 'تم الحل'}
                {!doc.status && 'غير معروف'}
              </p>
            </div>
            <div className="document-image">
              {doc.images && doc.images.length > 0 && doc.images[0] ? (
                <img src={doc.images[0]} alt={doc.documentType || 'مستند'} className="document-img" />
              ) : (
                <div className="passport-image"></div>
              )}
            </div>
            <div className="document-actions">
              {doc.status === 'pending' && (
                <>
                  <button 
                    className="approve-button"
                    onClick={() => doc.id && handleApprove(doc.id)}
                    disabled={!doc.id}
                  >
                    موافق
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => doc.id && handleReject(doc.id)}
                    disabled={!doc.id}
                  >
                    رفض
                  </button>
                </>
              )}
              <button 
                className="edit-button"
                onClick={() => doc.id && handleEdit(doc.id)}
                disabled={!doc.id}
              >
                تعديل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsList; 