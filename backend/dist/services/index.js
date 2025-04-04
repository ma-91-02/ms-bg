"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = void 0;
// تصدير الخدمات المشتركة
__exportStar(require("./common/loggerService"), exports);
__exportStar(require("./common/tokenService"), exports);
__exportStar(require("./common/fileUploadService"), exports);
__exportStar(require("./common/imageService"), exports);
__exportStar(require("./common/messagingService"), exports);
const whatsappService_1 = __importDefault(require("./common/whatsappService"));
exports.whatsappService = whatsappService_1.default;
// تصدير خدمات الموبايل
__exportStar(require("./mobile/notificationService"), exports);
//# sourceMappingURL=index.js.map