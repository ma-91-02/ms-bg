/**
 * أنواع الإشعارات المدعومة في النظام
 */
export enum NotificationType {
  ADVERTISEMENT = 'advertisement',    // إشعارات متعلقة بالإعلانات
  ADMIN_MESSAGE = 'admin_message',    // رسائل من المسؤول
  CONTACT_REQUEST = 'contact_request', // طلبات التواصل
  CONTACT_APPROVED = 'contact_approved', // قبول طلب التواصل
  CONTACT_REJECTED = 'contact_rejected', // رفض طلب التواصل
  SYSTEM = 'system'                   // إشعارات النظام
}

export default NotificationType; 