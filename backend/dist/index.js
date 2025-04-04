"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = __importDefault(require("./middleware/common/errorHandler"));
const securityMiddleware_1 = require("./middleware/common/securityMiddleware");
const dotenv_1 = __importDefault(require("dotenv"));
const Admin_1 = __importDefault(require("./models/admin/Admin"));
const app_1 = __importDefault(require("./app"));
// تحميل متغيرات البيئة في بداية الملف
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// إعداد CORS
app_1.default.use((0, cors_1.default)());
// إعداد وسائط الأمان
(0, securityMiddleware_1.setupSecurityMiddleware)(app_1.default);
// تحليل JSON 
app_1.default.use(express_1.default.json());
app_1.default.use(express_1.default.urlencoded({ extended: true }));
// المجلد الثابت للملفات المرفوعة
app_1.default.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// تسجيل المسارات
app_1.default.use(routes_1.default);
// معالج الأخطاء العام
app_1.default.use(errorHandler_1.default);
// الاتصال بقاعدة البيانات والتشغيل فقط إذا لم نكن في وضع الاختبار
if (process.env.NODE_ENV !== 'test') {
    const connectDB = async () => {
        try {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ms-web';
            console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
            await mongoose_1.default.connect(mongoURI);
            console.log('✅ Connected to MongoDB successfully');
            // التحقق من وجود مشرف افتراضي وإنشائه إذا لم يكن موجودًا
            try {
                const adminExists = await Admin_1.default.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
                if (!adminExists) {
                    console.log('⚠️ No default admin found. Creating admin...');
                    // تشفير كلمة المرور
                    const salt = await bcryptjs_1.default.genSalt(10);
                    const hashedPassword = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD || 'admin', salt);
                    // إنشاء مشرف افتراضي
                    const defaultAdmin = new Admin_1.default({
                        username: process.env.ADMIN_USERNAME || 'admin',
                        password: hashedPassword,
                        email: 'admin@example.com',
                        fullName: 'Admin User',
                        role: 'admin',
                        isActive: true
                    });
                    await defaultAdmin.save();
                    console.log('✅ Default admin created successfully!');
                }
                else {
                    console.log('✅ Default admin already exists');
                }
            }
            catch (error) {
                console.error('❌ Error checking default admin:', error);
            }
            // بدء الخادم
            app_1.default.listen(PORT, () => {
                console.log(`✅ Server running on port ${PORT}`);
            });
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            // تأكد من تشغيل خادم MongoDB
            console.log('Please make sure MongoDB server is running on port 27017');
        }
    };
    connectDB();
}
// تصدير app لاستخدامه في الاختبارات
exports.default = app_1.default;
//# sourceMappingURL=index.js.map