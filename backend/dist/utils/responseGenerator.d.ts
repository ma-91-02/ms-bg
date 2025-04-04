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
export declare const successResponse: <T>(res: Response, message?: string, data?: T, statusCode?: number, pagination?: ApiResponse["pagination"]) => Response;
/**
 * مولد استجابة خطأ
 */
export declare const errorResponse: (res: Response, message?: string, errors?: any[], statusCode?: number) => Response;
/**
 * إرجاع استجابة نجاح
 */
export declare const sendSuccess: (res: Response, data?: any, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
/**
 * إرجاع استجابة خطأ
 */
export declare const sendError: (res: Response, message?: string, statusCode?: number, errors?: any) => Response<any, Record<string, any>>;
declare const _default: {
    successResponse: <T>(res: Response, message?: string, data?: T, statusCode?: number, pagination?: ApiResponse["pagination"]) => Response;
    errorResponse: (res: Response, message?: string, errors?: any[], statusCode?: number) => Response;
    sendSuccess: (res: Response, data?: any, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
    sendError: (res: Response, message?: string, statusCode?: number, errors?: any) => Response<any, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=responseGenerator.d.ts.map