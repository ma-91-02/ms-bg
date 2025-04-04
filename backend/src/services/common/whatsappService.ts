/**
 * خدمة الواتساب المحاكاة
 * للاستخدام في بيئة التطوير فقط
 */

/**
 * إرسال رسالة عبر WhatsApp (محاكاة)
 * @param to رقم الهاتف المستلم
 * @param message نص الرسالة
 * @returns وعد بنتيجة الإرسال
 */
const sendWhatsAppMessage = async (to: string, message: string): Promise<boolean> => {
  console.log('📱 [MOCK WhatsApp] إرسال رسالة إلى:', to);
  console.log('📝 [MOCK WhatsApp] محتوى الرسالة:', message);
  console.log('✅ [MOCK WhatsApp] تم إرسال الرسالة بنجاح (محاكاة)');
  return true;
};

/**
 * إرسال رمز التحقق OTP عبر WhatsApp (محاكاة)
 * @param to رقم الهاتف المستلم
 * @param otp رمز التحقق
 * @returns نتيجة الإرسال
 */
const sendOTP = async (to: string, otp: string): Promise<boolean> => {
  const message = `مرحباً! رمز التحقق الخاص بك هو: ${otp}. يرجى عدم مشاركته مع أي شخص.`;
  console.log('🔑 [MOCK WhatsApp] إرسال رمز التحقق إلى:', to);
  console.log('🔐 [MOCK WhatsApp] رمز التحقق:', otp);
  return sendWhatsAppMessage(to, message);
};

export default {
  sendWhatsAppMessage,
  sendOTP
}; 