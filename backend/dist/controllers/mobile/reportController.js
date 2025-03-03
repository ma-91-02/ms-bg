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
exports.uploadReportImages = exports.searchReports = exports.getUserReports = exports.createReport = void 0;
const Report_1 = __importDefault(require("../../models/mobile/Report"));
// إنشاء إبلاغ جديد
const createReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, title, description, category, location, date, documentType, documentId, contactInfo } = req.body;
        // التحقق من وجود معلومات المستخدم
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به - يرجى تسجيل الدخول'
            });
        }
        // إنشاء إبلاغ جديد مع حالة 'pending' (قيد الانتظار)
        const newReport = yield Report_1.default.create({
            type,
            title,
            description,
            category,
            location,
            date,
            documentType,
            documentId,
            user: req.user.id,
            status: 'pending',
            contactInfo,
            images: []
        });
        return res.status(201).json({
            success: true,
            message: 'تم إنشاء الإبلاغ بنجاح وهو قيد المراجعة',
            data: {
                report: newReport
            }
        });
    }
    catch (error) {
        console.error('خطأ في إنشاء الإبلاغ:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء الإبلاغ'
        });
    }
});
exports.createReport = createReport;
// الحصول على إبلاغات المستخدم
const getUserReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // التحقق من وجود معلومات المستخدم
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به - يرجى تسجيل الدخول'
            });
        }
        // البحث عن الإبلاغات الخاصة بالمستخدم
        const reports = yield Report_1.default.find({ user: req.user.id });
        return res.status(200).json({
            success: true,
            results: reports.length,
            data: {
                reports
            }
        });
    }
    catch (error) {
        console.error('خطأ في جلب إبلاغات المستخدم:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإبلاغات'
        });
    }
});
exports.getUserReports = getUserReports;
// البحث عن إبلاغات
const searchReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, category, status = 'approved', location, documentType, query } = req.query;
        // بناء استعلام البحث
        const searchQuery = { status };
        if (type)
            searchQuery.type = type;
        if (category)
            searchQuery.category = category;
        if (documentType)
            searchQuery.documentType = documentType;
        // إذا تم توفير موقع (إحداثيات)
        if (location) {
            try {
                const [lng, lat] = location.split(',').map(coord => parseFloat(coord.trim()));
                const maxDistance = 5000; // 5 كيلومترات
                searchQuery.location = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        $maxDistance: maxDistance
                    }
                };
            }
            catch (e) {
                console.error('خطأ في تحليل الإحداثيات:', e);
            }
        }
        // البحث عن النص في العنوان أو الوصف
        if (query) {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        // تنفيذ البحث
        const reports = yield Report_1.default.find(searchQuery)
            .select('-user') // استبعاد معلومات المستخدم
            .sort('-createdAt');
        return res.status(200).json({
            success: true,
            results: reports.length,
            data: {
                reports
            }
        });
    }
    catch (error) {
        console.error('خطأ في البحث عن تقارير:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء البحث عن التقارير'
        });
    }
});
exports.searchReports = searchReports;
// رفع صور للإبلاغ
const uploadReportImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        // التحقق من وجود معلومات المستخدم
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به - يرجى تسجيل الدخول'
            });
        }
        // التحقق من وجود الملفات
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء تحديد صورة واحدة على الأقل'
            });
        }
        // التحقق من أن التقرير ينتمي للمستخدم الحالي
        const report = yield Report_1.default.findOne({
            _id: reportId,
            user: req.user.id
        });
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'التقرير غير موجود أو غير مصرح بالوصول إليه'
            });
        }
        // تحويل الملفات إلى مصفوفة (حتى لو كان ملفاً واحداً)
        const files = Array.isArray(req.files) ? req.files : [req.files];
        // استخراج مسارات الملفات
        const imagePaths = files.map(file => `/uploads/${file.filename}`);
        // تحديث التقرير بمسارات الصور
        report.images = [...(report.images || []), ...imagePaths];
        yield report.save();
        return res.status(200).json({
            success: true,
            message: 'تم رفع الصور بنجاح',
            data: {
                images: report.images
            }
        });
    }
    catch (error) {
        console.error('خطأ في رفع الصور:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء رفع الصور'
        });
    }
});
exports.uploadReportImages = uploadReportImages;
