import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

async function main() {
  try {
    console.log('🔄 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // الحصول على معرّف المشرف
    const adminId = '67d9b12f885ca0a48b6957fb'; // هذا هو المعرّف من الرسالة التصحيحية
    console.log(`🔍 تحديث كلمة مرور المشرف بالمعرّف: ${adminId}`);

    // تشفير كلمة المرور "admin" مباشرة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    console.log(`🔐 كلمة المرور المشفرة الجديدة: ${hashedPassword}`);

    // تحديث كلمة المرور مباشرة في قاعدة البيانات دون استخدام النموذج
    // هذا يتجاوز أي هوك pre-save ويضع كلمة المرور المشفرة مباشرة
    const result = await mongoose.connection.db.collection('admins').updateOne(
      { _id: new mongoose.Types.ObjectId(adminId) },
      { $set: { password: hashedPassword } }
    );

    console.log(`📊 نتيجة التحديث: ${result.modifiedCount > 0 ? 'تم التحديث بنجاح ✅' : 'فشل التحديث ❌'}`);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 تم الانتهاء من العملية');
  }
}

main(); 