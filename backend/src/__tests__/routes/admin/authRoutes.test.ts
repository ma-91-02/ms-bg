import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import { hashPassword } from '../../../services/common/userService';

/**
 * اختبارات مصادقة لوحة التحكم.
 * أهمها الأخير: يثبت أن الباب الخلفي admin/admin لم يعد يعمل.
 */
describe('POST /api/login', () => {
  const credentials = { username: 'testadmin', password: 'Admin@12345' };

  beforeEach(async () => {
    await prisma.admin.create({
      data: {
        username: credentials.username,
        password: await hashPassword(credentials.password),
        email: 'testadmin@example.com',
        fullName: 'Test Admin',
        role: 'admin',
        isActive: true,
      },
    });
  });

  it('يقبل بيانات صحيحة ويعيد توكنًا', async () => {
    const res = await request(app).post('/api/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.admin.username).toBe(credentials.username);
    // كلمة المرور يجب ألا تظهر في أي استجابة
    expect(res.body.admin.password).toBeUndefined();
  });

  it('يرفض كلمة مرور خاطئة', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: credentials.username, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('يعطي نفس الرسالة لاسم غير موجود — حتى لا يكشف الأسماء المسجّلة', async () => {
    const wrongUser = await request(app)
      .post('/api/login')
      .send({ username: 'nosuchadmin', password: 'whatever' });

    const wrongPass = await request(app)
      .post('/api/login')
      .send({ username: credentials.username, password: 'whatever' });

    expect(wrongUser.status).toBe(401);
    expect(wrongUser.body.message).toBe(wrongPass.body.message);
  });

  it('يرفض الطلب بلا بيانات', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });

  it('لا يقبل الباب الخلفي admin/admin بعد إزالته', async () => {
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: await hashPassword('a_real_strong_password'),
        email: 'admin@example.com',
        fullName: 'Admin',
        role: 'admin',
        isActive: true,
      },
    });

    // كان هذا يُقبل سابقًا متى كانت ADMIN_PASSWORD=admin
    process.env.ADMIN_PASSWORD = 'admin';

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });

    expect(res.status).toBe(401);
  });

  it('يمنع دخول مشرف معطَّل', async () => {
    await prisma.admin.update({
      where: { username: credentials.username },
      data: { isActive: false },
    });

    const res = await request(app).post('/api/login').send(credentials);
    expect(res.status).toBe(403);
  });
});
