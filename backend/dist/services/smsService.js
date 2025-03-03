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
exports.sendSMS = exports.generateOTP = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
// تحميل متغيرات البيئة
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
let client;
// إذا كانت متغيرات البيئة موجودة، قم بإنشاء عميل Twilio
if (accountSid && authToken) {
    client = (0, twilio_1.default)(accountSid, authToken);
}
// إنشاء رمز OTP عشوائي
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.generateOTP = generateOTP;
// إرسال رسالة نصية
const sendSMS = (to, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // في بيئة التطوير، يتم طباعة الرسالة بدلاً من إرسالها
        if (process.env.NODE_ENV === 'development' || !client) {
            console.log(`[SMS محاكاة] إلى: ${to}, الرسالة: ${body}`);
            return true;
        }
        // في بيئة الإنتاج، يتم إرسال الرسالة فعليًا
        yield client.messages.create({
            body,
            from: twilioNumber,
            to
        });
        return true;
    }
    catch (error) {
        console.error('خطأ في إرسال الرسالة النصية:', error);
        throw error;
    }
});
exports.sendSMS = sendSMS;
