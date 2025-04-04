import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/mobile/User';
import { generateOTP, sendSMS } from '../../services/common/smsService';
import whatsappService from '../../services/common/whatsappService';
import { sendSuccess, sendError } from '../../utils/common/responseGenerator';
import { AuthRequest } from '../../types/express';
import Otp from '../../models/mobile/Otp';
import path from 'path';
import fs from 'fs';

// إنشاء JWT token
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'your-default-secret-key';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// إرسال رمز OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, isRegistration } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }
    
    // إذا كانت عملية تسجيل، نتحقق من وجود المستخدم مسبقاً
    if (isRegistration) {
      // التحقق مما إذا كان المستخدم موجوداً بالفعل
      const existingUser = await User.findOne({ phoneNumber });
      
      if (existingUser && existingUser.isProfileComplete) {
        return res.status(400).json({
          success: false,
          message: 'هذا الرقم مسجل بالفعل في التطبيق، يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد',
          userExists: true
        });
      }
    }
    
    // استخدام رمز ثابت (000000) في وضع الديمو
    // أو توليد رمز عشوائي في وضع الإنتاج
    const isDemoMode = true; // قم بتغييره إلى false عند التشغيل في وضع الإنتاج
    const otp = isDemoMode ? '000000' : Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📤 إرسال OTP إلى ${phoneNumber}: ${otp}`);
    
    // حفظ OTP في قاعدة البيانات
    const newOtp = new Otp({
      phoneNumber,
      code: otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // ينتهي بعد 15 دقيقة
    });
    
    await newOtp.save();
    
    // في وضع الديمو، لا نرسل OTP فعليًا
    if (!isDemoMode) {
      try {
        // استدعاء خدمة الرسائل
        // await smsService.sendOTP(phoneNumber, otp);
      } catch (error) {
        console.error('Error sending SMS:', error);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح',
      // إرجاع الرمز دائمًا في وضع الديمو
      ...(isDemoMode ? { demoOtp: otp } : {})
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

    // وضع الديمو: السماح بأي رقم هاتف مع الرمز 000000
    const isDemoMode = true; // قم بتغييره إلى false عند التشغيل في وضع الإنتاج
    
    if (isDemoMode && otp === '000000') {
      console.log(`✅ تم التحقق من OTP في وضع الديمو لرقم ${phoneNumber}`);
      
      // البحث عن المستخدم أو إنشاؤه
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
        message: "تم التحقق بنجاح (وضع الديمو)",
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName || '',
          isProfileComplete: !!(user.fullName && user.email),
          isDemoUser: true
        }
      });
    }
    
    // معالجة عادية للتحقق من OTP في الوضع العادي
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
        isProfileComplete: !!(user.fullName && user.email),
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

// تحديث الملف الشخصي
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = req.user._id;
    const { firstName, lastName, email, phoneNumber } = req.body;

    // جلب المستخدم أولاً
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    // تحديث بيانات المستخدم
    if (firstName) user.fullName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // حفظ المستخدم
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        lastName: user.lastName || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
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

// رفع صورة الملف الشخصي
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تحميل أي صورة'
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك برفع الصورة'
      });
    }

    // البحث عن المستخدم وحذف الصورة القديمة
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }

    console.log('Original file path:', req.file.path);
    console.log('Original file name:', req.file.filename);

    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', '..', '..', 'uploads', user.profileImage);
      console.log('Old image path:', oldImagePath);
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Old image deleted successfully');
        } else {
          console.log('Old image not found at path:', oldImagePath);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with the update even if old image deletion fails
      }
    }

    // تحديث مسار الصورة في قاعدة البيانات
    const profileImagePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
    console.log('New profile image path:', profileImagePath);
    
    // تحديث المستخدم مع التأكد من حفظ جميع الحقول
    user.profileImage = profileImagePath;
    await user.save();
    console.log('User updated with new profile image path');

    // إرجاع المستخدم المحدث مع جميع البيانات
    return res.status(200).json({
      success: true,
      message: 'تم تحديث صورة الملف الشخصي بنجاح',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          lastName: user.lastName || '',
          email: user.email || '',
          profileImage: user.profileImage,
          isProfileComplete: user.isProfileComplete
        }
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصورة'
    });
  }
};

// وظائف استعادة كلمة المرور

/**
 * طلب إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/reset-password-request
 */
export const resetPasswordRequest = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مطلوب'
      });
    }
    
    // التحقق من وجود المستخدم
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد حساب مرتبط بهذا الرقم، يرجى التسجيل أولاً'
      });
    }
    
    // استخدام رمز ثابت في وضع الديمو
    const isDemoMode = true; // قم بتغييره إلى false عند التشغيل في وضع الإنتاج
    const otp = isDemoMode ? '000000' : Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📤 إرسال OTP لاستعادة كلمة المرور إلى ${phoneNumber}: ${otp}`);
    
    // حفظ OTP في قاعدة البيانات مع الإشارة إلى أنه للاستعادة
    const newOtp = new Otp({
      phoneNumber,
      code: otp,
      isForPasswordReset: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // ينتهي بعد 15 دقيقة
    });
    
    await newOtp.save();
    
    // في وضع الديمو، لا نرسل OTP فعليًا
    if (!isDemoMode) {
      try {
        // await smsService.sendOTP(phoneNumber, otp, 'استعادة كلمة المرور');
      } catch (error) {
        console.error('خطأ في إرسال رمز التحقق:', error);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح',
      expiresAt: newOtp.expiresAt,
      ...(isDemoMode ? { demoOtp: otp } : {})
    });
  } catch (error) {
    console.error('خطأ في طلب استعادة كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء معالجة طلب استعادة كلمة المرور'
    });
  }
};

