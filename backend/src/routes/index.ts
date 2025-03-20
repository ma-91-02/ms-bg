import express from 'express';
import adminAuthRouter from './admin/auth';
import mobileAuthRoutes from './mobile/authRoutes';
import mobileAdvertisementRoutes from './mobile/advertisementRoutes';
import adminAuthRoutes from './admin/authRoutes';
import adminAdvertisementRoutes from './admin/advertisementRoutes';
import mobileContactRequestRoutes from './mobile/contactRequestRoutes';
import adminContactRequestRoutes from './admin/contactRequestRoutes';
import adminMatchesRoutes from './admin/matchesRoutes';
import mobileMatchesRoutes from './mobile/matchesRoutes';
import adminUsersRoutes from './admin/usersRoutes';
import adminDashboardRoutes from './admin/dashboardRoutes';

const router = express.Router();

// طباعة بالإنجليزية مباشرة
console.log('🔍 Registering routes...');

// مسارات الموبايل
let mobileAuthRouter;
try {
  mobileAuthRouter = require('./mobile/authRoutes').default;
  console.log('✅ Mobile auth routes imported successfully: authRoutes');
} catch (error) {
  try {
    mobileAuthRouter = require('./mobile/auth').default;
    console.log('✅ Mobile auth routes imported successfully: auth');
  } catch (innerError) {
    console.error('❌ Failed to import mobile auth routes:', innerError.message);
    mobileAuthRouter = express.Router();
  }
}

let mobileAdvertisementRouter;
try {
  mobileAdvertisementRouter = require('./mobile/advertisementRoutes').default;
  console.log('✅ Advertisement routes imported successfully: advertisementRoutes');
} catch (error) {
  try {
    mobileAdvertisementRouter = require('./mobile/advertisement').default;
    console.log('✅ Advertisement routes imported successfully: advertisement');
  } catch (innerError) {
    console.error('❌ Failed to import advertisement routes:', innerError.message);
    mobileAdvertisementRouter = express.Router();
  }
}

// تسجيل المسارات
console.log('🚀 تسجيل المسارات في router/index.ts...');
router.use('/api/mobile/auth', mobileAuthRoutes);
console.log('✓ تم تسجيل مسارات المصادقة للجوال');
router.use('/api/mobile/advertisements', mobileAdvertisementRoutes);
router.use('/api/login', adminAuthRoutes);
router.use('/api/admin', adminAuthRouter);

// تسجيل مسارات إدارة الإعلانات للمشرف
router.use('/api/admin/advertisements', adminAdvertisementRoutes);

// تسجيل مسارات طلبات التواصل للمستخدمين
router.use('/api/mobile/contact-requests', mobileContactRequestRoutes);

// تسجيل مسارات طلبات التواصل للمشرفين
router.use('/api/admin/contact-requests', adminContactRequestRoutes);

// تسجيل مسارات مطابقات الإعلانات للمشرفين
router.use('/api/admin/matches', adminMatchesRoutes);

// تسجيل مسارات مطابقات الإعلانات للمستخدمين
router.use('/api/mobile/matches', mobileMatchesRoutes);

// تسجيل مسارات إدارة المستخدمين
router.use('/api/admin/users', adminUsersRoutes);

// تسجيل مسارات لوحة المعلومات
router.use('/api/admin/dashboard', adminDashboardRoutes);

export default router; 