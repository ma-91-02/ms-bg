import express from 'express';

// مسارات الجوال
import mobileAuthRoutes from './mobile/authRoutes';
import mobileAdvertisementRoutes from './mobile/advertisementRoutes';
import mobileContactRequestRoutes from './mobile/contactRequestRoutes';
import mobileMatchesRoutes from './mobile/matchesRoutes';
import mobileFavoriteRoutes from './mobile/favoriteRoutes';
import mobileNotificationRoutes from './mobile/notifications';

// مسارات لوحة التحكم
import adminAuthRoutes from './admin/authRoutes';
import adminAdvertisementRoutes from './admin/advertisementRoutes';
import adminContactRequestRoutes from './admin/contactRequestRoutes';
import adminMatchesRoutes from './admin/matchesRoutes';
import adminUsersRoutes from './admin/usersRoutes';
import adminDashboardRoutes from './admin/dashboardRoutes';

/**
 * تسجيل المسارات.
 *
 * ما تغيّر:
 *  - `notifications` كان ملفًا موجودًا غير مسجَّل — أي أن كل مسارات
 *    الإشعارات كانت تُرجع 404 رغم اكتمال متحكمها.
 *  - `favorites` كانت معطّلة بتعليق داخل `adRoutes.ts`، و`adRoutes` نفسه
 *    غير مسجَّل — فالمفضلة لم يكن لها مسار إطلاقًا.
 *  - أُزيلت استيرادات `require()` داخل `try/catch` التي كانت تكرّر
 *    استيراد نفس الملفات المستوردة أصلًا في الأعلى.
 */
const router = express.Router();

// --- الجوال ---
router.use('/api/mobile/auth', mobileAuthRoutes);
router.use('/api/mobile/advertisements', mobileAdvertisementRoutes);
router.use('/api/mobile/contact-requests', mobileContactRequestRoutes);
router.use('/api/mobile/matches', mobileMatchesRoutes);
router.use('/api/mobile/favorites', mobileFavoriteRoutes);
router.use('/api/mobile/notifications', mobileNotificationRoutes);

// --- لوحة التحكم ---
router.use('/api/login', adminAuthRoutes);
router.use('/api/admin/advertisements', adminAdvertisementRoutes);
router.use('/api/admin/contact-requests', adminContactRequestRoutes);
router.use('/api/admin/matches', adminMatchesRoutes);
router.use('/api/admin/users', adminUsersRoutes);
router.use('/api/admin/dashboard', adminDashboardRoutes);

export default router;
