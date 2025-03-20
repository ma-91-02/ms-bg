import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../../models/mobile/User';
import Advertisement from '../../../models/mobile/Advertisement';
import app from '../../../index';

describe('Advertisement Routes', () => {
  let authToken: string;
  let testAdId: string;
  
  // إنشاء مستخدم وإعلان للاختبار
  beforeEach(async () => {
    // إنشاء مستخدم اختباري
    const testUser = await new User({
      phoneNumber: '+9639876543210',
      password: 'password123',
      fullName: 'مستخدم اختبار',
      isProfileComplete: true
    }).save();
    
    // إنشاء توكن للمستخدم
    authToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'test_secret_key',
      { expiresIn: '1h' }
    );
    
    // إنشاء إعلان اختباري
    const testAd = await new Advertisement({
      title: 'إعلان اختبار',
      description: 'وصف اختبار للإعلان',
      type: 'lost',
      category: 'others',
      userId: testUser._id,
      location: {
        type: 'Point',
        coordinates: [44.3661, 33.3157],
        address: 'عنوان اختبار'
      }
    }).save();
    
    // معالجة آمنة لـ _id
    testAdId = testAd._id?.toString() || '';
  });
  
  describe('GET /api/mobile/advertisements', () => {
    it('يجب أن يجلب جميع الإعلانات', async () => {
      const response = await request(app)
        .get('/api/mobile/advertisements');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('GET /api/mobile/advertisements/:id', () => {
    it('يجب أن يجلب إعلان محدد', async () => {
      const response = await request(app)
        .get(`/api/mobile/advertisements/${testAdId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('إعلان اختبار');
    });
  });
  
  describe('POST /api/mobile/advertisements', () => {
    it('يجب أن ينشئ إعلان جديد للمستخدم المصرح له', async () => {
      const response = await request(app)
        .post('/api/mobile/advertisements')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'إعلان جديد')
        .field('description', 'وصف للإعلان الجديد')
        .field('type', 'found')
        .field('category', 'electronics');
      
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('إعلان جديد');
    });
  });
}); 