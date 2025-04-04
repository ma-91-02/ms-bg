import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * واجهة خطأ مخصصة للتطبيق
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, any>;
}

/**
 * معالج الأخطاء المركزي للتطبيق
 */
const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ في الخادم';
  
  console.error(`🔴 خطأ: ${err.stack}`);
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler; 