/**
 * التحقق من رمز إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/verify-reset-code
 */
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف ورمز التحقق مطلوبان'
      });
    }
    
    // التحقق من وجود المستخدم
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد حساب مرتبط بهذا الرقم'
      });
    }
    
    // وضع الديمو: السماح بأي رقم هاتف مع الرمز 000000
    const isDemoMode = true; // قم بتغييره إلى false عند التشغيل في وضع الإنتاج
    
    if (isDemoMode && otp === '000000') {
      console.log(`✅ تم التحقق من رمز إعادة تعيين كلمة المرور في وضع الديمو لرقم ${phoneNumber}`);
      
      // إنشاء رمز إعادة تعيين فريد
      const resetToken = jwt.sign(
        { userId: user._id, phoneNumber, isResetToken: true, isDemoMode: true },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );
      
      return res.status(200).json({
        success: true,
        message: 'تم التحقق من الرمز بنجاح (وضع الديمو)',
        data: {
          resetToken
        }
      });
    }
    
    // البحث عن OTP في حالة الوضع العادي
    const otpRecord = await Otp.findOne({ 
      phoneNumber,
      code: otp,
      isForPasswordReset: true
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح'
      });
    }
    
    // التحقق من صلاحية الرمز
    const now = new Date();
    const expiryDate = otpRecord.expiresAt || new Date(otpRecord.createdAt.getTime() + 15 * 60 * 1000);
    
    if (now > expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية رمز التحقق'
      });
    }
    
    // تحديث OTP إلى مستخدم
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    // إنشاء رمز إعادة تعيين فريد
    const resetToken = jwt.sign(
      { userId: user._id, phoneNumber, isResetToken: true },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح',
      data: {
        resetToken
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من رمز إعادة التعيين:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من رمز إعادة التعيين'
    });
  }
};

/**
 * إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, resetToken, newPassword, confirmPassword } = req.body;
    
    if (!phoneNumber || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة: رقم الهاتف، رمز إعادة التعيين، كلمة المرور الجديدة، تأكيد كلمة المرور'
      });
    }
    
    // التحقق من تطابق كلمتي المرور
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور وتأكيدها غير متطابقين'
      });
    }
    
    // تحقق من وضع الديمو
    // في وضع الديمو نتخطى التحقق من التوكن ونسمح بتغيير كلمة المرور
    const isDemoMode = true; // قم بتغييره إلى false عند التشغيل في وضع الإنتاج
    let userId;
    
    if (isDemoMode) {
      try {
        // محاولة فك تشفير التوكن للتحقق مما إذا كان في وضع الديمو
        const decoded: any = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_jwt_secret');
        
        if (decoded.isDemoMode) {
          console.log('✅ تم التعرف على توكن وضع الديمو');
          userId = decoded.userId;
        }
      } catch (error) {
        // في حالة خطأ في التوكن، نستمر في المعالجة العادية
        console.log('توكن غير صالح أو ليس في وضع الديمو');
      }
      
      // في وضع الديمو إذا لم نتمكن من فك التوكن، نبحث عن المستخدم عن طريق رقم الهاتف
      if (!userId) {
        const user = await User.findOne({ phoneNumber });
        if (user) {
          userId = user._id;
        }
      }
      
      if (userId) {
        console.log(`✅ تغيير كلمة المرور في وضع الديمو للمستخدم ${userId}`);
        
        // تحديث كلمة المرور
        const user = await User.findById(userId);
        if (user) {
          user.password = newPassword;
          await user.save();
          
          return res.status(200).json({
            success: true,
            message: 'تمت إعادة تعيين كلمة المرور بنجاح (وضع الديمو)'
          });
        }
      }
    }
    
    // التعامل العادي مع إعادة تعيين كلمة المرور
    // التحقق من صلاحية التوكن
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_jwt_secret');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية'
      });
    }
    
    // التحقق من أن التوكن لإعادة تعيين كلمة المرور
    if (!decoded || !(decoded as any).isResetToken || !(decoded as any).userId) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح'
      });
    }
    
    // التحقق من أن رقم الهاتف يتطابق مع الموجود في التوكن
    if ((decoded as any).phoneNumber !== phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف غير مطابق للرمز المقدم'
      });
    }
    
    // البحث عن المستخدم
    const user = await User.findById((decoded as any).userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'تمت إعادة تعيين كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
    });
  }
};