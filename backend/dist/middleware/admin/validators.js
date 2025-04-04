"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthValidators = exports.validate = void 0;
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
 * قواعد التحقق لمصادقة المسؤول
 */
exports.adminAuthValidators = {
    login: [
        (0, express_validator_1.body)('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
        exports.validate
    ]
};
exports.default = {
    validate: exports.validate,
    adminAuthValidators: exports.adminAuthValidators
};
//# sourceMappingURL=validators.js.map