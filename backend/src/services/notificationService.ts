import mongoose from 'mongoose';
import Notification from '../models/mobile/Notification';
import { NotificationType } from '../types/notifications';

// تعريف واجهة إنشاء الإشعار
export interface ICreateNotification {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: mongoose.Types.ObjectId | string;
  data?: Record<string, any>;
}

/**
 * إنشاء إشعار جديد
 */
export const createNotification = async (params: ICreateNotification) => {
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
      isRead: false
    });
    
    // يمكن هنا إضافة منطق لإرسال إشعار فوري (push notification)
    // للتطبيق المحمول باستخدام Firebase Cloud Messaging أو خدمة مشابهة
    
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
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    return {
      notifications,
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
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('الإشعار غير موجود أو ليست لديك صلاحية الوصول إليه');
    }
    
    return notification;
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
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('خطأ في وضع علامة مقروء على جميع الإشعارات:', error);
    throw error;
  }
};

/**
 * حذف إشعار
 */
export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    const result = await Notification.deleteOne({ _id: notificationId, userId });
    
    if (result.deletedCount === 0) {
      throw new Error('الإشعار غير موجود أو ليست لديك صلاحية حذفه');
    }
    
    return { success: true };
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    throw error;
  }
};

export { NotificationType };

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  NotificationType
}; 