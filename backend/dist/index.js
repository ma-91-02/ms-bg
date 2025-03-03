"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const setupAdmin_1 = require("./config/setupAdmin");
const authController_1 = require("./controllers/authController");
const dataController_1 = require("./controllers/dataController");
const authenticateToken_1 = require("./middleware/authenticateToken");
const path_1 = __importDefault(require("path"));
const swagger_1 = require("./config/swagger");
// استيراد الراوترات الجديدة
const auth_1 = __importDefault(require("./routes/mobile/auth"));
const reports_1 = __importDefault(require("./routes/mobile/reports"));
const reports_2 = __importDefault(require("./routes/admin/reports"));
// تحميل متغيرات البيئة
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// راوترات API الحالية
app.post('/api/login', authController_1.login);
app.get('/api/data', authenticateToken_1.authenticateToken, dataController_1.getData);
// دمج راوترات API الجديدة
app.use('/api/mobile/auth', auth_1.default);
app.use('/api/mobile/reports', reports_1.default);
app.use('/api/admin/reports', reports_2.default);
// الوصول إلى مجلد الصور المحملة
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// التحقق من المتغيرات البيئية
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
if (!MONGODB_URI || !JWT_SECRET) {
    console.error('❌ خطأ: المتغيرات البيئية مفقودة!');
    process.exit(1);
}
// الاتصال بقاعدة البيانات
mongoose_1.default.connect(MONGODB_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    // إعداد حساب الأدمن
    yield (0, setupAdmin_1.setupAdmin)();
    // تشغيل السيرفر
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    });
    // إعداد توثيق API
    (0, swagger_1.setupSwagger)(app);
}))
    .catch((err) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
    process.exit(1);
});
