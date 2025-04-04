import axios from 'axios';

// إنشاء كائن axios بإعدادات افتراضية
const api = axios.create({
  baseURL: 'http://localhost:3001',  // استخدام البورت 3001 وهو الصحيح
  timeout: 30000, // مهلة انتظار 30 ثانية
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// إضافة معترض طلبات لإضافة توكن المصادقة إلى رأس الطلب إذا كان متاحًا
api.interceptors.request.use(
  config => {
    // التحقق من وجود التوكن في localStorage بأسماء مختلفة
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token');

    console.log('Token from localStorage:', token);

    if (token) {
      // إضافة التوكن إلى رأس الطلب
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using authorization header:', `Bearer ${token}`);
    } else {
      console.log('No token found in localStorage');
    }

    console.log('Sending API request to:', config.url);
    return config;
  },
  error => {
    console.error('Error in request setup:', error);
    return Promise.reject(error);
  }
);

// إضافة معترض استجابات لتسجيل الاستجابات وتنبيه الأخطاء
api.interceptors.response.use(
  response => {
    console.log(`API Response from [${response.config.url}]:`, response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error('API Error response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('API Error (no response):', {
        url: error.config?.url,
        message: 'No response received from server'
      });
    } else {
      console.error('API Error (setup):', {
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export default api; 