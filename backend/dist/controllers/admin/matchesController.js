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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateMatches = exports.getMatchHistory = exports.cleanupDuplicateMatches = exports.runMatchingForOne = exports.runMatchingForAll = exports.rejectMatch = exports.approveMatch = exports.getAllMatches = exports.getPendingMatches = void 0;
const Advertisement_1 = __importDefault(require("../../models/mobile/Advertisement"));
const AdvertisementMatch_1 = __importStar(require("../../models/mobile/AdvertisementMatch"));
const matchingService_1 = require("../../services/common/matchingService");
// الحصول على قائمة المطابقات المعلقة
const getPendingMatches = async (req, res) => {
    var _a, _b;
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        console.log('🔍 جاري تحديث وعرض المطابقات المحتملة...');
        // 1. قبل حذف المطابقات المعلقة، نحفظ المطابقات المعتمدة والمرفوضة
        console.log('🔄 التحقق من المطابقات الحالية...');
        // نحتفظ فقط بالمطابقات المعتمدة والمرفوضة
        const existingApprovedRejectedMatches = await AdvertisementMatch_1.default.find({
            status: { $in: [AdvertisementMatch_1.MatchStatus.APPROVED, AdvertisementMatch_1.MatchStatus.REJECTED] }
        });
        console.log(`ℹ️ تم العثور على ${existingApprovedRejectedMatches.length} مطابقة معتمدة/مرفوضة`);
        // 2. حذف المطابقات المعلقة فقط
        console.log('🗑️ حذف المطابقات المعلقة السابقة...');
        const deleteResult = await AdvertisementMatch_1.default.deleteMany({ status: AdvertisementMatch_1.MatchStatus.PENDING });
        console.log(`تم حذف ${deleteResult.deletedCount} مطابقة معلقة سابقة`);
        // 3. إنشاء مطابقات جديدة من الإعلانات المعتمدة فقط
        console.log('🔄 إنشاء مطابقات جديدة من الإعلانات المعتمدة...');
        // جلب جميع الإعلانات المعتمدة وغير المحلولة
        const advertisements = await Advertisement_1.default.find({
            isApproved: true,
            isResolved: false
        });
        console.log(`📊 العثور على ${advertisements.length} إعلان معتمد للمطابقة`);
        // إنشاء مصفوفة تخزن جميع عمليات المطابقة المحتملة
        const potentialMatches = [];
        // إنشاء مجموعة للتحقق من وجود مطابقات مسبقة
        const existingMatchesSet = new Set();
        // إضافة المطابقات الحالية إلى المجموعة لتجنب التكرار
        existingApprovedRejectedMatches.forEach(match => {
            const key1 = `${match.lostAdvertisementId.toString()}-${match.foundAdvertisementId.toString()}`;
            const key2 = `${match.foundAdvertisementId.toString()}-${match.lostAdvertisementId.toString()}`;
            existingMatchesSet.add(key1);
            existingMatchesSet.add(key2);
        });
        // البحث عن جميع الإعلانات المفقودة
        const lostAds = advertisements.filter(ad => ad.type === 'lost');
        console.log(`💼 العثور على ${lostAds.length} إعلان مفقود`);
        // البحث عن جميع الإعلانات الموجودة
        const foundAds = advertisements.filter(ad => ad.type === 'found');
        console.log(`🔍 العثور على ${foundAds.length} إعلان موجود`);
        // مقارنة المفقودات مع الموجودات
        for (const lostAd of lostAds) {
            for (const foundAd of foundAds) {
                // التحقق من وجود هذه المطابقة مسبقاً (في المطابقات المعتمدة/المرفوضة)
                const lostAdId = ((_a = lostAd._id) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                const foundAdId = ((_b = foundAd._id) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                const matchKey1 = `${lostAdId}-${foundAdId}`;
                const matchKey2 = `${foundAdId}-${lostAdId}`;
                if (existingMatchesSet.has(matchKey1) || existingMatchesSet.has(matchKey2)) {
                    console.log(`⚠️ تجاهل مطابقة موجودة مسبقاً: ${matchKey1}`);
                    continue;
                }
                // التحقق من تطابق الفئة (إذا كانت متوفرة)
                if (lostAd.category && foundAd.category && lostAd.category !== foundAd.category) {
                    continue;
                }
                // حساب درجات التشابه لمختلف الحقول
                const matchingFields = [];
                let totalScore = 0;
                // 1. فحص تطابق المحافظة
                if (lostAd.governorate && foundAd.governorate && lostAd.governorate === foundAd.governorate) {
                    matchingFields.push('governorate');
                    totalScore += 10;
                }
                // 2. فحص تطابق رقم المستند
                if (lostAd.itemNumber && foundAd.itemNumber) {
                    // تنظيف الأرقام للمقارنة
                    const cleanLostNumber = lostAd.itemNumber.replace(/\s/g, '');
                    const cleanFoundNumber = foundAd.itemNumber.replace(/\s/g, '');
                    if (cleanLostNumber === cleanFoundNumber) {
                        matchingFields.push('itemNumber');
                        totalScore += 60;
                    }
                    else if (cleanLostNumber.includes(cleanFoundNumber) || cleanFoundNumber.includes(cleanLostNumber)) {
                        matchingFields.push('itemNumber_partial');
                        totalScore += 40;
                    }
                }
                // 3. فحص تطابق الاسم
                if (lostAd.ownerName && foundAd.ownerName) {
                    const nameSimilarity = calculateSimilarity(lostAd.ownerName, foundAd.ownerName);
                    if (nameSimilarity >= 70) {
                        matchingFields.push('ownerName');
                        totalScore += 30;
                    }
                    else if (nameSimilarity >= 40) {
                        matchingFields.push('ownerName_partial');
                        totalScore += 20;
                    }
                }
                // 4. فحص تطابق الوصف
                if (lostAd.description && foundAd.description) {
                    const descriptionSimilarity = calculateSimilarity(lostAd.description, foundAd.description);
                    if (descriptionSimilarity >= 60) {
                        matchingFields.push('description');
                        totalScore += 10;
                    }
                }
                // إذا كان هناك تطابق كافي، أضف إلى المطابقات المحتملة
                if (totalScore > 20 || matchingFields.length > 0) {
                    // إضافة مفتاح هذه المطابقة إلى المجموعة لمنع إضافتها مرة أخرى
                    existingMatchesSet.add(matchKey1);
                    existingMatchesSet.add(matchKey2);
                    console.log(`⭐ مطابقة جديدة محتملة: المفقود ${lostAdId} مع الموجود ${foundAdId} (${totalScore}%)`);
                    potentialMatches.push({
                        lostAdvertisementId: lostAdId,
                        foundAdvertisementId: foundAdId,
                        matchScore: totalScore,
                        matchingFields,
                        status: AdvertisementMatch_1.MatchStatus.PENDING,
                        notificationSent: false
                    });
                }
            }
        }
        // حفظ جميع المطابقات المحتملة دفعة واحدة
        if (potentialMatches.length > 0) {
            await AdvertisementMatch_1.default.insertMany(potentialMatches);
        }
        console.log(`✅ تم إنشاء ${potentialMatches.length} مطابقة محتملة جديدة`);
        // تنظيف المطابقات المكررة (للتأكد)
        const dupeCheck = await cleanupDuplicateMatchesInternal();
        console.log(`🧹 تم حذف ${dupeCheck.deletedCount} مطابقة مكررة أثناء التنظيف النهائي`);
        // 3. عرض المطابقات المعلقة
        const { page = 1, limit = 10 } = req.query;
        // بناء فلتر للمطابقات المعلقة
        const filter = { status: AdvertisementMatch_1.MatchStatus.PENDING };
        // الحصول على إجمالي عدد المطابقات
        const total = await AdvertisementMatch_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب المطابقات
        const matches = await AdvertisementMatch_1.default.find(filter)
            .sort({ matchScore: -1, createdAt: -1 }) // ترتيب حسب درجة التطابق والأحدث
            .skip(skip)
            .limit(Number(limit))
            .populate({
            path: 'lostAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        });
        console.log(`🔍 تم العثور على ${matches.length} مطابقة معلقة`);
        return res.status(200).json({
            success: true,
            message: `تم إنشاء ${potentialMatches.length} مطابقة محتملة جديدة`,
            count: matches.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: matches
        });
    }
    catch (error) {
        console.error('❌ خطأ في تحديث وعرض المطابقات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getPendingMatches = getPendingMatches;
// دالة داخلية لتنظيف المطابقات المكررة
const cleanupDuplicateMatchesInternal = async () => {
    // جلب جميع المطابقات
    const allMatches = await AdvertisementMatch_1.default.find({});
    // تتبع المطابقات الفريدة
    const uniqueMatchPairs = new Set();
    const duplicateIds = [];
    // تحديد المطابقات المكررة
    for (const match of allMatches) {
        // تخزين معرف المطابقة بترتيب ثابت
        const lostId = match.lostAdvertisementId.toString();
        const foundId = match.foundAdvertisementId.toString();
        // إنشاء معرف فريد باستخدام المعرفين، بغض النظر عن ترتيبهما
        const matchPair = [lostId, foundId].sort().join('--');
        if (uniqueMatchPairs.has(matchPair)) {
            // حفظ معرف المطابقة المكررة
            duplicateIds.push(match._id.toString());
        }
        else {
            // تسجيل هذه المطابقة كمطابقة فريدة
            uniqueMatchPairs.add(matchPair);
        }
    }
    // حذف المطابقات المكررة
    const deleteResult = await AdvertisementMatch_1.default.deleteMany({
        _id: { $in: duplicateIds }
    });
    return {
        uniqueMatchesCount: uniqueMatchPairs.size,
        deletedCount: deleteResult.deletedCount,
        deleteResult
    };
};
// إضافة دالة تشابه النصوص (إذا لم تكن موجودة في هذا الملف)
const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2)
        return 0;
    // تنظيف وتحويل النصوص لأحرف صغيرة
    const a = str1.toLowerCase().replace(/\s+/g, ' ').trim();
    const b = str2.toLowerCase().replace(/\s+/g, ' ').trim();
    // حساب تطابق أساسي
    if (a === b)
        return 100;
    if (a.includes(b) || b.includes(a))
        return 80;
    // حساب عدد الكلمات المشتركة
    const wordsA = a.split(' ');
    const wordsB = b.split(' ');
    let matchCount = 0;
    for (const word of wordsA) {
        if (word.length > 2 && wordsB.includes(word)) {
            matchCount++;
        }
    }
    const similarity = (matchCount * 2) / (wordsA.length + wordsB.length) * 100;
    return Math.round(similarity);
};
// الحصول على جميع المطابقات
const getAllMatches = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { status, page = 1, limit = 10 } = req.query;
        // بناء الفلتر
        const filter = {};
        if (status) {
            filter.status = status;
        }
        // الحصول على إجمالي عدد المطابقات
        const total = await AdvertisementMatch_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب المطابقات
        const matches = await AdvertisementMatch_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate({
            path: 'lostAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        });
        return res.status(200).json({
            success: true,
            count: matches.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: matches
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على المطابقات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getAllMatches = getAllMatches;
// الموافقة على مطابقة
const approveMatch = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { notes } = req.body;
        // البحث عن المطابقة
        const match = await AdvertisementMatch_1.default.findById(id);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'المطابقة غير موجودة'
            });
        }
        // التحقق من حالة المطابقة
        if (match.status !== AdvertisementMatch_1.MatchStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: `هذه المطابقة تم معالجتها مسبقًا وحالتها الحالية: ${match.status}`
            });
        }
        // تحديث حالة المطابقة
        match.status = AdvertisementMatch_1.MatchStatus.APPROVED;
        match.approvedBy = req.admin._id;
        match.approvedAt = new Date();
        if (notes) {
            match.notes = notes;
        }
        await match.save();
        // إرسال إشعار للشخص الذي فقد العنصر
        try {
            const lostAdvertisement = await Advertisement_1.default.findById(match.lostAdvertisementId);
            if (lostAdvertisement) {
                // في الواقع، هنا سيتم إرسال إشعار للمستخدم
                // سواء برسالة في التطبيق أو إشعار بالبريد الإلكتروني أو رسالة نصية
                console.log(`✉️ إرسال إشعار للمستخدم ${lostAdvertisement.userId} بخصوص العثور على العنصر المفقود`);
                // تحديث حالة الإشعار
                match.notificationSent = true;
                match.notificationSentAt = new Date();
                await match.save();
            }
        }
        catch (notificationError) {
            console.error('خطأ في إرسال الإشعار:', notificationError);
        }
        return res.status(200).json({
            success: true,
            message: 'تمت الموافقة على المطابقة بنجاح',
            data: match
        });
    }
    catch (error) {
        console.error('خطأ في الموافقة على المطابقة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.approveMatch = approveMatch;
// رفض مطابقة
const rejectMatch = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { id } = req.params;
        const { notes } = req.body;
        // البحث عن المطابقة
        const match = await AdvertisementMatch_1.default.findById(id);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'المطابقة غير موجودة'
            });
        }
        // التحقق من حالة المطابقة
        if (match.status !== AdvertisementMatch_1.MatchStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'هذه المطابقة تم معالجتها مسبقًا'
            });
        }
        // تحديث حالة المطابقة
        match.status = AdvertisementMatch_1.MatchStatus.REJECTED;
        if (notes) {
            match.notes = notes;
        }
        await match.save();
        return res.status(200).json({
            success: true,
            message: 'تم رفض المطابقة بنجاح',
            data: match
        });
    }
    catch (error) {
        console.error('خطأ في رفض المطابقة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.rejectMatch = rejectMatch;
// مسار لتشغيل المطابقة يدوياً على كل الإعلانات
const runMatchingForAll = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        // جلب جميع الإعلانات النشطة
        const advertisements = await Advertisement_1.default.find({ isResolved: false });
        console.log(`جاري البحث عن تطابقات لـ ${advertisements.length} إعلان`);
        // تشغيل المطابقة لكل إعلان
        const matchingPromises = advertisements.map(ad => (0, matchingService_1.findPotentialMatches)(ad._id.toString()));
        await Promise.all(matchingPromises);
        // جلب نتائج المطابقة
        const matches = await AdvertisementMatch_1.default.find({ status: AdvertisementMatch_1.MatchStatus.PENDING })
            .populate({
            path: 'lostAdvertisementId',
            select: 'category governorate ownerName itemNumber description'
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category governorate ownerName itemNumber description'
        });
        return res.status(200).json({
            success: true,
            message: `تم العثور على ${matches.length} مطابقة محتملة`,
            count: matches.length,
            data: matches
        });
    }
    catch (error) {
        console.error('خطأ في تشغيل المطابقة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.runMatchingForAll = runMatchingForAll;
// مسار لتشغيل المطابقة يدوياً على إعلان محدد
const runMatchingForOne = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { advertisementId } = req.params;
        console.log(`جاري البحث عن تطابقات للإعلان: ${advertisementId}`);
        // تشغيل المطابقة
        await (0, matchingService_1.findPotentialMatches)(advertisementId)
            .then(matches => {
            return res.status(200).json({
                success: true,
                message: `تم العثور على ${matches.length} مطابقة محتملة للإعلان`,
                count: matches.length,
                data: matches
            });
        })
            .catch(err => {
            console.error('خطأ في تشغيل المطابقة:', err);
            return res.status(500).json({
                success: false,
                message: 'حدث خطأ في الخادم',
                error: err.message
            });
        });
    }
    catch (error) {
        console.error('خطأ في تشغيل المطابقة لإعلان واحد:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.runMatchingForOne = runMatchingForOne;
// إضافة وظيفة لتنظيف المطابقات المكررة
const cleanupDuplicateMatches = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        // جلب جميع المطابقات
        const allMatches = await AdvertisementMatch_1.default.find({});
        // تتبع المطابقات الفريدة
        const uniqueMatchPairs = new Set();
        const duplicateIds = [];
        // تحديد المطابقات المكررة
        for (const match of allMatches) {
            const matchPair = `${match.lostAdvertisementId}-${match.foundAdvertisementId}`;
            if (uniqueMatchPairs.has(matchPair)) {
                // مطابقة مكررة
                duplicateIds.push(match._id.toString());
            }
            else {
                // مطابقة فريدة
                uniqueMatchPairs.add(matchPair);
            }
        }
        // حذف المطابقات المكررة
        const deleteResult = await AdvertisementMatch_1.default.deleteMany({
            _id: { $in: duplicateIds }
        });
        return res.status(200).json({
            success: true,
            message: `تم حذف ${deleteResult.deletedCount} مطابقة مكررة`,
            uniqueMatchesCount: uniqueMatchPairs.size,
            deletedCount: deleteResult.deletedCount
        });
    }
    catch (error) {
        console.error('خطأ في تنظيف المطابقات المكررة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.cleanupDuplicateMatches = cleanupDuplicateMatches;
// الحصول على سجل المطابقات السابقة
const getMatchHistory = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { status, page = 1, limit = 10 } = req.query;
        // بناء فلتر البحث
        const filter = {};
        // فلترة حسب الحالة
        if (status && ['approved', 'rejected'].includes(status)) {
            filter.status = status;
        }
        else {
            // بدون فلتر، نعرض المطابقات المعتمدة والمرفوضة (لكن ليس المعلقة)
            filter.status = { $in: ['approved', 'rejected'] };
        }
        // الحصول على إجمالي عدد المطابقات
        const total = await AdvertisementMatch_1.default.countDocuments(filter);
        // حساب التخطي والحد
        const skip = (Number(page) - 1) * Number(limit);
        // جلب المطابقات
        const matches = await AdvertisementMatch_1.default.find(filter)
            .sort({ updatedAt: -1 }) // ترتيب حسب تاريخ التحديث (تاريخ الموافقة/الرفض)
            .skip(skip)
            .limit(Number(limit))
            .populate({
            path: 'lostAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        })
            .populate({
            path: 'foundAdvertisementId',
            select: 'category governorate ownerName itemNumber description images userId',
            populate: { path: 'userId', select: 'fullName phoneNumber' }
        })
            .populate('approvedBy', 'username');
        return res.status(200).json({
            success: true,
            count: matches.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: matches
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على سجل المطابقات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم',
            error: error.message
        });
    }
};
exports.getMatchHistory = getMatchHistory;
// إضافة مجموعة من المطابقات المحتملة دفعة واحدة
const bulkCreateMatches = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
            });
        }
        const { matches } = req.body;
        if (!matches || !Array.isArray(matches) || matches.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم توفير مطابقات صالحة'
            });
        }
        console.log(`🔍 إضافة ${matches.length} مطابقة محتملة جديدة...`);
        // التحقق من المطابقات المكررة
        const uniqueMatches = [];
        const uniqueKeys = new Set();
        // معالجة كل مطابقة وإضافتها إلى المصفوفة النهائية
        for (const match of matches) {
            const { lostAdvertisementId, foundAdvertisementId, matchScore, matchingFields } = match;
            // التحقق من توفر المعرفات الضرورية
            if (!lostAdvertisementId || !foundAdvertisementId) {
                console.warn('تم تخطي مطابقة غير صالحة - معرفات مفقودة');
                continue;
            }
            // إنشاء مفتاح فريد للتحقق من التكرار
            const pairKey = `${lostAdvertisementId}:${foundAdvertisementId}`;
            const reversePairKey = `${foundAdvertisementId}:${lostAdvertisementId}`;
            if (uniqueKeys.has(pairKey) || uniqueKeys.has(reversePairKey)) {
                console.log(`تم تخطي مطابقة مكررة: ${pairKey}`);
                continue;
            }
            // إضافة المطابقة الفريدة إلى المصفوفة
            uniqueMatches.push({
                lostAdvertisementId,
                foundAdvertisementId,
                matchScore: matchScore || 0,
                matchingFields: matchingFields || [],
                status: AdvertisementMatch_1.MatchStatus.PENDING,
                notificationSent: false
            });
        }
        // التحقق من وجود مطابقات فريدة
        if (uniqueMatches.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'لا توجد مطابقات فريدة للإضافة',
                addedCount: 0
            });
        }
        // التحقق أولاً من المطابقات الموجودة بالفعل في قاعدة البيانات
        const existingMatches = await Promise.all(uniqueMatches.map(match => AdvertisementMatch_1.default.findOne({
            $or: [
                {
                    lostAdvertisementId: match.lostAdvertisementId,
                    foundAdvertisementId: match.foundAdvertisementId
                },
                {
                    lostAdvertisementId: match.foundAdvertisementId,
                    foundAdvertisementId: match.lostAdvertisementId
                }
            ]
        })));
        // تصفية المطابقات التي لا توجد بالفعل في قاعدة البيانات
        const newMatches = uniqueMatches.filter((_, index) => !existingMatches[index]);
        if (newMatches.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'جميع المطابقات موجودة بالفعل في قاعدة البيانات',
                addedCount: 0
            });
        }
        // إضافة المطابقات الجديدة إلى قاعدة البيانات
        console.log(`✨ إضافة ${newMatches.length} مطابقة جديدة إلى قاعدة البيانات...`);
        const result = await AdvertisementMatch_1.default.insertMany(newMatches);
        return res.status(201).json({
            success: true,
            message: `تمت إضافة ${result.length} مطابقة جديدة بنجاح`,
            addedCount: result.length,
            totalSubmitted: matches.length
        });
    }
    catch (error) {
        console.error('❌ خطأ في إضافة المطابقات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم أثناء إضافة المطابقات',
            error: error.message
        });
    }
};
exports.bulkCreateMatches = bulkCreateMatches;
//# sourceMappingURL=matchesController.js.map