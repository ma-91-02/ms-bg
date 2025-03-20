import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

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
 * قواعد التحقق لمصادقة المسؤول
 */
export const adminAuthValidators = {
  login: [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
    validate
  ] as ValidatorArray
};

export default {
  validate,
  adminAuthValidators
}; 