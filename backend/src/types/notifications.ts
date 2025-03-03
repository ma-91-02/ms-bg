/**
 * أنواع الإشعارات المدعومة في النظام
 */
export enum NotificationType {
  DOCUMENT_APPROVED = 'document_approved',
  DOCUMENT_REJECTED = 'document_rejected',
  MATCH_FOUND = 'match_found',
  CONTACT_REQUEST = 'contact_request',
  CONTACT_APPROVED = 'contact_approved',
  CONTACT_REJECTED = 'contact_rejected',
  REWARD_EARNED = 'reward_earned',
  ADMIN_MESSAGE = 'admin_message'
} 