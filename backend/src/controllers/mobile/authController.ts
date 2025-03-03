import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/mobile/User';
import { generateOTP, sendSMS } from '../../services/smsService';
import whatsappService from '../../services/whatsappService';

// إنشاء JWT token
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'your-default-secret-key';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// إرسال رمز OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }
    
    // توليد رمز OTP مكون من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // انتهاء الصلاحية بعد 15 دقيقة
    
    // حفظ OTP في قاعدة البيانات
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { 
        phoneNumber,
        otp,
        otpExpires
      },
      { upsert: true, new: true }
    );
    
    // إرسال OTP عبر WhatsApp
    const sent = await whatsappService.sendOTP(phoneNumber, otp);
    
    if (!sent) {
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إرسال رمز التحقق'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق عبر WhatsApp'
    });
  } catch (error) {
    console.error('خطأ في إرسال OTP:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// التحقق من OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف ورمز التحقق مطلوبان'
      });
    }
    
    // رمز التخطي للتطوير
    if (process.env.NODE_ENV === 'development' && otp === '000000') {
      console.log('✅ [DEV MODE] تم استخدام رمز التخطي 000000');
      
      // البحث عن المستخدم أو إنشاء مستخدم جديد إذا لم يكن موجوداً
      let user = await User.findOne({ phoneNumber });
      
      if (!user) {
        user = await User.create({
          phoneNumber,
          isProfileComplete: false
        });
      }
      
      // إنشاء token
      const token = signToken(user._id.toString());
      
      return res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح (وضع التطوير)',
        token,
        isProfileComplete: user.isProfileComplete,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name || ''
        }
      });
    }
    
    // البحث عن المستخدم
    const user = await User.findOne({
      phoneNumber,
      otpExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'رقم الهاتف غير مسجل أو انتهت صلاحية الرمز'
      });
    }
    
    // التحقق من الرمز
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'رمز التحقق غير صحيح'
      });
    }
    
    // إعادة تعيين OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // إنشاء token
    const token = signToken(user._id.toString());
    
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      isProfileComplete: user.isProfileComplete,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name || ''
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من OTP:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// إكمال ملف تعريف المستخدم
export const completeProfile = async (req: Request, res: Response) => {
  try {
    const { userType, name, idNumber } = req.body;
    // تأكد من أن req.user موجود
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به - يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.user.id;
    
    // التحقق من صحة نوع المستخدم
    if (!['finder', 'loser'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع مستخدم غير صالح. يجب أن يكون إما finder أو loser'
      });
    }
    
    // تحديث ملف تعريف المستخدم
    const user = await User.findByIdAndUpdate(
      userId,
      {
        userType,
        name,
        idNumber,
        isProfileComplete: true
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          userType: user.userType,
          isProfileComplete: user.isProfileComplete
        }
      }
    });
  } catch (error) {
    console.error('خطأ في تكملة الملف الشخصي:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي'
    });
  }
};