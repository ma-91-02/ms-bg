import { Request, Response } from 'express';
import AdvertisementMatch, { MatchStatus } from '../../models/mobile/AdvertisementMatch';
import Advertisement from '../../models/mobile/Advertisement';
import { AuthRequest } from '../../types/express';
import User from '../../models/mobile/User';
import { findPotentialMatches } from '../../services/common/matchingService';

// الحصول على قائمة المطابقات المعلقة
export const getPendingMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    console.log('🔍 جاري تحديث وعرض المطابقات المحتملة...');
    
    // 1. حذف جميع المطابقات المعلقة (بدلاً من محاولة تنظيفها)
    console.log('🗑️ حذف جميع المطابقات المعلقة السابقة...');
    const deleteResult = await AdvertisementMatch.deleteMany({ status: MatchStatus.PENDING });
    console.log(`تم حذف ${deleteResult.deletedCount} مطابقة معلقة سابقة`);
    
    // 2. إنشاء مطابقات جديدة من الإعلانات المعتمدة فقط
    console.log('🔄 إنشاء مطابقات جديدة من الإعلانات المعتمدة...');
    
    // جلب جميع الإعلانات المعتمدة وغير المحلولة
    const advertisements = await Advertisement.find({ 
      isApproved: true,
      isResolved: false 
    });
    
    console.log(`📊 العثور على ${advertisements.length} إعلان معتمد للمطابقة`);
    
    // إنشاء مصفوفة تخزن جميع عمليات المطابقة المحتملة
    const potentialMatches = [];
    
    // البحث عن جميع الإعلانات المفقودة
    const lostAds = advertisements.filter(ad => ad.type === 'lost');
    // البحث عن جميع الإعلانات الموجودة
    const foundAds = advertisements.filter(ad => ad.type === 'found');
    
    console.log(`📋 تم العثور على ${lostAds.length} إعلان مفقودات و ${foundAds.length} إعلان موجودات`);
    
    // المقارنة اليدوية بين الإعلانات (بدون تكرار)
    for (const lostAd of lostAds) {
      for (const foundAd of foundAds) {
        // التأكد من أن الفئة والمحافظة متطابقة
        if (lostAd.category === foundAd.category && lostAd.governorate === foundAd.governorate) {
          // حساب درجات التشابه لمختلف الحقول
          const matchingFields = [];
          let totalScore = 0;
          
          // فحص تطابق رقم المستند (إذا كان موجوداً)
          if (lostAd.itemNumber && foundAd.itemNumber && lostAd.itemNumber === foundAd.itemNumber) {
            matchingFields.push('itemNumber');
            totalScore += 60; // رقم المستند مهم جداً - وزن أعلى
          }
          
          // فحص تطابق اسم المالك (إذا كان موجوداً)
          if (lostAd.ownerName && foundAd.ownerName) {
            const nameSimilarity = calculateSimilarity(lostAd.ownerName, foundAd.ownerName);
            if (nameSimilarity > 70) {
              matchingFields.push('ownerName');
              totalScore += 30; // اسم المالك مهم - وزن متوسط
            }
          }
          
          // فحص تطابق الوصف
          const descriptionSimilarity = calculateSimilarity(lostAd.description, foundAd.description);
          if (descriptionSimilarity > 50) {
            matchingFields.push('description');
            totalScore += 10; // الوصف له أهمية أقل - وزن أقل
          }
          
          // إذا كان هناك تطابق كافي، أضف إلى المطابقات المحتملة
          if (totalScore > 20 || matchingFields.length > 0) {
            potentialMatches.push({
              lostAdvertisementId: lostAd._id,
              foundAdvertisementId: foundAd._id,
              matchScore: totalScore,
              matchingFields,
              status: MatchStatus.PENDING,
              notificationSent: false
            });
          }
        }
      }
    }
    
    // حفظ جميع المطابقات المحتملة دفعة واحدة
    if (potentialMatches.length > 0) {
      await AdvertisementMatch.insertMany(potentialMatches);
    }
    
    console.log(`✅ تم إنشاء ${potentialMatches.length} مطابقة محتملة`);
    
    // 3. عرض المطابقات المعلقة
    const { page = 1, limit = 10 } = req.query;
    
    // بناء فلتر للمطابقات المعلقة
    const filter = { status: MatchStatus.PENDING };
    
    // الحصول على إجمالي عدد المطابقات
    const total = await AdvertisementMatch.countDocuments(filter);
    
    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب المطابقات
    const matches = await AdvertisementMatch.find(filter)
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
  } catch (error: any) {
    console.error('❌ خطأ في تحديث وعرض المطابقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// إضافة دالة تشابه النصوص (إذا لم تكن موجودة في هذا الملف)
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // تنظيف وتحويل النصوص لأحرف صغيرة
  const a = str1.toLowerCase().replace(/\s+/g, ' ').trim();
  const b = str2.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // حساب تطابق أساسي
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 80;
  
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
export const getAllMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    // بناء الفلتر
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    // الحصول على إجمالي عدد المطابقات
    const total = await AdvertisementMatch.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب المطابقات
    const matches = await AdvertisementMatch.find(filter)
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
  } catch (error: any) {
    console.error('خطأ في الحصول على المطابقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الموافقة على مطابقة
export const approveMatch = async (req: AuthRequest, res: Response) => {
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
    const match = await AdvertisementMatch.findById(id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'المطابقة غير موجودة'
      });
    }

    // التحقق من حالة المطابقة
    if (match.status !== MatchStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `هذه المطابقة تم معالجتها مسبقًا وحالتها الحالية: ${match.status}`
      });
    }

    // تحديث حالة المطابقة
    match.status = MatchStatus.APPROVED;
    match.approvedBy = req.admin._id;
    match.approvedAt = new Date();
    
    if (notes) {
      match.notes = notes;
    }
    
    await match.save();

    // إرسال إشعار للشخص الذي فقد العنصر
    try {
      const lostAdvertisement = await Advertisement.findById(match.lostAdvertisementId);
      
      if (lostAdvertisement) {
        // في الواقع، هنا سيتم إرسال إشعار للمستخدم
        // سواء برسالة في التطبيق أو إشعار بالبريد الإلكتروني أو رسالة نصية
        console.log(`✉️ إرسال إشعار للمستخدم ${lostAdvertisement.userId} بخصوص العثور على العنصر المفقود`);
        
        // تحديث حالة الإشعار
        match.notificationSent = true;
        match.notificationSentAt = new Date();
        await match.save();
      }
    } catch (notificationError) {
      console.error('خطأ في إرسال الإشعار:', notificationError);
    }

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على المطابقة بنجاح',
      data: match
    });
  } catch (error: any) {
    console.error('خطأ في الموافقة على المطابقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// رفض مطابقة
export const rejectMatch = async (req: AuthRequest, res: Response) => {
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
    const match = await AdvertisementMatch.findById(id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'المطابقة غير موجودة'
      });
    }

    // التحقق من حالة المطابقة
    if (match.status !== MatchStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'هذه المطابقة تم معالجتها مسبقًا'
      });
    }

    // تحديث حالة المطابقة
    match.status = MatchStatus.REJECTED;
    
    if (notes) {
      match.notes = notes;
    }
    
    await match.save();

    return res.status(200).json({
      success: true,
      message: 'تم رفض المطابقة بنجاح',
      data: match
    });
  } catch (error: any) {
    console.error('خطأ في رفض المطابقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// مسار لتشغيل المطابقة يدوياً على كل الإعلانات
export const runMatchingForAll = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    // جلب جميع الإعلانات النشطة
    const advertisements = await Advertisement.find({ isResolved: false });
    console.log(`جاري البحث عن تطابقات لـ ${advertisements.length} إعلان`);

    // تشغيل المطابقة لكل إعلان
    const matchingPromises = advertisements.map(ad => 
      findPotentialMatches(ad._id.toString())
    );
    
    await Promise.all(matchingPromises);

    // جلب نتائج المطابقة
    const matches = await AdvertisementMatch.find({ status: MatchStatus.PENDING })
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
  } catch (error: any) {
    console.error('خطأ في تشغيل المطابقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// مسار لتشغيل المطابقة يدوياً على إعلان محدد
export const runMatchingForOne = async (req: AuthRequest, res: Response) => {
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
    await findPotentialMatches(advertisementId);
    
    // جلب نتائج المطابقة
    const matches = await AdvertisementMatch.find({
      $or: [
        { lostAdvertisementId: advertisementId },
        { foundAdvertisementId: advertisementId }
      ]
    })
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
      message: `تم العثور على ${matches.length} مطابقة محتملة للإعلان`,
      count: matches.length,
      data: matches
    });
  } catch (error: any) {
    console.error('خطأ في تشغيل المطابقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// إضافة وظيفة لتنظيف المطابقات المكررة
export const cleanupDuplicateMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    // جلب جميع المطابقات
    const allMatches = await AdvertisementMatch.find({});
    
    // تتبع المطابقات الفريدة
    const uniqueMatchPairs = new Set();
    const duplicateIds = [];
    
    // تحديد المطابقات المكررة
    for (const match of allMatches) {
      const matchPair = `${match.lostAdvertisementId}-${match.foundAdvertisementId}`;
      
      if (uniqueMatchPairs.has(matchPair)) {
        // مطابقة مكررة
        duplicateIds.push(match._id);
      } else {
        // مطابقة فريدة
        uniqueMatchPairs.add(matchPair);
      }
    }
    
    // حذف المطابقات المكررة
    const deleteResult = await AdvertisementMatch.deleteMany({
      _id: { $in: duplicateIds }
    });
    
    return res.status(200).json({
      success: true,
      message: `تم حذف ${deleteResult.deletedCount} مطابقة مكررة`,
      uniqueMatchesCount: uniqueMatchPairs.size,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error: any) {
    console.error('خطأ في تنظيف المطابقات المكررة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على سجل المطابقات السابقة
export const getMatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    // بناء فلتر البحث
    const filter: any = {};
    
    // فلترة حسب الحالة
    if (status && ['approved', 'rejected'].includes(status as string)) {
      filter.status = status;
    } else {
      // بدون فلتر، نعرض المطابقات المعتمدة والمرفوضة (لكن ليس المعلقة)
      filter.status = { $in: ['approved', 'rejected'] };
    }

    // الحصول على إجمالي عدد المطابقات
    const total = await AdvertisementMatch.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب المطابقات
    const matches = await AdvertisementMatch.find(filter)
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
  } catch (error: any) {
    console.error('خطأ في الحصول على سجل المطابقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 