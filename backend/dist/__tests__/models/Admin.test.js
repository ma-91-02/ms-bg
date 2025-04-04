"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = __importDefault(require("../../models/admin/Admin"));
describe('Admin Model', () => {
    const adminData = {
        username: 'testadmin',
        password: 'Admin@123',
        email: 'testadmin@example.com',
        fullName: 'Test Admin',
        role: 'admin',
        isActive: true
    };
    beforeEach(async () => {
        await Admin_1.default.deleteMany({});
    });
    it('يجب أن تعمل طريقة comparePassword بشكل صحيح', async () => {
        // إنشاء مشرف جديد - دع هوك pre-save يقوم بالتشفير
        const admin = await new Admin_1.default(adminData).save();
        // التحقق من وجود المشرف
        expect(admin).toBeDefined();
        expect(admin.username).toBe(adminData.username);
        // اختبار مقارنة كلمة المرور الصحيحة
        const isMatch = await admin.comparePassword(adminData.password);
        expect(isMatch).toBe(true);
        // اختبار مقارنة كلمة مرور خاطئة
        const wrongMatch = await admin.comparePassword('wrongpassword');
        expect(wrongMatch).toBe(false);
    });
});
//# sourceMappingURL=Admin.test.js.map