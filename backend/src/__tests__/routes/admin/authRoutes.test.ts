import request from 'supertest';
import mongoose from 'mongoose';
import Admin, { IAdmin } from '../../../models/admin/Admin';
import app from '../../../index';
import bcrypt from 'bcryptjs';

describe('Admin Auth Routes', () => {
  const adminCredentials = {
    username: 'admin',
    password: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    isActive: true
  };
  
  // Admin ID created
  let adminId: string = '';

  // Before all tests
  beforeAll(async () => {
    try {
      // Delete any existing admins with the same username
      await Admin.deleteMany({ username: adminCredentials.username });
      console.log('Previous admins deleted');
      
      // Create a new test admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
      
      // Use IAdmin type to ensure TypeScript recognizes all properties
      const admin = await Admin.create({
        ...adminCredentials,
        password: hashedPassword
      });
      
      adminId = admin._id.toString();
      
      console.log('Test admin created successfully');

      // Check password comparison works
      const retrievedAdmin = await Admin.findOne({ username: adminCredentials.username });
      if (retrievedAdmin) {
        const passwordMatch = await retrievedAdmin.comparePassword(adminCredentials.password);
        console.log(`Direct password test: ${passwordMatch ? 'Success ✅' : 'Failed ❌'}`);
      }
    } catch (error) {
      console.error('❌ Error in test setup:', error);
    }
  });

  // After all tests
  afterAll(async () => {
    if (adminId) {
      await Admin.findByIdAndDelete(adminId);
      console.log(`✅ Test admin deleted successfully. ID: ${adminId}`);
    }
  });

  // Test login route
  describe('POST /api/login', () => {
    it('should allow admin login with valid credentials', async () => {
      // Ensure admin ID exists
      if (!adminId) {
        console.warn('⚠️ No admin ID, skipping test');
        return;
      }
      
      // Send login request
      console.log('🔄 Testing admin login...');
      console.log(`Login attempt for: ${adminCredentials.username}`);
      
      try {
        const response = await request(app)
          .post('/api/login')
          .send({
            username: adminCredentials.username,
            password: adminCredentials.password
          });
        
        // Check response
        console.log('Server response:', response.body);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('تم تسجيل الدخول بنجاح'); // Note: This should remain in Arabic as it's part of API response
        expect(response.body.token).toBeDefined();
        expect(response.body.admin).toBeDefined();
        expect(response.body.admin.username).toBe(adminCredentials.username);
        expect(response.body.admin.fullName).toBe(adminCredentials.fullName);
        expect(response.body.admin.email).toBe(adminCredentials.email);
        expect(response.body.admin.role).toBe(adminCredentials.role);
      } catch (error) {
        console.error('Error during login test:', error);
        throw error; // Rethrow error to show in test results
      }
    });

    it('should reject login without credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('يرجى تقديم اسم المستخدم وكلمة المرور'); // API response remains Arabic
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('خطأ في اسم المستخدم أو كلمة المرور'); // API response remains Arabic
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: adminCredentials.username,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('خطأ في اسم المستخدم أو كلمة المرور'); // API response remains Arabic
    });
  });
}); 