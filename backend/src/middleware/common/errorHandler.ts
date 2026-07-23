import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

/**
 * واجهة خطأ مخصصة للتطبيق
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, any>;
}

/** ترجمة أخطاء Prisma المعروفة إلى ردود HTTP مفهومة بدل 500 عامة */
const mapPrismaError = (
  err: unknown
): { statusCode: number; message: string } | null => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // خرق قيد تفرّد
        return { statusCode: 409, message: 'هذا السجل موجود بالفعل' };
      case 'P2003': // خرق مفتاح أجنبي
        return { statusCode: 400, message: 'مرجع غير صالح لسجل غير موجود' };
      case 'P2025': // السجل المطلوب غير موجود
        return { statusCode: 404, message: 'السجل غير موجود' };
      default:
        return null;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: 'بيانات الطلب غير صالحة' };
  }

  return null;
};

/**
 * معالج الأخطاء المركزي للتطبيق
 */
const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const mapped = mapPrismaError(err);

  const statusCode = mapped?.statusCode ?? err.statusCode ?? 500;
  const message = mapped?.message ?? err.message ?? 'حدث خطأ في الخادم';

  console.error(`🔴 خطأ: ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
