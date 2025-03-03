"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectReport = exports.approveReport = exports.getPendingReports = void 0;
const Report_1 = __importDefault(require("../../models/mobile/Report"));
// الحصول على جميع التقارير المعلقة للمراجعة
const getPendingReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingReports = yield Report_1.default.find({ status: 'pending' })
            .populate('user', 'phoneNumber name')
            .sort('-createdAt');
        return res.status(200).json({
            success: true,
            results: pendingReports.length,
            data: {
                reports: pendingReports
            }
        });
    }
    catch (error) {
        console.error('خطأ في جلب التقارير المعلقة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب التقارير المعلقة'
        });
    }
});
exports.getPendingReports = getPendingReports;
// الموافقة على تقرير
const approveReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        const report = yield Report_1.default.findByIdAndUpdate(reportId, { status: 'approved' }, { new: true, runValidators: true });
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'التقرير غير موجود'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'تمت الموافقة على التقرير بنجاح',
            data: {
                report
            }
        });
    }
    catch (error) {
        console.error('خطأ في الموافقة على التقرير:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الموافقة على التقرير'
        });
    }
});
exports.approveReport = approveReport;
// رفض تقرير
const rejectReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        const report = yield Report_1.default.findByIdAndUpdate(reportId, { status: 'rejected' }, { new: true, runValidators: true });
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'التقرير غير موجود'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'تم رفض التقرير بنجاح',
            data: {
                report
            }
        });
    }
    catch (error) {
        console.error('خطأ في رفض التقرير:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء رفض التقرير'
        });
    }
});
exports.rejectReport = rejectReport;
