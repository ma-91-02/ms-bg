import api from './api';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isBlocked: boolean;
  createdAt: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<any>('/api/admin/users');
    
    // تسجيل البيانات الواردة للتصحيح
    console.log('بيانات المستخدمين الواردة:', response.data);
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // التعامل مع الاستجابة كـ { success: true, data: User[] }
      return response.data.data.map((item: any) => ({
        id: item._id || item.id || '',
        name: item.fullName || item.name || 'مستخدم',
        phone: item.phoneNumber || item.phone || '',
        email: item.email,
        isBlocked: typeof item.isBlocked === 'boolean' ? item.isBlocked : false,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
      }));
    } else if (Array.isArray(response.data)) {
      // التعامل مع الاستجابة كـ User[]
      return response.data.map((item: any) => ({
        id: item._id || item.id || '',
        name: item.fullName || item.name || 'مستخدم',
        phone: item.phoneNumber || item.phone || '',
        email: item.email,
        isBlocked: typeof item.isBlocked === 'boolean' ? item.isBlocked : false,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
      }));
    }
    
    console.warn('تم استلام بيانات غير صالحة من API المستخدمين:', response.data);
    return [];
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get<any>(`/api/admin/users/${id}`);
    
    console.log('بيانات المستخدم الواردة:', response.data);
    
    let userData;
    if (response.data && response.data.success && response.data.data) {
      userData = response.data.data;
    } else if (response.data && !response.data.success) {
      console.warn('تم استلام رد سلبي من API:', response.data.message || 'خطأ غير معروف');
      return null;
    } else {
      userData = response.data;
    }
    
    return {
      id: userData._id || userData.id || id,
      name: userData.fullName || userData.name || 'مستخدم',
      phone: userData.phoneNumber || userData.phone || '',
      email: userData.email,
      isBlocked: typeof userData.isBlocked === 'boolean' ? userData.isBlocked : false,
      createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''
    };
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    return null;
  }
};

export const toggleBlockUser = async (id: string, isBlocked: boolean): Promise<User | null> => {
  try {
    const response = await api.put<any>(`/api/admin/users/${id}/block`, { isBlocked });
    
    console.log('استجابة تحديث حظر المستخدم:', response.data);
    
    let userData;
    if (response.data && response.data.success && response.data.data) {
      userData = response.data.data;
    } else if (response.data && !response.data.success) {
      console.warn('تم استلام رد سلبي من API:', response.data.message || 'خطأ غير معروف');
      return null;
    } else {
      userData = response.data;
    }
    
    return {
      id: userData._id || userData.id || id,
      name: userData.fullName || userData.name || 'مستخدم',
      phone: userData.phoneNumber || userData.phone || '',
      email: userData.email,
      isBlocked: typeof userData.isBlocked === 'boolean' ? userData.isBlocked : isBlocked,
      createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''
    };
  } catch (error) {
    console.error('خطأ في تحديث حالة حظر المستخدم:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await api.delete<any>(`/api/admin/users/${id}`);
    
    console.log('استجابة حذف المستخدم:', response.data);
    
    if (response.data && response.data.success === false) {
      console.warn('تم استلام رد سلبي من API:', response.data.message || 'خطأ غير معروف');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    return false;
  }
}; 