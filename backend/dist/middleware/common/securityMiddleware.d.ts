import { Request, Response, NextFunction, Application } from 'express';
import { Express } from 'express';
export declare const csrfProtection: (req: Request, res: Response, next: NextFunction) => void | Response;
export declare const applySecurityMiddleware: (app: Application) => void;
export declare const setupSecurityMiddleware: (app: Express) => void;
declare const _default: {
    csrfProtection: (req: Request, res: Response, next: NextFunction) => void | Response;
    applySecurityMiddleware: (app: Application) => void;
};
export default _default;
//# sourceMappingURL=securityMiddleware.d.ts.map