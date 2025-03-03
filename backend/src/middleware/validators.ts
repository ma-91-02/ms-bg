import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

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
  ] as ValidatorArray,
  
  adminLogin: [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
    validate
  ] as ValidatorArray
};

/**
 * قواعد التحقق للتقارير
 */
export const reportValidators = {
  createReport: [
    body('title').notEmpty().withMessage('عنوان التقرير مطلوب'),
    body('description').notEmpty().withMessage('وصف التقرير مطلوب'),
    body('type').isIn(['lost', 'found']).withMessage('نوع التقرير يجب أن يكون مفقود أو موجود'),
    body('category').notEmpty().withMessage('فئة التقرير مطلوبة'),
    body('location').notEmpty().withMessage('موقع التقرير مطلوب'),
    body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('خط العرض يجب أن يكون بين -90 و 90'),
    body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('خط الطول يجب أن يكون بين -180 و 180'),
    body('date').isISO8601().withMessage('يجب أن يكون التاريخ بتنسيق ISO8601 (YYYY-MM-DD)'),
    validate
  ] as ValidatorArray,
  
  searchReports: [
    query('type').optional().isIn(['lost', 'found']).withMessage('نوع التقرير يجب أن يكون مفقود أو موجود'),
    query('category').optional(),
    query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون عددًا موجبًا'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('حد العناصر يجب أن يكون بين 1 و 50'),
    validate
  ] as ValidatorArray,
  
  reportId: [
    param('reportId').isMongoId().withMessage('معرف التقرير غير صالح'),
    validate
  ] as ValidatorArray
};

export default {
  validate,
  authValidators,
  reportValidators
}; 