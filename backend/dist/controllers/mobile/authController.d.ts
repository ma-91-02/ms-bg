import { Request, Response } from 'express';
export declare const sendOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const completeProfile: (req: Request, res: Response) => Promise<Response>;
/**
 * استكمال التسجيل بعد التحقق من OTP
 */
export declare const completeRegistration: (req: Request, res: Response) => Promise<Response>;
/**
 * تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور
 */
export declare const login: (req: Request, res: Response) => Promise<Response>;
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response>;
export declare const uploadProfileImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * طلب إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/reset-password-request
 */
export declare const resetPasswordRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * التحقق من رمز إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/verify-reset-code
 */
export declare const verifyResetCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * إعادة تعيين كلمة المرور
 * المسار: POST /api/mobile/auth/reset-password
 */
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map