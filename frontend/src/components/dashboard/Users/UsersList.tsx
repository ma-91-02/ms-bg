import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, toggleBlockUser, User } from '../../../services/userService';
import '../../../styles/UsersList.css';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const handleEdit = async (userId: string, isBlocked: boolean) => {
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
  
  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const success = await deleteUser(userId);
        if (success) {
          // إزالة المستخدم من واجهة المستخدم
          setUsers(users.filter(user => user.id !== userId));
        } else {
          alert('حدث خطأ أثناء حذف المستخدم');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };
  
  if (loading) {
    return <div className="loading-container">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (users.length === 0) {
    return <div className="no-data">لا يوجد مستخدمين</div>;
  }
  
  return (
    <div className="users-container">
      <h1>المستخدمون</h1>
      
      <div className="users-list">
        {users.map(user => (
          <div className="user-item" key={user.id}>
            <div className="user-info">
              <h3>{user.name || 'مستخدم'}</h3>
              <p>{user.phone || 'بدون رقم هاتف'}</p>
              {user.email && <p>{user.email}</p>}
              <p className={`user-status ${user.isBlocked ? 'blocked' : 'active'}`}>
                {user.isBlocked ? 'محظور' : 'نشط'}
              </p>
            </div>
            <div className="user-actions">
              <button 
                className={user.isBlocked ? "unblock-button" : "block-button"}
                onClick={() => user.id && handleEdit(user.id, user.isBlocked)}
                disabled={!user.id}
              >
                {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
              </button>
              <button 
                className="delete-button" 
                onClick={() => user.id && handleDelete(user.id)}
                disabled={!user.id}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList; 