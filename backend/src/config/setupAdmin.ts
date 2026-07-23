import prisma from './prisma';
import { hashPassword } from '../services/common/userService';
import { AdminRole } from '../models/admin/Admin';

/**
 * إنشاء حساب المسؤول الافتراضي إذا لم يكن موجودًا.
 *
 * علّتان أُصلحتا هنا:
 *  1. كانت كلمة المرور تُشفَّر هنا ثم يُشفّرها hook الحفظ مرة ثانية، فيستحيل
 *     الدخول — ولهذا أُضيف باب خلفي في comparePassword يقبل 'admin' حرفيًا.
 *     التشفير الآن مرة واحدة فقط والباب الخلفي أُزيل.
 *  2. كان يكتب `role: 'super'` وهي قيمة خارج التعداد المسموح
 *     ['superadmin','admin','moderator'] — الآن التعداد يفرضه Postgres.
 */
const setupAdmin = async (): Promise<void> => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.warn('⚠️ ADMIN_PASSWORD غير مضبوط — تخطي إنشاء المشرف الافتراضي');
    return;
  }

  try {
    const existing = await prisma.admin.findUnique({ where: { username } });

    if (existing) {
      console.log('✅ حساب المشرف موجود بالفعل');
      return;
    }

    await prisma.admin.create({
      data: {
        username,
        password: await hashPassword(password),
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        fullName: 'Admin User',
        role: AdminRole.SUPERADMIN,
        isActive: true,
      },
    });

    console.log('✅ تم إنشاء حساب المشرف الافتراضي بنجاح');
  } catch (error) {
    console.error('❌ فشل في إنشاء حساب المسؤول الافتراضي:', error);
  }
};

export default setupAdmin;
