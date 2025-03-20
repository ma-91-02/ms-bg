import React, { useState, useEffect, useCallback } from 'react';
import { getAllAdvertisements, approveAdvertisement, rejectAdvertisement, Advertisement, getAdvertisementsByStatus, updateAdvertisement, resolveAdvertisement } from '../../../services/advertisementService';
import '../../../styles/AdvancedDocumentsList.css';

// قائمة المحافظات
const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'السليمانية', 'دهوك', 'الأنبار', 
  'واسط', 'بابل', 'ميسان', 'ذي قار', 'صلاح الدين', 'ديالى', 'كركوك', 'المثنى', 'القادسية'
];

const AdvancedDocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Advertisement[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Advertisement[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [filter, setFilter] = useState({
    status: 'all',
    governorate: 'all',
    sort: 'newest',
    search: ''
  });
  const [editFormData, setEditFormData] = useState<{
    name: string;
    documentType: string;
    location: string;
    landmark: string;
    phone: string;
  } | null>(null);
  
  // تحميل البيانات - استخراج كدالة قابلة لإعادة الاستخدام
  const fetchData = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    
    console.log('بدء جلب البيانات بالحالة:', status);
    
    try {
      let fetchedDocuments: Advertisement[] = [];
      
      if (status === 'all') {
        console.log('محاولة جلب جميع الإعلانات...');
        try {
          fetchedDocuments = await getAllAdvertisements();
          console.log('تم استلام البيانات (الكل):', fetchedDocuments);
        } catch (error) {
          console.error('فشل في جلب جميع الإعلانات:', error);
          throw error;
        }
      } else {
        console.log(`محاولة جلب الإعلانات بحالة: ${status}`);
        try {
          fetchedDocuments = await getAdvertisementsByStatus(status);
          console.log(`تم استلام البيانات (${status}):`, fetchedDocuments);
        } catch (error) {
          console.error(`فشل في جلب الإعلانات بحالة ${status}:`, error);
          
          // محاولة بديلة إذا فشلت الطريقة الأولى
          console.log('محاولة طريقة بديلة لجلب البيانات...');
          try {
            fetchedDocuments = await getAllAdvertisements();
            console.log('تم استلام البيانات (الكل):', fetchedDocuments);
            
            // تطبيق الفلتر يدوياً
            if (status !== 'all') {
              fetchedDocuments = fetchedDocuments.filter(
                doc => doc.status?.toLowerCase() === status.toLowerCase()
              );
              console.log(`تم فلترة البيانات (${status}):`, fetchedDocuments);
            }
          } catch (secondError) {
            console.error('فشلت المحاولة البديلة:', secondError);
            throw secondError;
          }
        }
      }
      
      console.log('عدد الإعلانات المستلمة:', fetchedDocuments.length);
      
      if (fetchedDocuments.length === 0) {
        console.log('لم يتم العثور على بيانات، الاستعلام عن الحالة النشطة...');
        // محاولة أخيرة - الحصول على الإعلانات النشطة إذا لم يتم العثور على بيانات
        try {
          fetchedDocuments = await getAdvertisementsByStatus('active');
          console.log('تم استلام بيانات نشطة:', fetchedDocuments);
        } catch (activeError) {
          console.error('فشل في جلب الإعلانات النشطة:', activeError);
        }
      }
      
      setDocuments(fetchedDocuments);
      applyFilters(fetchedDocuments);
    } catch (error) {
      console.error('حدث خطأ أثناء جلب البيانات:', error);
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // جلب بيانات الإعلانات من الباك اند
  useEffect(() => {
    setLoading(true);
    fetchData(filter.status);
  }, [filter.status, fetchData]);
  
  // إعادة تحميل البيانات
  const handleRefresh = () => {
    if (!isRefreshing) {
      console.log('إعادة تحميل البيانات...');
      fetchData(filter.status);
    }
  };
  
  // تطبيق الفلاتر على البيانات
  const applyFilters = useCallback((docs: Advertisement[] = documents) => {
    console.log('تطبيق الفلاتر على', docs.length, 'إعلان');
    console.log('معايير الفلتر:', {
      governorate: filter.governorate,
      searchTerm: filter.search,
      sortByDate: filter.sort,
      selectedStatus: filter.status
    });
    
    if (!Array.isArray(docs)) {
      console.error('البيانات المستلمة ليست مصفوفة:', docs);
      setFilteredDocuments([]);
      return;
    }
    
    let filtered = [...docs];
    
    // تسجيل البيانات قبل الفلترة
    console.log('البيانات قبل الفلترة:', filtered);
    
    // فلتر حسب المحافظة
    if (filter.governorate && filter.governorate !== 'all') {
      filtered = filtered.filter(doc => {
        const result = doc.location === filter.governorate;
        if (!result) {
          console.log('استبعاد إعلان لعدم تطابق المحافظة:', { 
            id: doc.id,
            location: doc.location,
            filter: filter.governorate 
          });
        }
        return result;
      });
      console.log('بعد فلتر المحافظة:', filtered.length, 'إعلان');
    }
    
    // فلتر حسب مصطلح البحث
    if (filter.search) {
      const term = filter.search.toLowerCase();
      filtered = filtered.filter(doc => {
        const nameMatch = doc.name?.toLowerCase().includes(term);
        const typeMatch = doc.documentType?.toLowerCase().includes(term);
        const locationMatch = doc.location?.toLowerCase().includes(term);
        const result = nameMatch || typeMatch || locationMatch;
        
        if (!result) {
          console.log('استبعاد إعلان لعدم تطابق مصطلح البحث:', { 
            id: doc.id,
            name: doc.name,
            searchTerm: term 
          });
        }
        
        return result;
      });
      console.log('بعد فلتر البحث:', filtered.length, 'إعلان');
    }
    
    // ترتيب حسب التاريخ
    if (filter.sort) {
      filtered.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return filter.sort === 'newest' ? dateB - dateA : dateA - dateB;
      });
      console.log('تم ترتيب البيانات حسب:', filter.sort);
    }
    
    console.log('النتائج النهائية بعد الفلترة:', filtered.length, 'إعلان');
    setFilteredDocuments(filtered);
  }, [documents, filter.governorate, filter.search, filter.sort, filter.status]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`تغيير الفلتر: ${name} = ${value}`);
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApprove = async (docId: string) => {
    if (!docId) return;
    
    setLoading(true);
    try {
      await approveAdvertisement(docId);
      
      // تحديث حالة الإعلان في القائمة
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: 'approved' } : doc
      ));
      
      // تحديث الإعلان المحدد أيضاً إذا كان هو نفسه
      if (selectedDocument?.id === docId) {
        setSelectedDocument(prev => prev ? { ...prev, status: 'approved' } : null);
      }
      
      alert('تمت الموافقة على الإعلان بنجاح');
      handleRefresh(); // تحديث القائمة بعد تغيير الحالة
    } catch (error) {
      console.error('خطأ عند الموافقة على الإعلان:', error);
      alert('فشل في الموافقة على الإعلان');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async (docId: string) => {
    if (!docId) return;
    
    setLoading(true);
    try {
      await rejectAdvertisement(docId);
      
      // تحديث حالة الإعلان في القائمة
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: 'rejected' } : doc
      ));
      
      // تحديث الإعلان المحدد أيضاً إذا كان هو نفسه
      if (selectedDocument?.id === docId) {
        setSelectedDocument(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
      
      alert('تم رفض الإعلان بنجاح');
      handleRefresh(); // تحديث القائمة بعد تغيير الحالة
    } catch (error) {
      console.error('خطأ عند رفض الإعلان:', error);
      alert('فشل في رفض الإعلان');
    } finally {
      setLoading(false);
    }
  };
  
  // إضافة دالة لتحديد الإعلان كمحلول
  const handleResolve = async (docId: string) => {
    if (!docId) return;
    
    setLoading(true);
    try {
      await resolveAdvertisement(docId);
      
      // تحديث حالة الإعلان في القائمة
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: 'resolved' } : doc
      ));
      
      // تحديث الإعلان المحدد أيضاً إذا كان هو نفسه
      if (selectedDocument?.id === docId) {
        setSelectedDocument(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
      
      alert('تم تحديد الإعلان كمحلول بنجاح');
      handleRefresh(); // تحديث القائمة بعد تغيير الحالة
    } catch (error) {
      console.error('خطأ عند تحديد الإعلان كمحلول:', error);
      alert('فشل في تحديد الإعلان كمحلول');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeStatus = async (docId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'resolved') => {
    if (!docId) return;
    
    setLoading(true);
    try {
      switch (newStatus) {
        case 'approved':
          await approveAdvertisement(docId);
          break;
        case 'rejected':
          await rejectAdvertisement(docId);
          break;
        case 'resolved':
          await resolveAdvertisement(docId);
          break;
        default:
          // للحالة 'pending' أو الحالات الأخرى، نقوم بتحديث الإعلان بالحالة الجديدة
          await updateAdvertisement(docId, { status: newStatus });
      }
      
      // تحديث حالة الإعلان في القائمة
      setDocuments(prevDocs => prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      ));
      
      // تحديث الإعلان المحدد أيضاً
      setSelectedDocument(prev => prev ? { ...prev, status: newStatus } : null);
      
      alert(`تم تغيير حالة الإعلان إلى "${newStatus}" بنجاح`);
      handleRefresh(); // تحديث القائمة بعد تغيير الحالة للتأكد من أن التغييرات تظهر بشكل صحيح
    } catch (error) {
      console.error(`خطأ عند تغيير حالة الإعلان إلى "${newStatus}":`, error);
      alert(`فشل في تغيير حالة الإعلان إلى "${newStatus}"`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectDocument = (doc: Advertisement) => {
    console.log(`اختيار الإعلان:`, doc);
    setSelectedDocument(doc);
    setIsEditMode(false);
    setEditFormData({
      name: doc.name || '',
      documentType: doc.documentType || '',
      location: doc.location || '',
      landmark: doc.landmark || '',
      phone: doc.phone || ''
    });
  };
  
  const handleCloseDetails = () => {
    console.log('إغلاق تفاصيل الإعلان');
    setSelectedDocument(null);
    setEditFormData(null);
    setIsEditMode(false);
  };
  
  const handleEditMode = () => {
    console.log('تفعيل وضع التعديل');
    setIsEditMode(true);
  };
  
  const handleSaveChanges = async () => {
    if (!selectedDocument || !selectedDocument.id || !editFormData) {
      alert('بيانات الإعلان غير متوفرة للتعديل');
      return;
    }
    
    try {
      console.log(`حفظ التغييرات للإعلان ${selectedDocument.id}:`, editFormData);
      
      // إرسال التعديلات إلى الباك اند
      await updateAdvertisement(selectedDocument.id, {
        name: editFormData.name,
        documentType: editFormData.documentType,
        location: editFormData.location,
        landmark: editFormData.landmark,
        phone: editFormData.phone
      });
      
      // تحديث البيانات محلياً
      const updatedDocs = documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { 
              ...doc, 
              name: editFormData.name,
              documentType: editFormData.documentType,
              location: editFormData.location,
              landmark: editFormData.landmark,
              phone: editFormData.phone
            } 
          : doc
      );
      
      setDocuments(updatedDocs);
      applyFilters(updatedDocs);
      
      // تحديث الإعلان المحدد
      setSelectedDocument(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          name: editFormData.name,
          documentType: editFormData.documentType,
          location: editFormData.location,
          landmark: editFormData.landmark,
          phone: editFormData.phone
        };
      });
      
      setIsEditMode(false);
      alert('تم حفظ التغييرات بنجاح');
    } catch (err: any) {
      console.error('Error saving changes:', err);
      alert(err?.message || 'حدث خطأ أثناء حفظ التغييرات');
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`تغيير حقل النموذج: ${name} = ${value}`);
    setEditFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };
  
  if (loading && !isRefreshing) {
    return <div className="loading-container">جاري تحميل البيانات...</div>;
  }

  if (error && !documents.length) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button 
          className="reload-button" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'جاري إعادة التحميل...' : 'إعادة المحاولة'}
        </button>
      </div>
    );
  }
  
  return (
    <div className="advanced-documents-container">
      <div className="documents-header">
        <h1>إدارة الإعلانات</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
        </button>
      </div>
      
      {error && (
        <div className="warning-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* قسم الفلاتر */}
      <div className="filters-section">
        <div className="filter-item">
          <label htmlFor="status">الحالة:</label>
          <select 
            id="status" 
            name="status" 
            value={filter.status} 
            onChange={handleFilterChange}
          >
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="approved">تمت الموافقة</option>
            <option value="rejected">تم الرفض</option>
            <option value="resolved">تم الحل</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="governorate">المحافظة:</label>
          <select 
            id="governorate" 
            name="governorate" 
            value={filter.governorate} 
            onChange={handleFilterChange}
          >
            <option value="all">الكل</option>
            {governorates.map(gov => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label htmlFor="sort">ترتيب:</label>
          <select 
            id="sort" 
            name="sort" 
            value={filter.sort} 
            onChange={handleFilterChange}
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
          </select>
        </div>
        
        <div className="filter-item search">
          <label htmlFor="search">بحث:</label>
          <input 
            type="text" 
            id="search" 
            name="search" 
            value={filter.search} 
            onChange={handleFilterChange} 
            placeholder="ابحث عن اسم أو نوع..."
          />
        </div>
      </div>
      
      {/* عدد الإعلانات المعروضة */}
      <div className="results-count">
        عدد النتائج: {filteredDocuments.length} من أصل {documents.length}
        {isRefreshing && <span className="refreshing-indicator"> (جاري التحديث...)</span>}
      </div>
      
      {/* عرض النتائج */}
      {filteredDocuments.length === 0 ? (
        <div className="no-data">
          {documents.length === 0 ? 'لا توجد إعلانات متاحة' : 'لا توجد إعلانات متطابقة مع الفلتر'}
        </div>
      ) : (
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>النوع</th>
                <th>الاسم</th>
                <th>المحافظة</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id || Math.random().toString()} className={selectedDocument?.id === doc.id ? 'selected' : ''}>
                  <td>{doc.documentType || 'غير معروف'}</td>
                  <td>{doc.name || 'غير معروف'}</td>
                  <td>{doc.location || 'غير معروف'}</td>
                  <td>{doc.date || 'غير معروف'}</td>
                  <td>
                    <span className={`status-badge status-${doc.status || 'unknown'}`}>
                      {doc.status === 'pending' && 'قيد الانتظار'}
                      {doc.status === 'approved' && 'تمت الموافقة'}
                      {doc.status === 'rejected' && 'تم الرفض'}
                      {doc.status === 'resolved' && 'تم الحل'}
                      {!doc.status && 'غير معروف'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="details-button"
                        onClick={() => handleSelectDocument(doc)}
                      >
                        تفاصيل
                      </button>
                      
                      {doc.id && (
                        <>
                          <button 
                            className="approve-button"
                            onClick={() => handleApprove(doc.id!)}
                            disabled={!doc.id || doc.status === 'approved'}
                          >
                            موافقة
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleReject(doc.id!)}
                            disabled={!doc.id || doc.status === 'rejected'}
                          >
                            رفض
                          </button>
                          <button 
                            className="resolve-button"
                            onClick={() => handleResolve(doc.id!)}
                            disabled={!doc.id || doc.status === 'resolved'}
                          >
                            تم الحل
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* تفاصيل الإعلان المحدد */}
      {selectedDocument && editFormData && (
        <div className="document-details-overlay">
          <div className="document-details-container">
            <div className="details-header">
              <h2>{isEditMode ? 'تعديل الإعلان' : 'تفاصيل الإعلان'}</h2>
              <button className="close-button" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="details-content">
              <div className="details-id">
                <strong>معرف الإعلان:</strong> {selectedDocument.id || 'غير متوفر'}
              </div>
              
              <div className="details-columns">
                <div className="details-column">
                  <div className="detail-group">
                    <label>نوع المستمسك:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        name="documentType" 
                        value={editFormData.documentType} 
                        onChange={handleFormChange} 
                      />
                    ) : (
                      <p>{selectedDocument.documentType || 'غير معروف'}</p>
                    )}
                  </div>
                  
                  <div className="detail-group">
                    <label>اسم صاحب المستمسك:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        name="name" 
                        value={editFormData.name} 
                        onChange={handleFormChange} 
                      />
                    ) : (
                      <p>{selectedDocument.name || 'غير معروف'}</p>
                    )}
                  </div>
                  
                  <div className="detail-group">
                    <label>المحافظة:</label>
                    {isEditMode ? (
                      <select 
                        name="location" 
                        value={editFormData.location} 
                        onChange={handleFormChange}
                      >
                        <option value="">اختر المحافظة</option>
                        {governorates.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    ) : (
                      <p>{selectedDocument.location || 'غير معروف'}</p>
                    )}
                  </div>
                </div>
                
                <div className="details-column">
                  <div className="detail-group">
                    <label>نقطة دالة:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        name="landmark" 
                        value={editFormData.landmark} 
                        onChange={handleFormChange} 
                      />
                    ) : (
                      <p>{selectedDocument.landmark || 'غير معروف'}</p>
                    )}
                  </div>
                  
                  <div className="detail-group">
                    <label>رقم الاتصال:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        name="phone" 
                        value={editFormData.phone} 
                        onChange={handleFormChange} 
                      />
                    ) : (
                      <p>{selectedDocument.phone || 'غير معروف'}</p>
                    )}
                  </div>
                  
                  <div className="detail-group">
                    <label>تاريخ الإنشاء:</label>
                    <p>{selectedDocument.date || 'غير معروف'}</p>
                  </div>
                  
                  {!isEditMode && (
                    <div className="detail-group">
                      <label>الحالة:</label>
                      <select 
                        value={selectedDocument.status || 'pending'} 
                        onChange={(e) => selectedDocument.id && handleChangeStatus(
                          selectedDocument.id, 
                          e.target.value as 'pending' | 'approved' | 'rejected' | 'resolved'
                        )}
                        className={`status-dropdown status-${selectedDocument.status || 'unknown'}`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="approved">تمت الموافقة</option>
                        <option value="rejected">تم الرفض</option>
                        <option value="resolved">تم الحل</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="document-images">
                <label>الصور:</label>
                <div className="images-container">
                  {selectedDocument.images && selectedDocument.images.length > 0 ? (
                    selectedDocument.images.map((img, index) => (
                      <div key={index} className="image-item">
                        <img 
                          src={img} 
                          alt={`صورة ${index + 1}`} 
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150?text=صورة+غير+متوفرة';
                            console.warn(`تعذر تحميل الصورة: ${img}`);
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <p>لا توجد صور</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="details-actions">
              {isEditMode ? (
                <>
                  <button className="save-button" onClick={handleSaveChanges}>حفظ التغييرات</button>
                  <button className="cancel-button" onClick={() => setIsEditMode(false)}>إلغاء</button>
                </>
              ) : (
                <>
                  <button className="edit-button" onClick={handleEditMode}>تعديل</button>
                  
                  {/* أزرار الموافقة والرفض */}
                  {selectedDocument.id && (
                    <>
                      <button 
                        className="approve-button"
                        onClick={() => handleApprove(selectedDocument.id!)}
                        disabled={!selectedDocument.id || selectedDocument.status === 'approved'}
                      >
                        موافقة
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => handleReject(selectedDocument.id!)}
                        disabled={!selectedDocument.id || selectedDocument.status === 'rejected'}
                      >
                        رفض
                      </button>
                      <button 
                        className="resolve-button"
                        onClick={() => handleResolve(selectedDocument.id!)}
                        disabled={!selectedDocument.id || selectedDocument.status === 'resolved'}
                      >
                        تم الحل
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDocumentsList; 