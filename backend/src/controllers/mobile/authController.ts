import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types/express';
import * as otpService from '../../services/common/otpService';
import {
  hashPassword,
  verifyPassword,
  sanitizeUser,
} from '../../services/common/userService';

/**
 * مصادقة تطبيق الجوال.
 *
 * أخطر ما أُصلح هنا: كان `const isDemoMode = true;` مكتوبًا يدويًا في خمسة
 * مواضع من هذا الملف، فيقبل النظام الرمز 000000 لأي رقم هاتف — أي إنشاء
 * حساب أو دخول لأي حساب بلا أي تحقق. وكان الرمز يُعاد أيضًا في جسم
 * الاستجابة (`demoOtp`). صار الوضع محكومًا بمتغير بيئة واحد يرفض الخادم
 * الإقلاع لو فُعّل في الإنتاج.
 */

const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET غير مضبوط — لا يمكن إصدار التوكنات');
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

/** رسائل موحّدة لفشل التحقق من الرمز */
const OTP_ERRORS: Record<string, string> = {
  not_found: 'لا يوجد رمز تحقق صالح لهذا الرقم',
  expired: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد',
  too_many_attempts: 'تجاوزت عدد المحاولات المسموح بها. يرجى طلب رمز جديد',
  invalid: 'رمز التحقق غير صحيح',
};

const requireUserId = (req: Request, res: Response): string | null => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'غير مصرح به. يرجى تسجيل الدخول' });
    return null;
  }
  return userId;
};

// ---------------------------------------------------------------------------
//  التسجيل والدخول
// ---------------------------------------------------------------------------

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, isRegistration } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
    }

    if (isRegistration) {
      const existing = await prisma.user.findUnique({ where: { phoneNumber } });
      if (existing?.isProfileComplete) {
        return res.status(400).json({
          success: false,
          message:
            'هذا الرقم مسجل بالفعل في التطبيق، يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد',
          userExists: true,
        });
      }
    }

    const { code, expiresAt } = await otpService.issueOtp(phoneNumber);

    if (otpService.isDemoMode()) {
      console.log(`📤 [DEMO] رمز التحقق لـ ${phoneNumber}: ${code}`);
    } else {
      // TODO: ربط مزوّد الرسائل الفعلي (Twilio) — smsService محاكاة حاليًا
    }

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح',
      expiresAt,
      // الرمز لا يُعاد إلا في وضع الديمو الصريح خارج الإنتاج
      ...(otpService.isDemoMode() ? { demoOtp: code } : {}),
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال رمز التحقق',
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير رقم الهاتف ورمز التحقق',
      });
    }

    const result = await otpService.verifyOtp(phoneNumber, otp);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: OTP_ERRORS[result.reason] ?? 'رمز التحقق غير صحيح',
      });
    }

    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber, isProfileComplete: false },
    });

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'تم حظر حسابك. يرجى التواصل مع الدعم',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح',
      token: signToken(user.id),
      userId: user.id,
      isProfileComplete: user.isProfileComplete,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الرمز',
    });
  }
};

export const completeRegistration = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return res;

    const { fullName, lastName, email, password, birthDate, address } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'الاسم الكامل وكلمة المرور مطلوبان',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        lastName,
        email,
        address,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        password: await hashPassword(password),
        isProfileComplete: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'تم إكمال التسجيل بنجاح',
      token: signToken(user.id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إكمال التسجيل',
    });
  }
};

/** اسم بديل — كان مصدَّرًا وغير مربوط بأي مسار */
export const completeProfile = completeRegistration;

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف وكلمة المرور مطلوبان',
      });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    // رسالة واحدة للحالتين حتى لا يكشف الرد أي الأرقام مسجّلة
    const invalid = () =>
      res.status(401).json({
        success: false,
        message: 'رقم الهاتف أو كلمة المرور غير صحيحة',
      });

    if (!user || user.isDeleted) return invalid();
    if (!(await verifyPassword(password, user.password))) return invalid();

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'تم حظر حسابك. يرجى التواصل مع الدعم',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: signToken(user.id),
      isProfileComplete: user.isProfileComplete,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
    });
  }
};

// ---------------------------------------------------------------------------
//  الملف الشخصي
// ---------------------------------------------------------------------------

export const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return res;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { advertisements: true, favorites: true, contactRequests: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الملف الشخصي',
    });
  }
};

/** الحقول التي يملك المستخدم تعديلها في ملفه — بديل تمرير جسم الطلب كاملًا */
const PROFILE_FIELDS = ['fullName', 'lastName', 'email', 'address'] as const;

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return res;

    const data: Record<string, any> = {};
    for (const field of PROFILE_FIELDS) {
      if (req.body?.[field] !== undefined) data[field] = req.body[field];
    }

    if (req.body?.birthDate) data.birthDate = new Date(req.body.birthDate);

    // تغيير كلمة المرور يمر عبر التشفير لا عبر الإسناد المباشر
    if (req.body?.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
        });
      }
      data.password = await hashPassword(req.body.password);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد حقول للتحديث' });
    }

    const user = await prisma.user.update({ where: { id: userId }, data });

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي',
    });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return res;

    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: `/uploads/${file.filename}` },
    });

    return res.status(200).json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: { profileImage: user.profileImage },
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصورة',
    });
  }
};

// ---------------------------------------------------------------------------
//  استعادة كلمة المرور
// ---------------------------------------------------------------------------

export const resetPasswordRequest = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    // ردّ موحّد سواء وُجد الرقم أم لا — كشفُ ذلك يتيح حصر الأرقام المسجّلة
    const genericResponse = {
      success: true,
      message: 'إن كان الرقم مسجلًا فسيصلك رمز التحقق',
    };

    if (!user || user.isDeleted) return res.status(200).json(genericResponse);

    const { code, expiresAt } = await otpService.issueOtp(phoneNumber, true);

    if (otpService.isDemoMode()) {
      console.log(`📤 [DEMO] رمز الاستعادة لـ ${phoneNumber}: ${code}`);
    }

    return res.status(200).json({
      ...genericResponse,
      expiresAt,
      ...(otpService.isDemoMode() ? { demoOtp: code } : {}),
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء طلب استعادة كلمة المرور',
    });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير رقم الهاتف ورمز التحقق',
      });
    }

    const result = await otpService.verifyOtp(phoneNumber, otp, true);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: OTP_ERRORS[result.reason] ?? 'رمز التحقق غير صحيح',
      });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET غير مضبوط');

    // توكن قصير الأمد مخصّص لإعادة التعيين — لا يصلح للوصول لأي مسار آخر
    const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, secret, {
      expiresIn: '15m',
    });

    return res.status(200).json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح',
      resetToken,
    });
  } catch (error) {
    console.error('Error verifying reset code:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الرمز',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين وكلمة المرور الجديدة مطلوبان',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET غير مضبوط');

    let payload: any;
    try {
      payload = jwt.verify(resetToken, secret);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية',
      });
    }

    // التوكن يجب أن يكون مخصّصًا لإعادة التعيين تحديدًا،
    // وإلا صلح أي توكن دخول عادي لتغيير كلمة المرور
    if (payload?.purpose !== 'password_reset' || !payload?.id) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح',
      });
    }

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: await hashPassword(newPassword) },
    });

    return res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور',
    });
  }
};
