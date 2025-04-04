/**
 * خدمة الرسائل النصية المحاكاة
 * للاستخدام في بيئة التطوير فقط
 */

/**
 * توليد رمز التحقق المكون من أرقام
 * @param length طول الرمز (افتراضيًا 6)
 * @returns رمز التحقق المولد
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

/**
 * إرسال رسالة نصية (محاكاة)
 * @param to رقم الهاتف المستلم
 * @param message نص الرسالة
 * @returns وعد بنتيجة الإرسال
 */
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  console.log('📱 [MOCK SMS] إرسال رسالة إلى:', to);
  console.log('📝 [MOCK SMS] محتوى الرسالة:', message);
  console.log('✅ [MOCK SMS] تم إرسال الرسالة بنجاح (محاكاة)');
  return true;
}; 