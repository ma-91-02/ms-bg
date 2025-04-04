"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../../models/mobile/User"));
const Advertisement_1 = __importDefault(require("../../../models/mobile/Advertisement"));
const index_1 = __importDefault(require("../../../index"));
describe('Advertisement Routes', () => {
    let authToken;
    let testAdId;
    // إنشاء مستخدم وإعلان للاختبار
    beforeEach(async () => {
        var _a;
        // إنشاء مستخدم اختباري
        const testUser = await new User_1.default({
            phoneNumber: '+9639876543210',
            password: 'password123',
            fullName: 'مستخدم اختبار',
            isProfileComplete: true
        }).save();
        // إنشاء توكن للمستخدم
        authToken = jsonwebtoken_1.default.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret_key', { expiresIn: '1h' });
        // إنشاء إعلان اختباري
        const testAd = await new Advertisement_1.default({
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
        testAdId = ((_a = testAd._id) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    });
    describe('GET /api/mobile/advertisements', () => {
        it('يجب أن يجلب جميع الإعلانات', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get('/api/mobile/advertisements');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
    describe('GET /api/mobile/advertisements/:id', () => {
        it('يجب أن يجلب إعلان محدد', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/mobile/advertisements/${testAdId}`);
            expect(response.status).toBe(200);
            expect(response.body.data.title).toBe('إعلان اختبار');
        });
    });
    describe('POST /api/mobile/advertisements', () => {
        it('يجب أن ينشئ إعلان جديد للمستخدم المصرح له', async () => {
            const response = await (0, supertest_1.default)(index_1.default)
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
//# sourceMappingURL=advertisementRoutes.test.js.map