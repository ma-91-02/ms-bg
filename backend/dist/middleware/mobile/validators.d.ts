import { Request, Response, NextFunction } from 'express';
/**
 * تنفيذ التحقق من النتائج
 */
export declare const validate: (req: Request, res: Response, next: NextFunction) => Response | void;
type ValidatorArray = any[];
/**
 * قواعد التحقق للمصادقة
 */
export declare const authValidators: {
    sendOtp: ValidatorArray;
    verifyOtp: ValidatorArray;
};
/**
 * قواعد التحقق للإعلانات
 */
export declare const advertisementValidators: {
    createAdvertisement: ValidatorArray;
    updateAdvertisement: ValidatorArray;
};
declare const _default: {
    validate: (req: Request, res: Response, next: NextFunction) => Response | void;
    authValidators: {
        sendOtp: ValidatorArray;
        verifyOtp: ValidatorArray;
    };
    advertisementValidators: {
        createAdvertisement: ValidatorArray;
        updateAdvertisement: ValidatorArray;
    };
};
export default _default;
//# sourceMappingURL=validators.d.ts.map