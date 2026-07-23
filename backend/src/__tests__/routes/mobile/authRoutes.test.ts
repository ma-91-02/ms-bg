import request from 'supertest';
import app from '../../../app';
import prisma from '../../../config/prisma';
import { hashPassword } from '../../../services/common/userService';

describe('مصادقة تطبيق الجوال', () => {
  const phoneNumber = '+9647701234567';
  const password = 'Password123';

  describe('POST /api/mobile/auth/send-otp', () => {
    it('يطلب رقم الهاتف', async () => {
      const res = await request(app).post('/api/mobile/auth/send-otp').send({});
      expect(res.status).toBe(400);
    });

    it('ينشئ رمزًا ولا يكشفه خارج وضع الديمو', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/send-otp')
        .send({ phoneNumber });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // DEMO_MODE=false في بيئة الاختبار
      expect(res.body.demoOtp).toBeUndefined();

      const otp = await prisma.otp.findFirst({ where: { phoneNumber } });
      expect(otp).not.toBeNull();
      // الرمز مخزَّن مشفَّرًا — كان نصًا صريحًا في نسخة Mongo
      expect(otp!.code).not.toMatch(/^\d{6}$/);
    });

    it('يرفض التسجيل برقم مكتمل الملف مسبقًا', async () => {
      await prisma.user.create({
        data: { phoneNumber, isProfileComplete: true, password: await hashPassword(password) },
      });

      const res = await request(app)
        .post('/api/mobile/auth/send-otp')
        .send({ phoneNumber, isRegistration: true });

      expect(res.status).toBe(400);
      expect(res.body.userExists).toBe(true);
    });
  });

  describe('POST /api/mobile/auth/verify-otp', () => {
    it('يرفض الرمز 000000 حين يكون وضع الديمو مطفأ', async () => {
      await request(app).post('/api/mobile/auth/send-otp').send({ phoneNumber });

      const res = await request(app)
        .post('/api/mobile/auth/verify-otp')
        .send({ phoneNumber, otp: '000000' });

      // هذا هو جوهر الثغرة السابقة: كان يُقبل دائمًا لأي رقم
      expect(res.status).toBe(400);
    });

    it('يرفض رمزًا غير موجود', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/verify-otp')
        .send({ phoneNumber, otp: '123456' });

      expect(res.status).toBe(400);
    });

    it('يطلب الحقلين معًا', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/verify-otp')
        .send({ phoneNumber });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/mobile/auth/login', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          phoneNumber,
          fullName: 'مستخدم اختبار',
          password: await hashPassword(password),
          isProfileComplete: true,
        },
      });
    });

    it('يقبل بيانات صحيحة ويعيد توكنًا بلا كلمة مرور', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({ phoneNumber, password });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user.password).toBeUndefined();
    });

    it('يرفض كلمة مرور خاطئة', async () => {
      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({ phoneNumber, password: 'wrong' });

      expect(res.status).toBe(401);
    });

    it('يمنع دخول مستخدم محظور', async () => {
      await prisma.user.update({ where: { phoneNumber }, data: { isBlocked: true } });

      const res = await request(app)
        .post('/api/mobile/auth/login')
        .send({ phoneNumber, password });

      expect(res.status).toBe(403);
    });
  });
});
