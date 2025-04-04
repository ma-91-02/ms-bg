"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const authRoutes_1 = __importDefault(require("./routes/mobile/authRoutes"));
const authRoutes_2 = __importDefault(require("./routes/admin/authRoutes"));
const adRoutes_1 = __importDefault(require("./routes/mobile/adRoutes"));
// إنشاء تطبيق Express
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// Morgan logger only in development
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// تسجيل مسارات API للجوال مع تتبع
console.log('🔍 Registering mobile routes...');
app.use('/api/mobile/auth', authRoutes_1.default);
app.use('/api/mobile/ads', adRoutes_1.default);
console.log('✅ Mobile routes registered');
// تسجيل مسارات API للمشرف
app.use('/api/login', authRoutes_2.default);
// تصدير التطبيق
exports.default = app;
//# sourceMappingURL=app.js.map