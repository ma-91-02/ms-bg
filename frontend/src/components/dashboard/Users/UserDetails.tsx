import React, { useState, useEffect } from 'react';
import { User, getUserById } from '../../../services/userService';
import '../../../styles/UserDetails.css';

interface UserDetailsProps {
  userId: string;
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        console.log('تم استلام بيانات المستخدم:', userData);
        setUser(userData);
      } catch (err) {
        console.error('خطأ في جلب تفاصيل المستخدم:', err);
        setError('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // تحديد اللون بناءً على الحرف الأول من اسم المستخدم
  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
      '#33FFF5', '#F5FF33', '#FF8C33', '#8C33FF', '#33FFCB'
    ];
    const firstChar = name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
    const charCode = firstChar.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // الحصول على الحرف الأول من اسم المستخدم
  const getInitials = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير متوفر';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // التحقق من وجود أي نشاط للمستخدم
  const hasActivity = user?.stats && 
    (user.stats.totalAds > 0 || 
     user.stats.contactRequests > 0 || 
     user.stats.resolvedAds > 0);

  return (
    <div className="user-details-modal-backdrop" onClick={onClose}>
      <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
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
        ) : user ? (
          <div className="user-details-content">
            <div className="user-profile-header">
              {user.profileImage ? (
                <div className="user-avatar profile-image-container">
                  <img 
                    src={user.profileImage.startsWith('http') ? user.profileImage : `/uploads/${user.profileImage}`}
                    alt={user.name}
                    className="profile-image"
                  />
                </div>
              ) : (
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: getAvatarColor(user.name) }}
                >
                  {getInitials(user.name)}
                </div>
              )}
              <div className="user-profile-info">
                <h2>{user.name}{user.lastName ? ` ${user.lastName}` : ''}</h2>
                <div className="user-badges-container">
                  <span className={`user-status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                    {user.isBlocked ? 'محظور' : 'نشط'}
                  </span>
                  {user.isProfileComplete && (
                    <span className="user-status-badge complete">
                      ملف شخصي مكتمل
                    </span>
                  )}
                  {typeof user.points === 'number' && (
                    <span className="user-points-badge">
                      {user.points} نقطة
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  البيانات الشخصية
                </button>
                <button 
                  className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  النشاط
                </button>
              </div>
              
              {activeTab === 'info' && (
                <div className="user-info-grid">
                  <div className="info-item">
                    <div className="info-label">الاسم الكامل</div>
                    <div className="info-value">
                      {user.name}
                      {user.lastName ? ` ${user.lastName}` : ''}
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">رقم الهاتف</div>
                    <div className="info-value">{user.phone || 'غير متوفر'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">البريد الإلكتروني</div>
                    <div className="info-value">{user.email || 'غير متوفر'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">تاريخ الميلاد</div>
                    <div className="info-value">{user.birthDate || 'غير متوفر'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">تاريخ التسجيل</div>
                    <div className="info-value">{user.createdAt || 'غير متوفر'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">آخر تحديث</div>
                    <div className="info-value">{user.updatedAt || 'غير متوفر'}</div>
                  </div>
                  
                  <div className="info-item full-width">
                    <div className="info-label">معرف المستخدم</div>
                    <div className="info-value user-id">{user.id}</div>
                  </div>
                  
                  {user.favorites && user.favorites.length > 0 && (
                    <div className="info-item full-width">
                      <div className="info-label">المفضلات</div>
                      <div className="info-value">{user.favorites.length} عنصر</div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="user-activity-section">
                  <div className="activity-stats">
                    <div className="stat-box">
                      <div className="stat-value">{user.stats?.totalAds || 0}</div>
                      <div className="stat-label">إجمالي الإعلانات</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{user.stats?.resolvedAds || 0}</div>
                      <div className="stat-label">مستندات تم استردادها</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{user.stats?.contactRequests || 0}</div>
                      <div className="stat-label">طلبات تواصل</div>
                    </div>
                  </div>
                  
                  {hasActivity ? (
                    <div className="activity-details">
                      <div className="detail-item">
                        <div className="detail-label">إعلانات مفقودات</div>
                        <div className="detail-value">{user.stats?.lostAds || 0}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">إعلانات موجودات</div>
                        <div className="detail-value">{user.stats?.foundAds || 0}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-activity">
                      <p>لا توجد أنشطة حديثة لهذا المستخدم</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-user-found">
            <p>لم يتم العثور على بيانات المستخدم</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails; 