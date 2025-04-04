"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const User_1 = __importDefault(require("../../../models/mobile/User"));
const index_1 = __importDefault(require("../../../index"));
console.log('⚠️ Current environment:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'test') {
    console.log('⚠️ Forcing test environment');
    process.env.NODE_ENV = 'test';
}
console.log('�� Checking if routes are registered in auth test:');
if (index_1.default._router) {
    index_1.default._router.stack.forEach(layer => {
        if (layer.route) {
            console.log(`${layer.route.stack[0].method.toUpperCase()} ${layer.route.path}`);
        }
        else if (layer.name === 'router' && layer.handle.stack) {
            console.log(`Router: ${layer.regexp}`);
            layer.handle.stack.forEach(routeLayer => {
                if (routeLayer.route) {
                    console.log(`  ${Object.keys(routeLayer.route.methods)[0].toUpperCase()} ${routeLayer.route.path}`);
                }
            });
        }
    });
}
else {
    console.log('⚠️ No routes registered in app!');
}
describe('Mobile Auth Routes', () => {
    // Test user data with consistent phone number
    const testPhoneNumber = '+9631234567890';
    const testUserData = {
        phoneNumber: testPhoneNumber,
        password: 'Password123',
        fullName: 'Test User',
        lastName: 'Test',
        email: 'test@example.com',
        birthDate: '1990-01-01'
    };
    // Store user ID, OTP code and token
    let userId = '';
    const testOtp = '000000'; // الرمز المستخدم في المتحكم لبيئة الاختبار
    let userToken = '';
    // Before all tests
    beforeAll(async () => {
        // Delete any existing user with the same phone number
        await User_1.default.deleteMany({ phoneNumber: testUserData.phoneNumber });
        console.log('Previous users deleted');
    });
    // After all tests
    afterAll(async () => {
        // Clean up data
        await User_1.default.deleteMany({ phoneNumber: testUserData.phoneNumber });
        console.log('Test users deleted');
    });
    // 1. Test send OTP
    describe('POST /api/mobile/auth/send-otp', () => {
        it('should send OTP code to phone number', async () => {
            console.log('Testing send OTP...');
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/mobile/auth/send-otp')
                .send({
                phoneNumber: testUserData.phoneNumber
            });
            console.log('Server response status:', response.status);
            console.log('Server response body:', response.body);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
        it('should reject request without phone number', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/mobile/auth/send-otp')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
    // 2. Test verify OTP
    describe('POST /api/mobile/auth/verify-otp', () => {
        it('should verify OTP code and return JWT token', async () => {
            // First send OTP to create user
            await (0, supertest_1.default)(index_1.default)
                .post('/api/mobile/auth/send-otp')
                .send({ phoneNumber: testPhoneNumber });
            // Mock the OTP verification since we're in test mode
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/mobile/auth/verify-otp')
                .send({
                phoneNumber: testPhoneNumber,
                otp: testOtp
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');
            // Save token for later tests
            if (response.body.token) {
                userToken = response.body.token;
            }
        });
        it('should return 400 for invalid OTP', async () => {
            // Try to verify with an invalid OTP
            const response = await (0, supertest_1.default)(index_1.default)
                .post('/api/mobile/auth/verify-otp')
                .send({
                phoneNumber: testPhoneNumber,
                otp: 'invalid-otp'
            });
            expect(response.status).toBe(400);
        });
    });
});
//# sourceMappingURL=authRoutes.test.js.map