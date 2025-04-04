"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.sendMessage = exports.MessageChannel = exports.generateOTP = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * إنشاء رمز OTP عشوائي
 * @param length طول الرمز
 * @returns الرمز المُنشأ
 */
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.generateOTP = generateOTP;
/**
 * قناة الإرسال
 */
var MessageChannel;
(function (MessageChannel) {
    MessageChannel["SMS"] = "sms";
    MessageChannel["WHATSAPP"] = "whatsapp";
})(MessageChannel || (exports.MessageChannel = MessageChannel = {}));
/**
 * إرسال رسالة (SMS أو WhatsApp)
 * @param to رقم المستلم
 * @param body محتوى الرسالة
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
const sendMessage = async (to, body, channel = MessageChannel.SMS) => {
    try {
        // في بيئة التطوير أو الاختبار، نطبع الرسالة فقط
        console.log(`📱 [محاكاة إرسال رسالة] قناة: ${channel}`);
        console.log(`📞 إلى: ${to}`);
        console.log(`📝 المحتوى: ${body}`);
        // يمكنك إضافة منطق إرسال حقيقي هنا في بيئة الإنتاج
        // مثل استخدام خدمة Twilio أو أي خدمة أخرى
        return true;
    }
    catch (error) {
        console.error(`❌ خطأ في إرسال رسالة عبر ${channel}:`, error);
        return false;
    }
};
exports.sendMessage = sendMessage;
/**
 * إرسال رمز OTP
 * @param phoneNumber رقم الهاتف
 * @param otp رمز التحقق
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
const sendOTP = async (phoneNumber, otp, channel = MessageChannel.SMS) => {
    const message = `رمز التحقق الخاص بك هو: ${otp}. هذا الرمز صالح لمدة 15 دقيقة.`;
    return (0, exports.sendMessage)(phoneNumber, message, channel);
};
exports.sendOTP = sendOTP;
exports.default = {
    generateOTP: exports.generateOTP,
    sendMessage: exports.sendMessage,
    sendOTP: exports.sendOTP,
    MessageChannel
};
//# sourceMappingURL=messagingService.js.map