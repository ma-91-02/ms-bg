/**
 * إنشاء رمز OTP عشوائي
 * @param length طول الرمز
 * @returns الرمز المُنشأ
 */
export declare const generateOTP: (length?: number) => string;
/**
 * قناة الإرسال
 */
export declare enum MessageChannel {
    SMS = "sms",
    WHATSAPP = "whatsapp"
}
/**
 * إرسال رسالة (SMS أو WhatsApp)
 * @param to رقم المستلم
 * @param body محتوى الرسالة
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
export declare const sendMessage: (to: string, body: string, channel?: MessageChannel) => Promise<boolean>;
/**
 * إرسال رمز OTP
 * @param phoneNumber رقم الهاتف
 * @param otp رمز التحقق
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
export declare const sendOTP: (phoneNumber: string, otp: string, channel?: MessageChannel) => Promise<boolean>;
declare const _default: {
    generateOTP: (length?: number) => string;
    sendMessage: (to: string, body: string, channel?: MessageChannel) => Promise<boolean>;
    sendOTP: (phoneNumber: string, otp: string, channel?: MessageChannel) => Promise<boolean>;
    MessageChannel: typeof MessageChannel;
};
export default _default;
//# sourceMappingURL=messagingService.d.ts.map