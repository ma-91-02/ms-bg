import mongoose from 'mongoose';
import Notification from '../../models/mobile/Notification';
import { NotificationType } from '../../types/mobile/notifications';

/**
 * نموذج الإشعار - نتجنب استخدام النموذج مباشرة لإزالة الاعتماديات
 */
interface Notification {
  userId: string;
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

/**
 * واجهة إنشاء إشعار جديد
 */
export interface ICreateNotification {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: mongoose.Types.ObjectId | string;
  data?: Record<string, any>;
}

// مخزن مؤقت للإشعارات (في الذاكرة)
const notifications: Notification[] = [];

/**
 * إنشاء إشعار جديد
 */
export const createNotification = async (params: ICreateNotification): Promise<any> => {
  try {
    const { userId, title, body, type, referenceId, data } = params;
    
    // إنشاء إشعار جديد
    const notification = await Notification.create({
      userId,
      title,
      body,
      type,
      referenceId,
      data,
      read: false
    });
    
    console.log(`🔔 تم إنشاء إشعار جديد: ${title} للمستخدم: ${userId}`);
    
    return notification;
  } catch (error) {
    console.error('خطأ في إنشاء إشعار:', error);
    throw error;
  }
};

/**
 * الحصول على إشعارات المستخدم
 */
export const getUserNotifications = async (userId: string, options = { limit: 50, page: 1 }) => {
  try {
    const { limit, page } = options;
    const skip = (page - 1) * limit;
    
    // استخدام المخزن المؤقت بدلاً من قاعدة البيانات
    const userNotifications = notifications
      .filter(n => n.userId.toString() === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const total = userNotifications.length;
    const paginatedNotifications = userNotifications.slice(skip, skip + limit);
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    return {
      notifications: paginatedNotifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  } catch (error) {
    console.error('خطأ في جلب إشعارات المستخدم:', error);
    throw error;
  }
};

/**
 * وضع علامة "مقروء" على إشعار معين
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const existingNotification = notifications.find(
      n => n.userId.toString() === userId && notificationId === n.id
    );
    
    if (!existingNotification) {
      throw new Error('الإشعار غير موجود أو ليست لديك صلاحية الوصول إليه');
    }
    
    existingNotification.read = true;
    existingNotification.createdAt = new Date();
    
    return existingNotification;
  } catch (error) {
    console.error('خطأ في وضع علامة مقروء على الإشعار:', error);
    throw error;
  }
};

/**
 * وضع علامة "مقروء" على جميع إشعارات المستخدم
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    notifications
      .filter(n => n.userId.toString() === userId)
      .forEach(n => {
        n.read = true;
        n.createdAt = new Date();
      });
    
    return { success: true };
  } catch (error) {
    console.error('خطأ في وضع علامة مقروء على جميع الإشعارات:', error);
    throw error;
  }
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationType
}; 