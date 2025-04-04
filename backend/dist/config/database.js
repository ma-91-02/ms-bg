"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validateEnv_1 = __importDefault(require("./validateEnv"));
const env = (0, validateEnv_1.default)();
/**
 * الاتصال بقاعدة بيانات MongoDB
 */
const connectDB = async () => {
    try {
        // إعدادات الاتصال المتقدمة
        const options = {
        // إعدادات اختيارية لتحسين الاتصال
        };
        await mongoose_1.default.connect(env.MONGODB_URI, options);
    }
    catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
        throw error;
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map