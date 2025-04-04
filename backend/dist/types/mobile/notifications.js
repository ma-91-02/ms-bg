"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
/**
 * أنواع الإشعارات المدعومة في النظام
 */
var NotificationType;
(function (NotificationType) {
    NotificationType["ADVERTISEMENT"] = "advertisement";
    NotificationType["ADMIN_MESSAGE"] = "admin_message";
    NotificationType["CONTACT_REQUEST"] = "contact_request";
    NotificationType["CONTACT_APPROVED"] = "contact_approved";
    NotificationType["CONTACT_REJECTED"] = "contact_rejected";
    NotificationType["SYSTEM"] = "system"; // إشعارات النظام
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.default = NotificationType;
//# sourceMappingURL=notifications.js.map