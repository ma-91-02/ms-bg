import { Response } from 'express';
import { AuthRequest } from '../../types/common/request';
/**
 * الحصول على إشعارات المستخدم
 */
export declare const getUserNotifications: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * وضع علامة "مقروء" على إشعار معين
 */
export declare const markAsRead: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * وضع علامة "مقروء" على جميع الإشعارات
 */
export declare const markAllAsRead: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notificationController.d.ts.map