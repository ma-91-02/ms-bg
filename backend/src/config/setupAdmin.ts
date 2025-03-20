import { Admin } from '../models';
import bcrypt from 'bcryptjs';

/**
 * إنشاء حساب المسؤول الافتراضي إذا لم يكن موجودًا
 */
const setupAdmin = async (): Promise<void> => {
  try {
    // التحقق من وجود حساب المسؤول
    const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!adminExists) {
      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'admin123', 
        12
      );
      
      // إنشاء حساب المسؤول
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword,
        role: 'super'
      });
      
      console.log('✅ تم إنشاء حساب المسؤول الافتراضي بنجاح');
    }
  } catch (error) {
    console.error('❌ فشل في إنشاء حساب المسؤول الافتراضي:', error);
  }
};

export default setupAdmin;