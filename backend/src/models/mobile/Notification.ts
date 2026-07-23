/**
 * الإشعارات — تعريفات النوع.
 * الجدول معرَّف في `prisma/schema.prisma`؛ الوصول عبر `prisma.notification.*`.
 */
import type { Notification as PrismaNotification } from '@prisma/client';

export type INotification = PrismaNotification;

export { NotificationType } from '../../types/mobile/notifications';
