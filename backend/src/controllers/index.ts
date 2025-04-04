// استيراد وحدات متحكمات الإعلانات
export * from './mobile/advertisementController';

// استيراد وحدات متحكمات المصادقة المحمولة
import * as mobileAuth from './mobile/authController';
export { mobileAuth };

// استيراد وحدات متحكمات المصادقة الإدارية
import * as adminAuth from './admin/authController';
export { adminAuth };

// استيراد وحدات متحكمات طلبات التواصل
export * from './mobile/contactRequestController';

// استيراد وحدات متحكمات الإشعارات
export * from './mobile/notificationController'; 