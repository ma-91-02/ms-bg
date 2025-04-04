import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mobileAuthRoutes from './routes/mobile/authRoutes';
import adminAuthRoutes from './routes/admin/authRoutes';
import adRoutes from './routes/mobile/adRoutes';

// إنشاء تطبيق Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Morgan logger only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// تسجيل مسارات API للجوال مع تتبع
console.log('🔍 Registering mobile routes...');
app.use('/api/mobile/auth', mobileAuthRoutes);
app.use('/api/mobile/ads', adRoutes);
console.log('✅ Mobile routes registered');

// تسجيل مسارات API للمشرف
app.use('/api/login', adminAuthRoutes);

// تصدير التطبيق
export default app; 