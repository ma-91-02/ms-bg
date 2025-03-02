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
exports.setupAdmin = setupAdmin;
const Admin_1 = __importDefault(require("../models/Admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminPassword123';
function setupAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // التحقق من وجود أدمن
            const adminExists = yield Admin_1.default.findOne({ username: ADMIN_USERNAME });
            if (!adminExists) {
                // إنشاء أدمن جديد
                yield Admin_1.default.create({
                    username: ADMIN_USERNAME,
                    password: ADMIN_PASSWORD
                });
                console.log('✅ تم إنشاء حساب الأدمن بنجاح');
            }
            else {
                console.log('ℹ️ حساب الأدمن موجود مسبقاً');
            }
        }
        catch (error) {
            console.error('❌ خطأ في إعداد حساب الأدمن:', error);
        }
    });
}
