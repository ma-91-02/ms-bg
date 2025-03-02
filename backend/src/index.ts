import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { setupAdmin } from './config/setupAdmin';
import { login } from './controllers/authController';
import { getData } from './controllers/dataController';
import { authenticateToken } from './middleware/authenticateToken';
import cors from 'cors';

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// راوت تسجيل الدخول
app.post('/api/login', login);

// راوت الحصول على البيانات (محمي)
app.get('/api/data', authenticateToken, getData);

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
  })
  .catch((err) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
    process.exit(1);
  });