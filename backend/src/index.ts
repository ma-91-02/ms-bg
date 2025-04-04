import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import router from './routes';
import errorHandler from './middleware/common/errorHandler';
import { setupSecurityMiddleware } from './middleware/common/securityMiddleware';
import dotenv from 'dotenv';
import Admin from './models/admin/Admin';
import app from './app';

// تحميل متغيرات البيئة في بداية الملف
dotenv.config();

const PORT = process.env.PORT || 5000;

// إعداد CORS
app.use(cors());

// إعداد وسائط الأمان
setupSecurityMiddleware(app);

// تحليل JSON 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// المجلد الثابت للملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// تسجيل المسارات
app.use(router);

// معالج الأخطاء العام
app.use(errorHandler);

// الاتصال بقاعدة البيانات والتشغيل فقط إذا لم نكن في وضع الاختبار
if (process.env.NODE_ENV !== 'test') {
  const connectDB = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ms-web';
      
      console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB successfully');
      
      // التحقق من وجود مشرف افتراضي وإنشائه إذا لم يكن موجودًا
      try {
        const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
        
        if (!adminExists) {
          console.log('⚠️ No default admin found. Creating admin...');
          
          // تشفير كلمة المرور
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', salt);
          
          // إنشاء مشرف افتراضي
          const defaultAdmin = new Admin({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin',
            isActive: true
          });
          
          await defaultAdmin.save();
          console.log('✅ Default admin created successfully!');
        } else {
          console.log('✅ Default admin already exists');
        }
      } catch (error) {
        console.error('❌ Error checking default admin:', error);
      }
      
      // بدء الخادم
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      // تأكد من تشغيل خادم MongoDB
      console.log('Please make sure MongoDB server is running on port 27017');
    }
  };

  connectDB();
}

// تصدير app لاستخدامه في الاختبارات
export default app;