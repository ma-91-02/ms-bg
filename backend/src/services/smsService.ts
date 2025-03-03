import twilio from 'twilio';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let client: any;

// إذا كانت متغيرات البيئة موجودة، قم بإنشاء عميل Twilio
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

// إنشاء رمز OTP عشوائي
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

// إرسال رسالة نصية
export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  try {
    // في بيئة التطوير، يتم طباعة الرسالة بدلاً من إرسالها
    if (process.env.NODE_ENV === 'development' || !client) {
      console.log(`[SMS محاكاة] إلى: ${to}, الرسالة: ${body}`);
      return true;
    }
    
    // في بيئة الإنتاج، يتم إرسال الرسالة فعليًا
    await client.messages.create({
      body,
      from: twilioNumber,
      to
    });
    
    return true;
  } catch (error) {
    console.error('خطأ في إرسال الرسالة النصية:', error);
    throw error;
  }
};