"use strict";
/**
 * خدمة الرسائل النصية المحاكاة
 * للاستخدام في بيئة التطوير فقط
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = exports.generateOTP = void 0;
/**
 * توليد رمز التحقق المكون من أرقام
 * @param length طول الرمز (افتراضيًا 6)
 * @returns رمز التحقق المولد
 */
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
/**
 * إرسال رسالة نصية (محاكاة)
 * @param to رقم الهاتف المستلم
 * @param message نص الرسالة
 * @returns وعد بنتيجة الإرسال
 */
const sendSMS = async (to, message) => {
    console.log('📱 [MOCK SMS] إرسال رسالة إلى:', to);
    console.log('📝 [MOCK SMS] محتوى الرسالة:', message);
    console.log('✅ [MOCK SMS] تم إرسال الرسالة بنجاح (محاكاة)');
    return true;
};
exports.sendSMS = sendSMS;
//# sourceMappingURL=smsService.js.map