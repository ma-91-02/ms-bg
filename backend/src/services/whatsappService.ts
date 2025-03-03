import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

class WhatsAppService {
  private client: any;
  private isDevelopment: boolean;
  private fromNumber: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || '';
    
    // إنشاء عميل twilio باستخدام البيانات الخاصة بك
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.warn('⚠️ لم يتم توفير بيانات Twilio، سيتم عرض الرموز في وحدة التحكم فقط');
    }
  }

  // دالة لتنسيق رقم الهاتف
  formatPhoneNumber(phoneNumber: string): string {
    // إزالة أي مسافات أو أحرف خاصة
    let formattedNumber = phoneNumber.replace(/\s+/g, '');
    
    // التأكد من أن الرقم يبدأ بـ +
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    
    return formattedNumber;
  }

  // إرسال رمز OTP عبر WhatsApp
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    // عرض الرمز في وحدة التحكم دائماً (للتطوير)
    console.log(`🔑 [WhatsApp] رمز التحقق لـ ${phoneNumber}: ${otp}`);
    
    // في وضع التطوير، نكتفي بعرض الرمز دون إرسال رسائل حقيقية
    if (this.isDevelopment) {
      console.log('✅ [DEV MODE] تم تخطي إرسال الرسالة لتوفير التكاليف');
      return true;
    }
    
    // تنسيق رقم الهاتف
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    // في حالة عدم وجود عميل Twilio أو اختيار وضع المحاكاة في التطوير
    if (!this.client) {
      return true; // عائد ناجح للتطوير
    }
    
    try {
      // تحضير أرقام WhatsApp (إضافة البادئة هنا بدلاً من ملف البيئة)
      const toWhatsApp = `whatsapp:${formattedNumber}`;
      const fromWhatsApp = `whatsapp:${this.fromNumber}`;
      
      // تحضير نص الرسالة
      const messageBody = `رمز التحقق الخاص بك في تطبيق المفقودات هو: ${otp}`;
      
      // طباعة معلومات الإرسال للتأكد
      if (this.isDevelopment) {
        console.log(`🚀 محاولة إرسال WhatsApp من ${fromWhatsApp} إلى ${toWhatsApp}`);
      }
      
      // إرسال رسالة WhatsApp مع الصيغة الصحيحة
      const message = await this.client.messages.create({
        body: messageBody,
        from: fromWhatsApp,  // استخدام المتغير الجديد مع البادئة
        to: toWhatsApp
      });
      
      if (this.isDevelopment) {
        console.log(`✅ تم إرسال الرسالة بنجاح، معرف الرسالة: ${message.sid}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال رسالة WhatsApp:', error);
      return false;
    }
  }
}

export default new WhatsAppService();
