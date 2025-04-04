import multer from 'multer';
/**
 * إنشاء خدمة رفع الملفات حسب نوع الملف والمجلد
 * @param folder المجلد المستهدف
 * @param fileTypes أنواع الملفات المسموح بها
 * @param maxFileSize الحد الأقصى لحجم الملف (بالبايت)
 * @returns وسيط رفع الملفات
 */
export declare const createUploadMiddleware: (folder?: string, fileTypes?: string[], maxFileSize?: number) => multer.Multer;
export declare const uploadAdvertisementImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const upload: multer.Multer;
export declare const uploadImages: (files: Express.Multer.File[]) => Promise<string[]>;
declare const _default: {
    createUploadMiddleware: (folder?: string, fileTypes?: string[], maxFileSize?: number) => multer.Multer;
    uploadAdvertisementImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    upload: multer.Multer;
    uploadImages: (files: Express.Multer.File[]) => Promise<string[]>;
};
export default _default;
//# sourceMappingURL=fileUploadService.d.ts.map