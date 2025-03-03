import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/mobile/User';
import { generateOTP, sendSMS } from '../../services/smsService';
import whatsappService from '../../services/whatsappService';
import { sendSuccess, sendError } from '../../utils/responseGenerator';
import { AuthRequest } from '../../types/express';

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
      return sendError(res, 'رقم الهاتف مطلوب', 400);
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
    
    return sendSuccess(res, null, 'تم إرسال رمز التحقق عبر WhatsApp');
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
    
    // التحقق من وجود رقم الهاتف والرمز
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير رقم الهاتف ورمز التحقق'
      });
    }
    
    // البحث عن المستخدم
    let user = await User.findOne({ phoneNumber });
    
    // إذا كان وضع التطوير وتم استخدام رمز التخطي
    if (process.env.NODE_ENV === 'development' && otp === '000000') {
      console.log('✅ [DEV MODE] تم استخدام رمز التخطي 000000');
      
      // إنشاء مستخدم جديد إذا لم يكن موجوداً
      if (!user) {
        user = await User.create({
          phoneNumber,
          password: 'temporary_password', // سيتم تغييرها لاحقاً
          fullName: '',
          isProfileComplete: false
        });
      }
      
      // إنشاء التوكن
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      // إرسال الاستجابة
      return res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح (وضع التطوير)',
        token,
        isProfileComplete: user.isProfileComplete,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.fullName
        }
      });
    }
    
    // البحث عن المستخدم
    const userExists = await User.findOne({
      phoneNumber,
      otpExpires: { $gt: Date.now() }
    });
    
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: 'رقم الهاتف غير مسجل أو انتهت صلاحية الرمز'
      });
    }
    
    // التحقق من الرمز
    if (userExists.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'رمز التحقق غير صحيح'
      });
    }
    
    // إعادة تعيين OTP
    userExists.otp = undefined;
    userExists.otpExpires = undefined;
    await userExists.save();
    
    // إنشاء توكن
    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      isProfileComplete: userExists.isProfileComplete,
      user: {
        id: userExists._id,
        phoneNumber: userExists.phoneNumber,
        name: userExists.fullName
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
export const completeProfile = async (req: AuthRequest, res: Response) => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = req.user._id;
    const { password, confirmPassword, fullName, lastName, email, birthDate } = req.body;

    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين'
      });
    }

    // جلب المستخدم أولاً
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    // تحديث بيانات المستخدم
    if (password) user.password = password;
    if (fullName) user.fullName = fullName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (birthDate) user.birthDate = new Date(birthDate);
    user.isProfileComplete = true;
    
    // حفظ المستخدم - سيؤدي ذلك إلى تشغيل هوك pre-save وتشفير كلمة المرور
    await user.save();

    // إنشاء توكن جديد
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        lastName: user.lastName || '',
        email: user.email || '',
        birthDate: user.birthDate
      }
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي'
    });
  }
};

/**
 * استكمال التسجيل بعد التحقق من OTP
 */
export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password, confirmPassword, fullName, lastName, email, birthDate } = req.body;
    
    // التحقق من وجود الحقول الإلزامية
    if (!phoneNumber || !password || !confirmPassword || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير جميع الحقول المطلوبة: رقم الهاتف، كلمة المرور، تأكيد كلمة المرور، الاسم الكامل'
      });
    }
    
    // التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين'
      });
    }
    
    // البحث عن المستخدم بعد التحقق من OTP
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم. يرجى التحقق من الرقم أو إكمال عملية التحقق من OTP أولاً'
      });
    }
    
    // تحديث بيانات المستخدم
    user.password = password;
    user.fullName = fullName;
    user.lastName = lastName || '';
    user.email = email || '';
    user.birthDate = birthDate ? new Date(birthDate) : undefined;
    user.isProfileComplete = true;
    
    await user.save();
    
    // إنشاء توكن
    const token = signToken(user._id.toString());
    
    res.status(200).json({
      success: true,
      message: 'تم إكمال التسجيل بنجاح',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          lastName: user.lastName,
          email: user.email,
          birthDate: user.birthDate,
          points: user.points
        },
        token
      }
    });
  } catch (error) {
    console.error('خطأ في استكمال التسجيل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استكمال التسجيل'
    });
  }
};

/**
 * تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    // التحقق من وجود رقم الهاتف وكلمة المرور
    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير رقم الهاتف وكلمة المرور'
      });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود. يرجى التسجيل أولاً'
      });
    }

    // تحقق إذا كانت كلمة المرور مخزنة بشكل نصي (إجراء مؤقت)
    let isValidPassword = false;
    
    // أولاً، حاول التحقق باستخدام طريقة comparePassword
    try {
      isValidPassword = await user.comparePassword(password);
    } catch (error) {
      console.log('خطأ في مقارنة كلمة المرور:', error);
    }
    
    // إذا فشلت المقارنة، تحقق من تطابق النص مباشرة (للمستخدمين الموجودين بكلمات مرور نصية)
    if (!isValidPassword && user.password === password) {
      console.log('تم استخدام مقارنة كلمة المرور النصية - سيتم تحديثها');
      
      // تحديث كلمة المرور لتشفيرها
      user.password = password;
      await user.save();
      
      // تعيين isValidPassword إلى true بعد تحديث كلمة المرور
      isValidPassword = true;
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    // التحقق من حالة حظر المستخدم
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'تم حظر حسابك. يرجى التواصل مع الدعم'
      });
    }

    // إنشاء توكن
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        lastName: user.lastName || '',
        email: user.email || '',
        birthDate: user.birthDate,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};