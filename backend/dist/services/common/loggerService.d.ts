/**
 * خدمة التسجيل المركزية للتطبيق
 * تقوم بتسجيل الأحداث المختلفة بتنسيق موحد وإمكانية إضافة مستويات مختلفة للتسجيل
 */
declare class LoggerService {
    private isDevelopment;
    constructor();
    private formatLog;
    private output;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, data?: any): void;
}
export declare const logger: LoggerService;
export {};
//# sourceMappingURL=loggerService.d.ts.map