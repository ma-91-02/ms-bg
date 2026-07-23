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
import adminStatsRoutes from './admin/statsRoutes';

/**
 * تسجيل المسارات.
 *
 * ما تغيّر:
 *  - `notifications` كان ملفًا موجودًا غير مسجَّل — أي أن كل مسارات
 *    الإشعارات كانت تُرجع 404 رغم اكتمال متحكمها.
 *  - `favorites` كانت معطّلة بتعليق داخل `adRoutes.ts`، و`adRoutes` نفسه
 *    غير مسجَّل — فالمفضلة لم يكن لها مسار إطلاقًا.
 *  - مسارات الإحصاءات الثلاثة كانت تُستدعى من اللوحة وتُرجع 404،
 *    فتسقط الواجهة بصمت إلى بيانات مولَّدة عشوائيًا.
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
router.use('/api/admin/dashboard', adminDashboardRoutes);

/**
 * الإحصاءات تُسجَّل قبل `/api/admin/users` لأن اللوحة تطلب
 * `/api/admin/users/active`، ولو جاء موجّه المستخدمين أولًا لفسّر
 * 'active' كمعرّف مستخدم وأعاد 404.
 */
router.use('/api/admin', adminStatsRoutes);
router.use('/api/admin/users', adminUsersRoutes);

export default router;
