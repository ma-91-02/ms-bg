"use strict";
/**
 * خدمة التسجيل المركزية للتطبيق
 * تقوم بتسجيل الأحداث المختلفة بتنسيق موحد وإمكانية إضافة مستويات مختلفة للتسجيل
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class LoggerService {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    formatLog(level, message, data) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            data: this.isDevelopment && data ? data : undefined
        };
    }
    output(logObject) {
        // يمكن تعديل هذه الدالة لإرسال السجلات إلى خدمة خارجية مثل Sentry أو Loggly في الإنتاج
        const logString = JSON.stringify(logObject);
        switch (logObject.level) {
            case LogLevel.ERROR:
                console.error(logString);
                break;
            case LogLevel.WARN:
                console.warn(logString);
                break;
            case LogLevel.DEBUG:
                if (this.isDevelopment) {
                    console.debug(logString);
                }
                break;
            default:
                console.log(logString);
        }
    }
    info(message, data) {
        this.output(this.formatLog(LogLevel.INFO, message, data));
    }
    warn(message, data) {
        this.output(this.formatLog(LogLevel.WARN, message, data));
    }
    error(message, error) {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;
        this.output(this.formatLog(LogLevel.ERROR, message, errorData));
    }
    debug(message, data) {
        if (this.isDevelopment) {
            this.output(this.formatLog(LogLevel.DEBUG, message, data));
        }
    }
}
// تصدير نسخة واحدة من الخدمة للاستخدام في جميع أنحاء التطبيق
exports.logger = new LoggerService();
//# sourceMappingURL=loggerService.js.map