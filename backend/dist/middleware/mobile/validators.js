"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advertisementValidators = exports.authValidators = exports.validate = void 0;
const express_validator_1 = require("express-validator");
/**
 * تنفيذ التحقق من النتائج
 */
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'خطأ في البيانات المدخلة',
            errors: errors.array()
        });
    }
    next();
};
exports.validate = validate;
/**
 * قواعد التحقق للمصادقة
 */
exports.authValidators = {
    sendOtp: [
        (0, express_validator_1.body)('phoneNumber')
            .notEmpty().withMessage('رقم الهاتف مطلوب')
            .matches(/^\+[1-9]\d{1,14}$/).withMessage('يجب أن يكون رقم الهاتف بتنسيق دولي صالح (+964xxxxxxxx)'),
        exports.validate
    ],
    verifyOtp: [
        (0, express_validator_1.body)('phoneNumber')
            .notEmpty().withMessage('رقم الهاتف مطلوب')
            .matches(/^\+[1-9]\d{1,14}$/).withMessage('يجب أن يكون رقم الهاتف بتنسيق دولي صالح'),
        (0, express_validator_1.body)('otp')
            .notEmpty().withMessage('رمز التحقق مطلوب')
            .isLength({ min: 6, max: 6 }).withMessage('يجب أن يكون رمز التحقق 6 أرقام'),
        exports.validate
    ]
};
/**
 * قواعد التحقق للإعلانات
 */
exports.advertisementValidators = {
    createAdvertisement: [
        (0, express_validator_1.body)('title').notEmpty().withMessage('عنوان الإعلان مطلوب'),
        (0, express_validator_1.body)('description').notEmpty().withMessage('وصف الإعلان مطلوب'),
        (0, express_validator_1.body)('type').isIn(['lost', 'found']).withMessage('نوع الإعلان يجب أن يكون مفقود أو موجود'),
        (0, express_validator_1.body)('category').notEmpty().withMessage('فئة الإعلان مطلوبة'),
        (0, express_validator_1.body)('location').optional(),
        (0, express_validator_1.body)('contactInfo').optional(),
        exports.validate
    ],
    updateAdvertisement: [
        (0, express_validator_1.body)('title').optional(),
        (0, express_validator_1.body)('description').optional(),
        (0, express_validator_1.body)('category').optional(),
        (0, express_validator_1.body)('location').optional(),
        (0, express_validator_1.body)('contactInfo').optional(),
        exports.validate
    ]
};
exports.default = {
    validate: exports.validate,
    authValidators: exports.authValidators,
    advertisementValidators: exports.advertisementValidators
};
//# sourceMappingURL=validators.js.map