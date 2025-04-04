import mongoose from 'mongoose';
import Notification from '../../models/mobile/Notification';
import { NotificationType } from '../../types/mobile/notifications';
/**
 * نموذج الإشعار - نتجنب استخدام النموذج مباشرة لإزالة الاعتماديات
 */
interface Notification {
    userId: mongoose.Types.ObjectId | string;
    title: string;
    body: string;
    type: string;
    referenceId?: mongoose.Types.ObjectId | string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
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
/**
 * إنشاء إشعار جديد
 */
export declare const createNotification: (params: ICreateNotification) => Promise<any>;
/**
 * الحصول على إشعارات المستخدم
 */
export declare const getUserNotifications: (userId: string, options?: {
    limit: number;
    page: number;
}) => Promise<{
    notifications: Notification[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    unreadCount: number;
}>;
/**
 * وضع علامة "مقروء" على إشعار معين
 */
export declare const markNotificationAsRead: (notificationId: string, userId: string) => Promise<Notification>;
/**
 * وضع علامة "مقروء" على جميع إشعارات المستخدم
 */
export declare const markAllNotificationsAsRead: (userId: string) => Promise<{
    success: boolean;
}>;
declare const _default: {
    createNotification: (params: ICreateNotification) => Promise<any>;
    getUserNotifications: (userId: string, options?: {
        limit: number;
        page: number;
    }) => Promise<{
        notifications: Notification[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
        unreadCount: number;
    }>;
    markNotificationAsRead: (notificationId: string, userId: string) => Promise<Notification>;
    markAllNotificationsAsRead: (userId: string) => Promise<{
        success: boolean;
    }>;
    NotificationType: typeof NotificationType;
};
export default _default;
//# sourceMappingURL=notificationService.d.ts.map