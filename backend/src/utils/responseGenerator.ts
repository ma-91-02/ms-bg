import { Response } from 'express';

/**
 * واجهة الاستجابة القياسية
 */
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: {
    total: number;
    limit: number;
    page: number;
    pages: number;
  };
}

/**
 * مولد استجابة نجاح
 */
export const successResponse = <T>(
  res: Response,
  message: string = 'تمت العملية بنجاح',
  data?: T,
  statusCode: number = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * مولد استجابة خطأ
 */
export const errorResponse = (
  res: Response,
  message: string = 'حدث خطأ',
  errors?: any[],
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * إرجاع استجابة نجاح
 */
export const sendSuccess = (
  res: Response, 
  data: any = null, 
  message: string = 'تمت العملية بنجاح',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * إرجاع استجابة خطأ
 */
export const sendError = (
  res: Response, 
  message: string = 'حدث خطأ', 
  statusCode: number = 500, 
  errors: any = null
) => {
  const response: any = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

export default {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError
}; 