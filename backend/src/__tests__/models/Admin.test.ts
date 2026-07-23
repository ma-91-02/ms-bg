import prisma from '../../config/prisma';
import { hashPassword, verifyPassword } from '../../services/common/userService';

/**
 * اختبارات نموذج المشرف.
 *
 * كان الاختبار السابق يفحص hook `pre('save')` و`comparePassword` في مخطط
 * Mongoose. لم تعد الـ hooks موجودة — التشفير صار صريحًا في `userService`،
 * وهذا بالضبط ما أزال علّة التشفير المزدوج التي استلزمت الباب الخلفي.
 */
describe('Admin', () => {
  const baseAdmin = {
    username: 'testadmin',
    email: 'test@example.com',
    fullName: 'Test Admin',
    role: 'admin' as const,
  };

  it('يخزّن كلمة المرور مشفَّرة لا كنص صريح', async () => {
    const plain = 'Admin@123';

    const admin = await prisma.admin.create({
      data: { ...baseAdmin, password: await hashPassword(plain) },
    });

    expect(admin.password).not.toBe(plain);
    expect(admin.password.startsWith('$2')).toBe(true);
  });

  it('يتحقق من كلمة المرور الصحيحة ويرفض الخاطئة', async () => {
    const plain = 'Admin@123';
    const hashed = await hashPassword(plain);

    expect(await verifyPassword(plain, hashed)).toBe(true);
    expect(await verifyPassword('WrongPassword', hashed)).toBe(false);
  });

  it('يشفّر مرة واحدة فقط — لا تشفير مزدوج', async () => {
    const plain = 'Admin@123';

    const admin = await prisma.admin.create({
      data: { ...baseAdmin, password: await hashPassword(plain) },
    });

    // العلّة السابقة: التشفير في setupAdmin ثم مجددًا في hook الحفظ،
    // فتفشل المقارنة مع كلمة المرور الأصلية
    expect(await verifyPassword(plain, admin.password)).toBe(true);
  });

  it('يفرض تفرّد اسم المستخدم', async () => {
    await prisma.admin.create({
      data: { ...baseAdmin, password: await hashPassword('x123456') },
    });

    await expect(
      prisma.admin.create({
        data: {
          ...baseAdmin,
          email: 'other@example.com',
          password: await hashPassword('y123456'),
        },
      })
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('يرفض دورًا خارج التعداد المسموح', async () => {
    await expect(
      prisma.admin.create({
        data: {
          ...baseAdmin,
          // 'super' كانت تُكتب في setupAdmin رغم أنها خارج التعداد،
          // وMongo كان يقبلها بصمت
          role: 'super' as any,
          password: await hashPassword('x123456'),
        },
      })
    ).rejects.toBeDefined();
  });
});
