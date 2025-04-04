import React, { useState, useEffect } from 'react';
import { getPendingAdvertisements, approveAdvertisement, rejectAdvertisement, updateAdvertisement, Advertisement } from '../../../services/advertisementService';
import '../../../styles/PendingMatches.css';

const PendingMatches: React.FC = () => {
  const [documents, setDocuments] = useState<Advertisement[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Advertisement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  
  // جلب بيانات الإعلانات التي تحتاج للمراجعة
  useEffect(() => {
    const fetchPendingDocuments = async () => {
      try {
        setLoading(true);
        const data = await getPendingAdvertisements();
        console.log('بيانات الإعلانات قيد المراجعة:', data);
        
        // التحقق من أن data هو مصفوفة وليس null أو undefined
        if (Array.isArray(data)) {
          setDocuments(data);
          if (data.length > 0 && data[0]) {
            setCurrentDoc(data[0]);
            setFormData({
              name: data[0].name || '',
              documentType: data[0].documentType || '',
              location: data[0].location || '',
              landmark: data[0].landmark || '',
              phone: data[0].phone || ''
            });
          } else {
            setCurrentDoc(null);
            setFormData(null);
          }
        } else {
          setDocuments([]);
          setCurrentDoc(null);
          setFormData(null);
          console.warn('تم استلام بيانات غير صالحة من API:', data);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching pending documents:', err);
        setError('حدث خطأ أثناء جلب بيانات الإعلانات قيد المراجعة');
        setDocuments([]);
        setCurrentDoc(null);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingDocuments();
  }, []);
  
  const handleApprove = async () => {
    if (!currentDoc || !currentDoc.id) return;
    
    try {
      await approveAdvertisement(currentDoc.id);
      // إزالة المستند الحالي من القائمة بعد الموافقة
      const updatedDocs = documents.filter(doc => doc.id !== currentDoc.id);
      setDocuments(updatedDocs);
      
      // الانتقال إلى المستند التالي إذا وجد
      if (updatedDocs.length > 0) {
        setCurrentDoc(updatedDocs[0]);
        setFormData({
          name: updatedDocs[0].name,
          documentType: updatedDocs[0].documentType,
          location: updatedDocs[0].location,
          landmark: updatedDocs[0].landmark || '',
          phone: updatedDocs[0].phone
        });
      } else {
        setCurrentDoc(null);
        setFormData(null);
      }
    } catch (err) {
      console.error('Error approving document:', err);
      alert('حدث خطأ أثناء الموافقة على الإعلان');
    }
  };
  
  const handleReject = async () => {
    if (!currentDoc || !currentDoc.id) return;
    
    try {
      await rejectAdvertisement(currentDoc.id);
      // إزالة المستند الحالي من القائمة بعد الرفض
      const updatedDocs = documents.filter(doc => doc.id !== currentDoc.id);
      setDocuments(updatedDocs);
      
      // الانتقال إلى المستند التالي إذا وجد
      if (updatedDocs.length > 0) {
        setCurrentDoc(updatedDocs[0]);
        setFormData({
          name: updatedDocs[0].name,
          documentType: updatedDocs[0].documentType,
          location: updatedDocs[0].location,
          landmark: updatedDocs[0].landmark || '',
          phone: updatedDocs[0].phone
        });
      } else {
        setCurrentDoc(null);
        setFormData(null);
      }
    } catch (err) {
      console.error('Error rejecting document:', err);
      alert('حدث خطأ أثناء رفض الإعلان');
    }
  };
  
  const handleSaveChanges = async () => {
    if (!currentDoc || !formData || !currentDoc.id) return;
    
    try {
      // تجهيز البيانات وفق نوع Advertisement الجزئي
      const updatedData: Partial<Advertisement> = {
        name: formData.name,
        documentType: formData.documentType,
        location: formData.location,
        landmark: formData.landmark,
        phone: formData.phone
      };
      
      await updateAdvertisement(currentDoc.id, updatedData);
      
      // تحديث المستند الحالي في الواجهة
      setCurrentDoc({
        ...currentDoc,
        ...formData
      });
      
      // إيقاف وضع التحرير
      setIsEditMode(false);
      alert('تم حفظ التغييرات بنجاح');
    } catch (err: any) {
      console.error('Error updating document:', err);
      alert(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تحديث الإعلان');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  if (loading) {
    return <div className="loading-container">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!currentDoc || !formData) {
    return <div className="no-documents">لا توجد مستندات للمراجعة</div>;
  }
  
  return (
    <div className="pending-container">
      <h1>الإعلانات للمراجعة</h1>
      
      <div className="document-form">
        <div className="form-row">
          <div className="form-group">
            <label>نوع المستند</label>
            <input 
              type="text" 
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>اسم صاحب المستند المفقود</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>المحافظة</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>اقرب نقطة دالة</label>
            <input 
              type="text" 
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditMode}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group full-width">
            <label>صورة الشيء المفقود ان وجدت</label>
            <div className="image-upload-area">
              {currentDoc.images && currentDoc.images.length > 0 ? (
                <div className="image-preview">
                  <img src={currentDoc.images[0]} alt={currentDoc.documentType} className="document-img" />
                  {isEditMode && (
                    <input type="file" disabled={!isEditMode} />
                  )}
                </div>
              ) : (
                <p>لا توجد صورة</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          {isEditMode ? (
            <button 
              className="save-button"
              onClick={handleSaveChanges}
            >
              حفظ التعديلات
            </button>
          ) : (
            <>
              <button 
                className="approve-button"
                onClick={handleApprove}
              >
                موافقة
              </button>
              <button 
                className="reject-button"
                onClick={handleReject}
              >
                رفض
              </button>
              <button 
                className="edit-button"
                onClick={() => setIsEditMode(true)}
              >
                تعديل
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingMatches; 