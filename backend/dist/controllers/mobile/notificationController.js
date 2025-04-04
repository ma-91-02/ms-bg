"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getUserNotifications = void 0;
const notificationService = __importStar(require("../../services/mobile/notificationService"));
const responseGenerator_1 = require("../../utils/common/responseGenerator");
/**
 * الحصول على إشعارات المستخدم
 */
const getUserNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return (0, responseGenerator_1.sendError)(res, 'غير مصرح به', 401);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notificationService.getUserNotifications(req.user._id.toString(), { page, limit });
        return (0, responseGenerator_1.sendSuccess)(res, {
            notifications: result.notifications,
            pagination: result.pagination,
            unreadCount: result.unreadCount
        });
    }
    catch (error) {
        console.error('خطأ في جلب الإشعارات:', error);
        return (0, responseGenerator_1.sendError)(res, 'حدث خطأ أثناء جلب الإشعارات', 500);
    }
};
exports.getUserNotifications = getUserNotifications;
/**
 * وضع علامة "مقروء" على إشعار معين
 */
const markAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return (0, responseGenerator_1.sendError)(res, 'غير مصرح به', 401);
        }
        const { notificationId } = req.params;
        const notification = await notificationService.markNotificationAsRead(notificationId, req.user._id.toString());
        return (0, responseGenerator_1.sendSuccess)(res, notification, 'تم وضع علامة "مقروء" على الإشعار بنجاح');
    }
    catch (error) {
        console.error('خطأ في وضع علامة "مقروء" على الإشعار:', error);
        return (0, responseGenerator_1.sendError)(res, 'حدث خطأ أثناء تحديث حالة الإشعار', 500);
    }
};
exports.markAsRead = markAsRead;
/**
 * وضع علامة "مقروء" على جميع الإشعارات
 */
const markAllAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return (0, responseGenerator_1.sendError)(res, 'غير مصرح به', 401);
        }
        await notificationService.markAllNotificationsAsRead(req.user._id.toString());
        return (0, responseGenerator_1.sendSuccess)(res, null, 'تم وضع علامة "مقروء" على جميع الإشعارات بنجاح');
    }
    catch (error) {
        console.error('خطأ في وضع علامة "مقروء" على جميع الإشعارات:', error);
        return (0, responseGenerator_1.sendError)(res, 'حدث خطأ أثناء تحديث حالة الإشعارات', 500);
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notificationController.js.map