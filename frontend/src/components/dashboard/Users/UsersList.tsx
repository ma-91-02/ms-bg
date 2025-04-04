import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, toggleBlockUser, User } from '../../../services/userService';
import { useLocation } from 'react-router-dom';
import UserDetails from './UserDetails';
import '../../../styles/UsersList.css';

const UsersList: React.FC = () => {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // استخراج معرف المستخدم من state إذا تم تمريره
  useEffect(() => {
    const stateParams = location.state as { userId?: string } | null;
    if (stateParams && stateParams.userId) {
      setSelectedUserId(stateParams.userId);
      // إعادة ضبط state المسار لمنع عرض تفاصيل المستخدم عند التحديث
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location]);
  
  // جلب بيانات المستخدمين من الباك اند
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        console.log('بيانات المستخدمين المستلمة في المكون:', data);
        
        // تعيين البيانات حتى لو كانت فارغة
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('حدث خطأ أثناء جلب بيانات المستخدمين');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
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
  
  const handleEdit = async (userId: string, isBlocked: boolean, event: React.MouseEvent) => {
    event.stopPropagation(); // منع انتشار الحدث للعنصر الأب
    try {
      const updatedUser = await toggleBlockUser(userId, !isBlocked);
      if (updatedUser) {
        // تحديث حالة المستخدم في واجهة المستخدم
        setUsers(users.map(user => 
          user.id === userId 
            ? updatedUser
            : user
        ));
      } else {
        alert('حدث خطأ أثناء تحديث حالة المستخدم');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('حدث خطأ أثناء تحديث بيانات المستخدم');
    }
  };
  
  const handleDelete = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // منع انتشار الحدث للعنصر الأب
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const success = await deleteUser(userId);
        if (success) {
          // إزالة المستخدم من واجهة المستخدم
          setUsers(users.filter(user => user.id !== userId));
          
          // إغلاق نافذة التفاصيل إذا كان المستخدم المحذوف هو المعروض حالياً
          if (selectedUserId === userId) {
            setSelectedUserId(null);
          }
        } else {
          alert('حدث خطأ أثناء حذف المستخدم');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };
  
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  const handleCloseDetails = () => {
    setSelectedUserId(null);
  };
  
  // تصفية المستخدمين بناءً على البحث والفلتر
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery)) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && !user.isBlocked;
    if (filterStatus === 'blocked') return matchesSearch && user.isBlocked;
    
    return matchesSearch;
  });
  
  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل بيانات المستخدمين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>إعادة المحاولة</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="users-container">
      <div className="users-header">
        <h1>المستخدمون</h1>
        <div className="users-actions">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="بحث عن مستخدم..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع المستخدمين</option>
              <option value="active">المستخدمين النشطين</option>
              <option value="blocked">المستخدمين المحظورين</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>لا توجد نتائج تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div 
              className={`user-card ${selectedUserId === user.id ? 'selected' : ''}`}
              key={user.id}
              onClick={() => user.id && handleViewDetails(user.id)}
            >
              <div className="user-card-header">
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: getAvatarColor(user.name) }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="user-info">
                  <h3>{user.name || 'مستخدم'}</h3>
                  <p className="user-phone">{user.phone || 'بدون رقم هاتف'}</p>
                </div>
                <span className={`status-indicator ${user.isBlocked ? 'blocked' : 'active'}`}>
                  {user.isBlocked ? 'محظور' : 'نشط'}
                </span>
              </div>
              
              <div className="user-card-details">
                {user.email && <p className="user-email"><span>البريد:</span> {user.email}</p>}
                <p className="user-date"><span>تاريخ التسجيل:</span> {user.createdAt || 'غير معروف'}</p>
              </div>
              
              <div className="user-card-footer">
                <button 
                  className="details-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    user.id && handleViewDetails(user.id);
                  }}
                >
                  عرض التفاصيل
                </button>
                <div className="user-actions">
                  <button 
                    className={user.isBlocked ? "unblock-button" : "block-button"}
                    onClick={(e) => user.id && handleEdit(user.id, user.isBlocked, e)}
                    disabled={!user.id}
                  >
                    {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={(e) => user.id && handleDelete(user.id, e)}
                    disabled={!user.id}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* عرض تفاصيل المستخدم عند النقر على مستخدم */}
      {selectedUserId && (
        <UserDetails
          userId={selectedUserId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default UsersList; 