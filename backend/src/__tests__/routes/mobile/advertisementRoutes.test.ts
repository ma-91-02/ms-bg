import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';
import prisma from '../../../config/prisma';

const authFor = (userId: string) =>
  `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '1h' })}`;

const createUser = (phoneNumber: string) =>
  prisma.user.create({
    data: { phoneNumber, fullName: 'مستخدم اختبار', isProfileComplete: true },
  });

const adPayload = {
  type: 'lost',
  category: 'passport',
  governorate: 'baghdad',
  description: 'جواز سفر مفقود قرب ساحة التحرير',
  contactPhone: '+9647701234567',
  ownerName: 'أحمد علي',
};

describe('إعلانات تطبيق الجوال', () => {
  describe('POST /api/mobile/advertisements', () => {
    it('يرفض الطلب بلا توكن', async () => {
      const res = await request(app).post('/api/mobile/advertisements').send(adPayload);
      expect(res.status).toBe(401);
    });

    it('ينشئ إعلانًا غير معتمد بانتظار المراجعة', async () => {
      const user = await createUser('+9647701111111');

      const res = await request(app)
        .post('/api/mobile/advertisements')
        .set('Authorization', authFor(user.id))
        .send(adPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.isApproved).toBe(false);
      expect(res.body.data.status).toBe('pending');
    });

    it('لا يسمح للمستخدم باعتماد إعلانه بنفسه', async () => {
      const user = await createUser('+9647702222222');

      // هذه كانت ثغرة تصعيد صلاحيات: req.body كان يُمرَّر كاملًا
      const res = await request(app)
        .post('/api/mobile/advertisements')
        .set('Authorization', authFor(user.id))
        .send({ ...adPayload, isApproved: true, status: 'approved' });

      expect(res.status).toBe(201);
      expect(res.body.data.isApproved).toBe(false);
      expect(res.body.data.status).toBe('pending');
    });

    it('يرفض الإعلان الناقص الحقول', async () => {
      const user = await createUser('+9647703333333');

      const res = await request(app)
        .post('/api/mobile/advertisements')
        .set('Authorization', authFor(user.id))
        .send({ type: 'lost' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/mobile/advertisements', () => {
    it('لا يعرض إلا الإعلانات المعتمدة', async () => {
      const user = await createUser('+9647704444444');

      await prisma.advertisement.create({
        data: { ...(adPayload as any), userId: user.id, isApproved: false },
      });
      await prisma.advertisement.create({
        data: {
          ...(adPayload as any),
          userId: user.id,
          isApproved: true,
          status: 'approved',
        },
      });

      const res = await request(app).get('/api/mobile/advertisements');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].isApproved).toBe(true);
    });

    it('يخفي رقم التواصل عن غير صاحب الإعلان', async () => {
      const owner = await createUser('+9647705555555');

      await prisma.advertisement.create({
        data: {
          ...(adPayload as any),
          userId: owner.id,
          isApproved: true,
          status: 'approved',
          hideContactInfo: true,
        },
      });

      const res = await request(app).get('/api/mobile/advertisements');

      expect(res.status).toBe(200);
      expect(res.body.data[0].contactPhone).not.toBe(adPayload.contactPhone);
    });
  });

  describe('GET /api/mobile/advertisements/constants', () => {
    it('يعيد التعدادات بتسمياتها العربية', async () => {
      const res = await request(app).get('/api/mobile/advertisements/constants');

      expect(res.status).toBe(200);
      expect(res.body.data.governorates).toHaveLength(18);
      expect(res.body.data.types).toEqual(
        expect.arrayContaining([{ value: 'lost', label: 'مفقود' }])
      );
    });
  });
});
