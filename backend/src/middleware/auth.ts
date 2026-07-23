/**
 * أُدمج في `middleware/common/authMiddleware`.
 * هذا الملف يعيد التصدير فقط للحفاظ على الاستيرادات القائمة.
 */
export { protect, adminProtect } from './common/authMiddleware';
export { default } from './common/authMiddleware';
