"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = exports.Advertisement = exports.User = void 0;
// تصدير النماذج للاستخدام في جميع أنحاء التطبيق
const User_1 = __importDefault(require("./mobile/User"));
exports.User = User_1.default;
const Advertisement_1 = __importDefault(require("./mobile/Advertisement"));
exports.Advertisement = Advertisement_1.default;
const Admin_1 = __importDefault(require("./admin/Admin"));
exports.Admin = Admin_1.default;
//# sourceMappingURL=index.js.map