export declare const createUploadMiddleware: (options: {
    folder: string;
    fieldName: string;
    maxSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
}) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadAdvertisementImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare const _default: {
    createUploadMiddleware: (options: {
        folder: string;
        fieldName: string;
        maxSize?: number;
        maxFiles?: number;
        allowedTypes?: string[];
    }) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadProfileImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadAdvertisementImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=fileUpload.d.ts.map