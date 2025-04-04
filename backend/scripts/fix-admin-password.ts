import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// استدعاء النموذج بنفس الطريقة التي يستدعيها التطبيق
// (بدون استخدام طرق مختلفة)
import Admin from '../src/models/admin/Admin';

async function main() {
  try {
    console.log('🔄 بدء تنفيذ سكريبت إصلاح كلمة مرور المشرف...');
    
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ms_main_db');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // البحث عن جميع المشرفين
    const admins = await Admin.find();
    console.log(`🔍 تم العثور على ${admins.length} مشرف في قاعدة البيانات`);
    
    if (admins.length === 0) {
      console.log('⚠️ لا يوجد مشرفين! إنشاء مشرف جديد...');
      
      // إنشاء مشرف جديد
      // هذه الطريقة تضمن استدعاء هوك pre-save
      const newAdmin = new Admin({
        username: 'admin',
        password: 'admin', // سيتم تشفيرها تلقائياً بواسطة pre-save
        email: 'admin@example.com',
        fullName: 'المدير',
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ تم إنشاء مشرف جديد بنجاح');
      console.log(`🔑 اسم المستخدم: admin`);
      console.log(`🔑 كلمة المرور: admin`);
    } else {
      // تحديث كلمة مرور أول مشرف في القائمة
      const adminToUpdate = admins[0];
      console.log(`ℹ️ تحديث كلمة مرور المشرف: ${adminToUpdate.username} (${adminToUpdate._id})`);
      
      // إعادة تعيين كلمة المرور
      // هذه الطريقة تجنب استخدام تحديث مباشر للوثيقة وتضمن استدعاء هوك pre-save
      adminToUpdate.password = 'admin';
      await adminToUpdate.save();
      
      console.log('✅ تم تحديث كلمة مرور المشرف بنجاح');
      console.log(`🔑 اسم المستخدم: ${adminToUpdate.username}`);
      console.log(`🔑 كلمة المرور: admin`);
      
      // فحص كلمة المرور بعد التحديث
      const admin = await Admin.findById(adminToUpdate._id);
      if (admin) {
        const isValid = await admin.comparePassword('admin');
        console.log(`🔍 اختبار كلمة المرور: ${isValid ? 'ناجح ✅' : 'فاشل ❌'}`);
      }
    }
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await mongoose.connection.close();
    console.log('👋 تم الانتهاء من السكريبت');
  }
}

// تنفيذ السكريبت
main(); 