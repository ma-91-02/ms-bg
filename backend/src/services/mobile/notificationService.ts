import prisma from '../../config/prisma';
import { NotificationType } from '../../types/mobile/notifications';

/**
 * خدمة الإشعارات.
 *
 * علّة أُصلحت هنا: كانت `createNotification` تكتب في قاعدة البيانات بينما
 * تقرأ `getUserNotifications` و`markNotificationAsRead` و`markAllNotificationsAsRead`
 * من مصفوفة `notifications` في الذاكرة لا يُضاف إليها شيء أبدًا. النتيجة:
 * قائمة إشعارات فارغة دائمًا، و«تعليم كمقروء» يرمي «الإشعار غير موجود» دومًا.
 * كل العمليات الآن على قاعدة البيانات نفسها.
 */

export interface ICreateNotification {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;
  data?: Record<string, any>;
}

export const createNotification = async (params: ICreateNotification) => {
  const { userId, title, body, type, referenceId, data } = params;

  const notification = await prisma.notification.create({
    data: { userId, title, body, type, referenceId, data: data ?? undefined },
  });

  console.log(`🔔 إشعار جديد: ${title} للمستخدم ${userId}`);
  return notification;
};

/** إنشاء إشعارات متعددة دفعةً واحدة — للمطابقات الجماعية */
export const createNotifications = (items: ICreateNotification[]) =>
  prisma.notification.createMany({
    data: items.map(({ userId, title, body, type, referenceId, data }) => ({
      userId,
      title,
      body,
      type,
      referenceId,
      data: data ?? undefined,
    })),
  });

export const getUserNotifications = async (
  userId: string,
  options: { limit?: number; page?: number } = {}
) => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 50));

  const [total, unreadCount, notifications] = await prisma.$transaction([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    notifications,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    unreadCount,
  };
};

/**
 * تعليم إشعار كمقروء.
 * شرط `userId` جزء من الاستعلام لا فحصًا بعده — فلا يستطيع مستخدم
 * تعديل إشعار غيره حتى لو عرف معرّفه.
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });

  if (result.count === 0) {
    throw new Error('الإشعار غير موجود أو ليست لديك صلاحية الوصول إليه');
  }

  return prisma.notification.findUnique({ where: { id: notificationId } });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { success: true, updated: result.count };
};

export default {
  createNotification,
  createNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationType,
};
