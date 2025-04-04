import { Request, Response, NextFunction } from 'express';
/**
 * تنفيذ التحقق من النتائج
 */
export declare const validate: (req: Request, res: Response, next: NextFunction) => Response | void;
type ValidatorArray = any[];
/**
 * قواعد التحقق لمصادقة المسؤول
 */
export declare const adminAuthValidators: {
    login: ValidatorArray;
};
declare const _default: {
    validate: (req: Request, res: Response, next: NextFunction) => Response | void;
    adminAuthValidators: {
        login: ValidatorArray;
    };
};
export default _default;
//# sourceMappingURL=validators.d.ts.map