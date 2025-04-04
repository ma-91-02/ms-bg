import { Response } from 'express';
import { AuthRequest } from '../../types/common/request';
import * as notificationService from '../../services/mobile/notificationService';
import { sendSuccess, sendError } from '../../utils/common/responseGenerator';

/**
 * الحصول على إشعارات المستخدم
 */
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return sendError(res, 'غير مصرح به', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(
      req.user._id.toString(),
      { page, limit }
    );

    return sendSuccess(res, {
      notifications: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount
    });
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    return sendError(res, 'حدث خطأ أثناء جلب الإشعارات', 500);
  }
};

/**
 * وضع علامة "مقروء" على إشعار معين
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return sendError(res, 'غير مصرح به', 401);
    }

    const { notificationId } = req.params;

    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      req.user._id.toString()
    );

    return sendSuccess(res, notification, 'تم وضع علامة "مقروء" على الإشعار بنجاح');
  } catch (error) {
    console.error('خطأ في وضع علامة "مقروء" على الإشعار:', error);
    return sendError(res, 'حدث خطأ أثناء تحديث حالة الإشعار', 500);
  }
};

/**
 * وضع علامة "مقروء" على جميع الإشعارات
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return sendError(res, 'غير مصرح به', 401);
    }

    await notificationService.markAllNotificationsAsRead(req.user._id.toString());

    return sendSuccess(res, null, 'تم وضع علامة "مقروء" على جميع الإشعارات بنجاح');
  } catch (error) {
    console.error('خطأ في وضع علامة "مقروء" على جميع الإشعارات:', error);
    return sendError(res, 'حدث خطأ أثناء تحديث حالة الإشعارات', 500);
  }
}; 