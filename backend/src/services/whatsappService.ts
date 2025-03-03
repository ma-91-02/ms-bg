import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// إنشاء عميل Twilio إذا كانت جميع البيانات المطلوبة متوفرة
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * خدمة إرسال رسائل واتساب
 * يمكن استبدالها بخدمة Twilio في بيئة الإنتاج
 */

/**
 * إرسال رمز OTP عبر واتساب
 * @param phoneNumber رقم الهاتف
 * @param otp رمز التحقق
 * @returns نجاح أو فشل العملية
 */
export const sendOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // في بيئة التطوير، نقوم فقط بطباعة الرمز في سجل التصحيح
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [DEV MODE] إرسال رمز OTP:');
      console.log(`📞 إلى: ${phoneNumber}`);
      console.log(`🔢 الرمز: ${otp}`);
      return true;
    }
    
    // في بيئة الإنتاج، استخدم Twilio أو أي خدمة أخرى
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      // استيراد Twilio فقط عند الحاجة
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      await client.messages.create({
        body: `رمز التحقق الخاص بك هو: ${otp}. هذا الرمز صالح لمدة 15 دقيقة.`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      });
      
      return true;
    }
    
    // إذا لم تكن هناك تهيئة Twilio
    console.error('❌ لم يتم تكوين خدمة Twilio بشكل صحيح');
    return false;
  } catch (error) {
    console.error('❌ خطأ في إرسال رسالة واتساب:', error);
    return false;
  }
};

/**
 * إرسال إشعار مطابقة عبر واتساب
 */
export const sendMatchNotification = async (
  phoneNumber: string,
  matchDetails: any
): Promise<boolean> => {
  try {
    // في بيئة التطوير، نقوم فقط بطباعة الإشعار في سجل التصحيح
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [DEV MODE] إرسال إشعار مطابقة:');
      console.log(`📞 إلى: ${phoneNumber}`);
      console.log('📋 تفاصيل المطابقة:', matchDetails);
      return true;
    }
    
    // منطق مشابه للإنتاج باستخدام Twilio
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار مطابقة:', error);
    return false;
  }
};

export default {
  sendOTP,
  sendMatchNotification
};
