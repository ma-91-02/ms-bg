"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * إنشاء حساب المسؤول الافتراضي إذا لم يكن موجودًا
 */
const setupAdmin = async () => {
    try {
        // التحقق من وجود حساب المسؤول
        const adminExists = await models_1.Admin.findOne({ username: process.env.ADMIN_USERNAME });
        if (!adminExists) {
            // تشفير كلمة المرور
            const hashedPassword = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
            // إنشاء حساب المسؤول
            await models_1.Admin.create({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: hashedPassword,
                role: 'super'
            });
            console.log('✅ تم إنشاء حساب المسؤول الافتراضي بنجاح');
        }
    }
    catch (error) {
        console.error('❌ فشل في إنشاء حساب المسؤول الافتراضي:', error);
    }
};
exports.default = setupAdmin;
//# sourceMappingURL=setupAdmin.js.map