import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { setupAdmin } from './config/setupAdmin';
import { login } from './controllers/authController';
import { getData } from './controllers/dataController';
import { authenticateToken } from './middleware/authenticateToken';
import path from 'path';
import { setupSwagger } from './config/swagger';

// استيراد الراوترات الجديدة
import mobileAuthRoutes from './routes/mobile/auth';
import mobileReportRoutes from './routes/mobile/reports';
import adminReportRoutes from './routes/admin/reports';

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// راوترات API الحالية
app.post('/api/login', login);
app.get('/api/data', authenticateToken, getData);

// دمج راوترات API الجديدة
app.use('/api/mobile/auth', mobileAuthRoutes);
app.use('/api/mobile/reports', mobileReportRoutes);
app.use('/api/admin/reports', adminReportRoutes);

// الوصول إلى مجلد الصور المحملة
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// التحقق من المتغيرات البيئية
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('❌ خطأ: المتغيرات البيئية مفقودة!');
  process.exit(1);
}

// الاتصال بقاعدة البيانات
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // إعداد حساب الأدمن
    await setupAdmin();

    // تشغيل السيرفر
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    });

    // إعداد توثيق API
    setupSwagger(app);
  })
  .catch((err) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
    process.exit(1);
  });