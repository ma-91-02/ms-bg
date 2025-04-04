"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../../models/mobile/Notification"));
const notifications_1 = require("../../types/mobile/notifications");
// مخزن مؤقت للإشعارات (في الذاكرة)
const notifications = [];
/**
 * إنشاء إشعار جديد
 */
const createNotification = async (params) => {
    try {
        const { userId, title, body, type, referenceId, data } = params;
        // إنشاء إشعار جديد
        const notification = await Notification_1.default.create({
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
    }
    catch (error) {
        console.error('خطأ في إنشاء إشعار:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
/**
 * الحصول على إشعارات المستخدم
 */
const getUserNotifications = async (userId, options = { limit: 50, page: 1 }) => {
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
    }
    catch (error) {
        console.error('خطأ في جلب إشعارات المستخدم:', error);
        throw error;
    }
};
exports.getUserNotifications = getUserNotifications;
/**
 * وضع علامة "مقروء" على إشعار معين
 */
const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const existingNotification = notifications.find(n => n.userId.toString() === userId && notificationId === n.id);
        if (!existingNotification) {
            throw new Error('الإشعار غير موجود أو ليست لديك صلاحية الوصول إليه');
        }
        existingNotification.read = true;
        existingNotification.createdAt = new Date();
        return existingNotification;
    }
    catch (error) {
        console.error('خطأ في وضع علامة مقروء على الإشعار:', error);
        throw error;
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
/**
 * وضع علامة "مقروء" على جميع إشعارات المستخدم
 */
const markAllNotificationsAsRead = async (userId) => {
    try {
        notifications
            .filter(n => n.userId.toString() === userId)
            .forEach(n => {
            n.read = true;
            n.createdAt = new Date();
        });
        return { success: true };
    }
    catch (error) {
        console.error('خطأ في وضع علامة مقروء على جميع الإشعارات:', error);
        throw error;
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
exports.default = {
    createNotification: exports.createNotification,
    getUserNotifications: exports.getUserNotifications,
    markNotificationAsRead: exports.markNotificationAsRead,
    markAllNotificationsAsRead: exports.markAllNotificationsAsRead,
    NotificationType: notifications_1.NotificationType
};
//# sourceMappingURL=notificationService.js.map