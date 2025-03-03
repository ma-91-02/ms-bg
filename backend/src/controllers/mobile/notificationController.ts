import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as notificationService from '../../services/notificationService';

/**
 * الحصول على إشعارات المستخدم
 */
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(
      req.user._id.toString(),
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount
    });
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإشعارات'
    });
  }
};

/**
 * وضع علامة "مقروء" على إشعار معين
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { notificationId } = req.params;

    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      message: 'تم وضع علامة "مقروء" على الإشعار بنجاح',
      data: notification
    });
  } catch (error) {
    console.error('خطأ في وضع علامة "مقروء" على الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الإشعار'
    });
  }
};

/**
 * وضع علامة "مقروء" على جميع الإشعارات
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    await notificationService.markAllNotificationsAsRead(req.user._id.toString());

    res.status(200).json({
      success: true,
      message: 'تم وضع علامة "مقروء" على جميع الإشعارات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في وضع علامة "مقروء" على جميع الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الإشعارات'
    });
  }
};

/**
 * حذف إشعار
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { notificationId } = req.params;

    await notificationService.deleteNotification(
      notificationId,
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الإشعار'
    });
  }
}; 