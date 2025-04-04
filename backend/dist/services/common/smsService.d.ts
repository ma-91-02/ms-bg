/**
 * خدمة الرسائل النصية المحاكاة
 * للاستخدام في بيئة التطوير فقط
 */
/**
 * توليد رمز التحقق المكون من أرقام
 * @param length طول الرمز (افتراضيًا 6)
 * @returns رمز التحقق المولد
 */
export declare const generateOTP: (length?: number) => string;
/**
 * إرسال رسالة نصية (محاكاة)
 * @param to رقم الهاتف المستلم
 * @param message نص الرسالة
 * @returns وعد بنتيجة الإرسال
 */
export declare const sendSMS: (to: string, message: string) => Promise<boolean>;
//# sourceMappingURL=smsService.d.ts.map