import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * واجهة خطأ مخصصة للتطبيق
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, any>;
}

/**
 * معالج الأخطاء المركزي للتطبيق
 */
const errorHandler = (
  err: AppError, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
): Response => {
  // سجل الخطأ للتصحيح
  console.error('❌ خطأ:', err);

  // الأخطاء المخصصة المعروفة
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'فشل المصادقة: توكن غير صالح'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'فشل المصادقة: انتهت صلاحية التوكن'
    });
  }

  // أخطاء قاعدة البيانات - التكرار
  if (err.code === 11000) {
    // نتعامل بأمان مع keyValue التي قد تكون غير موجودة
    const dupError = err as any;
    const field = dupError.keyValue ? Object.keys(dupError.keyValue)[0] : 'حقل';
    const value = dupError.keyValue ? dupError.keyValue[field] : '';
    
    return res.status(409).json({
      success: false,
      message: `القيمة ${value} موجودة بالفعل في ${field}`
    });
  }

  // خطأ Multer لحجم الملف
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت'
    });
  }

  // الخطأ الافتراضي
  const statusCode = err.statusCode || 500;
  const message = err.message || 'خطأ في الخادم';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
