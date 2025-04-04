"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.errorResponse = exports.successResponse = void 0;
/**
 * مولد استجابة نجاح
 */
const successResponse = (res, message = 'تمت العملية بنجاح', data, statusCode = 200, pagination) => {
    const response = {
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
exports.successResponse = successResponse;
/**
 * مولد استجابة خطأ
 */
const errorResponse = (res, message = 'حدث خطأ', errors, statusCode = 400) => {
    const response = {
        success: false,
        message
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
/**
 * إرجاع استجابة نجاح
 */
const sendSuccess = (res, data = null, message = 'تمت العملية بنجاح', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
/**
 * إرجاع استجابة خطأ
 */
const sendError = (res, message = 'حدث خطأ', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
exports.default = {
    successResponse: exports.successResponse,
    errorResponse: exports.errorResponse,
    sendSuccess: exports.sendSuccess,
    sendError: exports.sendError
};
//# sourceMappingURL=responseGenerator.js.map