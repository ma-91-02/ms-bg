import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/mobile/User';
import { generateOTP, sendSMS } from '../../services/common/smsService';
import whatsappService from '../../services/common/whatsappService';
import { sendSuccess, sendError } from '../../utils/common/responseGenerator';
import { AuthRequest } from '../../types/express';
import Otp from '../../models/mobile/Otp';

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
    
    console.log(`📤 إرسال OTP إلى ${phoneNumber}: ${otp}`);
    
    // حفظ OTP في قاعدة البيانات
    const newOtp = new Otp({
      phoneNumber,
      code: otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // ينتهي بعد 15 دقيقة
    });
    
    await newOtp.save();
    
    // إرسال OTP عبر واتساب أو SMS
    try {
      // استدعاء خدمة الرسائل (محاكاة فقط في هذا المثال)
      // await smsService.sendOTP(phoneNumber, otp);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح'
      // في بيئة التطوير، قد ترغب في إرجاع الرمز للاختبار
      // ...(process.env.NODE_ENV === 'development' ? { testOtp: otp } : {})
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال رمز التحقق'
    });
  }
};

// التحقق من OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    // التحقق من وجود رقم الهاتف ورمز OTP
    if (!phoneNumber || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "يجب توفير رقم الهاتف ورمز التحقق" 
      });
    }

    // البحث عن آخر رمز OTP مرسل لهذا الرقم
    const otpRecord = await Otp.findOne({ phoneNumber }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "لم يتم إرسال رمز تحقق لهذا الرقم" 
      });
    }
    
    // التحقق من صحة الرمز
    const isValidOtp = otpRecord.code === otp;
    
    // التحقق من صلاحية الرمز (لم تنتهي مدته)
    const now = new Date();
    const otpExpiry = otpRecord.expiresAt || new Date(otpRecord.createdAt.getTime() + 15 * 60000);
    
    if (now > otpExpiry) {
      return res.status(400).json({ 
        success: false,
        message: "انتهت صلاحية رمز التحقق" 
      });
    }

    if (!isValidOtp) {
      return res.status(400).json({ 
        success: false,
        message: "رمز التحقق غير صحيح" 
      });
    }

    // تحديث حالة OTP إلى مستخدم
    otpRecord.isUsed = true;
    await otpRecord.save();

    // إنشاء المستخدم أو الحصول عليه إذا كان موجودًا بالفعل - تغيير هنا
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // إنشاء مستخدم جديد مع الحد الأدنى من المعلومات
      user = new User({ 
        phoneNumber,
        // لا نضيف أي حقول أخرى هنا - سيكملها المستخدم لاحقًا
      });
      await user.save();
    }

    // إنشاء وإرجاع توكن JWT
    const token = jwt.sign(
      { userId: user._id, phoneNumber },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    return res.status(200).json({
      success: true,
      message: "تم التحقق بنجاح",
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName || '',
        isProfileComplete: !!(user.fullName && user.email), // إضافة حقل للإشارة إلى اكتمال الملف الشخصي
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ 
      success: false,
      message: "حدث خطأ أثناء التحقق من الرمز" 
    });
  }
};

// تعريف نوع مؤقت 
interface ExtendedAuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role?: string;
  };
}

// إكمال ملف تعريف المستخدم
export const completeProfile = async (req: Request, res: Response): Promise<Response> => {
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

    return res.status(200).json({
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
  } catch (error: any) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي',
      error: error.message
    });
  }
};

/**
 * استكمال التسجيل بعد التحقق من OTP
 */
export const completeRegistration = async (req: Request, res: Response): Promise<Response> => {
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
    const token = signToken(user._id?.toString() || '');
    
    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استكمال التسجيل'
    });
  }
};

/**
 * تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
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

    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};

// إضافة وظيفة للحصول على ملف المستخدم الشخصي
export const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const authReq = req as any;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = authReq.user.id;
    
    // البحث عن المستخدم
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }

    // إرجاع بيانات المستخدم
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber,
        birthDate: user.birthDate,
        points: user.points,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على ملف المستخدم الشخصي:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الحصول على ملف المستخدم الشخصي',
      error: error.message
    });
  }
};