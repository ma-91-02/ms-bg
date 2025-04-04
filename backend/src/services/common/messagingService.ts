import dotenv from 'dotenv';

dotenv.config();

/**
 * إنشاء رمز OTP عشوائي
 * @param length طول الرمز
 * @returns الرمز المُنشأ
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

/**
 * قناة الإرسال
 */
export enum MessageChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp'
}

/**
 * إرسال رسالة (SMS أو WhatsApp)
 * @param to رقم المستلم
 * @param body محتوى الرسالة
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
export const sendMessage = async (
  to: string,
  body: string,
  channel: MessageChannel = MessageChannel.SMS
): Promise<boolean> => {
  try {
    // في بيئة التطوير أو الاختبار، نطبع الرسالة فقط
    console.log(`📱 [محاكاة إرسال رسالة] قناة: ${channel}`);
    console.log(`📞 إلى: ${to}`);
    console.log(`📝 المحتوى: ${body}`);
    
    // يمكنك إضافة منطق إرسال حقيقي هنا في بيئة الإنتاج
    // مثل استخدام خدمة Twilio أو أي خدمة أخرى
    
    return true;
  } catch (error) {
    console.error(`❌ خطأ في إرسال رسالة عبر ${channel}:`, error);
    return false;
  }
};

/**
 * إرسال رمز OTP
 * @param phoneNumber رقم الهاتف
 * @param otp رمز التحقق
 * @param channel قناة الإرسال
 * @returns نجاح أو فشل العملية
 */
export const sendOTP = async (
  phoneNumber: string,
  otp: string,
  channel: MessageChannel = MessageChannel.SMS
): Promise<boolean> => {
  const message = `رمز التحقق الخاص بك هو: ${otp}. هذا الرمز صالح لمدة 15 دقيقة.`;
  return sendMessage(phoneNumber, message, channel);
};

export default {
  generateOTP,
  sendMessage,
  sendOTP,
  MessageChannel
}; 