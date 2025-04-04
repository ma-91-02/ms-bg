/**
 * خدمة التسجيل المركزية للتطبيق
 * تقوم بتسجيل الأحداث المختلفة بتنسيق موحد وإمكانية إضافة مستويات مختلفة للتسجيل
 */

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class LoggerService {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: this.isDevelopment && data ? data : undefined
    };
  }

  private output(logObject: LogMessage): void {
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

  info(message: string, data?: any): void {
    this.output(this.formatLog(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: any): void {
    this.output(this.formatLog(LogLevel.WARN, message, data));
  }

  error(message: string, error?: any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.output(this.formatLog(LogLevel.ERROR, message, errorData));
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      this.output(this.formatLog(LogLevel.DEBUG, message, data));
    }
  }
}

// تصدير نسخة واحدة من الخدمة للاستخدام في جميع أنحاء التطبيق
export const logger = new LoggerService(); 