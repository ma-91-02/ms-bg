import api from './api';

// واجهات البيانات
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  isProfileComplete?: boolean;
}

export interface MobileUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * إرسال رمز OTP إلى رقم الهاتف
 * في وضع الديمو يتم إرجاع استجابة ناجحة دائمًا
 */
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // وضع الديمو - لا يتصل بالباك إند
    const demoCodes = true; // تعيين إلى false للاتصال بالباك إند الفعلي
    
    if (demoCodes) {
      console.log('تم محاكاة إرسال رمز OTP في وضع الديمو');
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح. استخدم 000000 للتحقق'
      };
    }
    
    // الاتصال الفعلي بالباك إند
    console.log(`إرسال رمز OTP إلى: ${phoneNumber}`);
    const response = await api.post('/api/mobile/auth/send-otp', { phoneNumber });
    
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('خطأ في إرسال رمز OTP:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء إرسال رمز التحقق'
    };
  }
};

/**
 * التحقق من رمز OTP
 * في وضع الديمو يتم التحقق من أن الرمز هو ستة أصفار
 */
export const verifyOTP = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  try {
    // وضع الديمو - التحقق المحلي من الرمز
    const demoCodes = true; // تعيين إلى false للاتصال بالباك إند الفعلي
    
    if (demoCodes) {
      console.log('تم محاكاة التحقق من رمز OTP في وضع الديمو');
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // التحقق من أن الرمز هو ستة أصفار
      if (otp === '000000') {
        return {
          success: true,
          message: 'تم التحقق بنجاح',
          token: 'demo_token_123456789',
          user: {
            id: 'demo_user_id',
            fullName: 'مستخدم ديمو',
            phoneNumber: phoneNumber,
            isVerified: true,
            createdAt: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: 'رمز التحقق غير صحيح'
        };
      }
    }
    
    // الاتصال الفعلي بالباك إند
    console.log(`التحقق من رمز OTP: ${otp} للرقم: ${phoneNumber}`);
    const response = await api.post('/api/mobile/auth/verify-otp', { phoneNumber, otp });
    
    return response.data;
  } catch (error: any) {
    console.error('خطأ في التحقق من رمز OTP:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء التحقق من الرمز'
    };
  }
};

/**
 * إرسال رمز إعادة تعيين كلمة المرور
 * في وضع الديمو يتم إرجاع استجابة ناجحة دائمًا
 */
export const sendPasswordResetOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    // وضع الديمو - لا يتصل بالباك إند
    const demoCodes = true; // تعيين إلى false للاتصال بالباك إند الفعلي
    
    if (demoCodes) {
      console.log('تم محاكاة إرسال رمز إعادة تعيين كلمة المرور في وضع الديمو');
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'تم إرسال رمز إعادة تعيين كلمة المرور بنجاح. استخدم 000000 للتحقق'
      };
    }
    
    // الاتصال الفعلي بالباك إند
    console.log(`إرسال رمز إعادة تعيين كلمة المرور إلى: ${phoneNumber}`);
    const response = await api.post('/api/mobile/auth/send-reset-password', { phoneNumber });
    
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('خطأ في إرسال رمز إعادة تعيين كلمة المرور:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء إرسال رمز إعادة تعيين كلمة المرور'
    };
  }
};

/**
 * التحقق من رمز إعادة تعيين كلمة المرور
 * في وضع الديمو يتم التحقق من أن الرمز هو ستة أصفار
 */
export const verifyPasswordResetOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string; resetToken?: string }> => {
  try {
    // وضع الديمو - التحقق المحلي من الرمز
    const demoCodes = true; // تعيين إلى false للاتصال بالباك إند الفعلي
    
    if (demoCodes) {
      console.log('تم محاكاة التحقق من رمز إعادة تعيين كلمة المرور في وضع الديمو');
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // التحقق من أن الرمز هو ستة أصفار
      if (otp === '000000') {
        return {
          success: true,
          message: 'تم التحقق من الرمز بنجاح',
          resetToken: 'demo_reset_token_123456789'
        };
      } else {
        return {
          success: false,
          message: 'رمز التحقق غير صحيح'
        };
      }
    }
    
    // الاتصال الفعلي بالباك إند
    console.log(`التحقق من رمز إعادة تعيين كلمة المرور: ${otp} للرقم: ${phoneNumber}`);
    const response = await api.post('/api/mobile/auth/verify-reset-code', { phoneNumber, otp });
    
    return {
      success: response.data.success,
      message: response.data.message,
      resetToken: response.data?.data?.resetToken
    };
  } catch (error: any) {
    console.error('خطأ في التحقق من رمز إعادة تعيين كلمة المرور:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء التحقق من الرمز'
    };
  }
};

/**
 * إعادة تعيين كلمة المرور
 * في وضع الديمو يتم إرجاع استجابة ناجحة دائمًا
 */
export const resetPassword = async (resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // وضع الديمو - لا يتصل بالباك إند
    const demoCodes = true; // تعيين إلى false للاتصال بالباك إند الفعلي
    
    if (demoCodes) {
      console.log('تم محاكاة إعادة تعيين كلمة المرور في وضع الديمو');
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'تمت إعادة تعيين كلمة المرور بنجاح'
      };
    }
    
    // الاتصال الفعلي بالباك إند
    console.log(`إعادة تعيين كلمة المرور باستخدام الرمز: ${resetToken}`);
    const response = await api.post('/api/mobile/auth/reset-password', { resetToken, newPassword });
    
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
    };
  }
}; 