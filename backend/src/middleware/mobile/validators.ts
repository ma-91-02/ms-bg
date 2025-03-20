import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

/**
 * تنفيذ التحقق من النتائج
 */
export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: errors.array()
    });
  }
  next();
};

// حل مشكلة التوافق بتبسيط الأنواع
type ValidatorArray = any[];

/**
 * قواعد التحقق للمصادقة
 */
export const authValidators = {
  sendOtp: [
    body('phoneNumber')
      .notEmpty().withMessage('رقم الهاتف مطلوب')
      .matches(/^\+[1-9]\d{1,14}$/).withMessage('يجب أن يكون رقم الهاتف بتنسيق دولي صالح (+964xxxxxxxx)'),
    validate
  ] as ValidatorArray,
  
  verifyOtp: [
    body('phoneNumber')
      .notEmpty().withMessage('رقم الهاتف مطلوب')
      .matches(/^\+[1-9]\d{1,14}$/).withMessage('يجب أن يكون رقم الهاتف بتنسيق دولي صالح'),
    body('otp')
      .notEmpty().withMessage('رمز التحقق مطلوب')
      .isLength({ min: 6, max: 6 }).withMessage('يجب أن يكون رمز التحقق 6 أرقام'),
    validate
  ] as ValidatorArray
};

/**
 * قواعد التحقق للإعلانات
 */
export const advertisementValidators = {
  createAdvertisement: [
    body('title').notEmpty().withMessage('عنوان الإعلان مطلوب'),
    body('description').notEmpty().withMessage('وصف الإعلان مطلوب'),
    body('type').isIn(['lost', 'found']).withMessage('نوع الإعلان يجب أن يكون مفقود أو موجود'),
    body('category').notEmpty().withMessage('فئة الإعلان مطلوبة'),
    body('location').optional(),
    body('contactInfo').optional(),
    validate
  ] as ValidatorArray,
  
  updateAdvertisement: [
    body('title').optional(),
    body('description').optional(),
    body('category').optional(),
    body('location').optional(),
    body('contactInfo').optional(),
    validate
  ] as ValidatorArray
};

export default {
  validate,
  authValidators,
  advertisementValidators
}; 