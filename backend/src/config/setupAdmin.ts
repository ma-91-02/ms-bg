import Admin from '../models/Admin';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminPassword123';

export async function setupAdmin() {
  try {
    // التحقق من وجود أدمن
    const adminExists = await Admin.findOne({ username: ADMIN_USERNAME });
    
    if (!adminExists) {
      // إنشاء أدمن جديد
      await Admin.create({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      });
      console.log('✅ تم إنشاء حساب الأدمن بنجاح');
    } else {
      console.log('ℹ️ حساب الأدمن موجود مسبقاً');
    }
  } catch (error) {
    console.error('❌ خطأ في إعداد حساب الأدمن:', error);
  }
}