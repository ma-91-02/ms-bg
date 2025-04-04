import Advertisement, { AdvertisementType, ItemCategory } from '../../models/mobile/Advertisement';
import AdvertisementMatch, { MatchStatus } from '../../models/mobile/AdvertisementMatch';

// وظيفة لتحديد نسبة التشابه بين نصين
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // تنظيف وتحويل النصوص لأحرف صغيرة
  const a = str1.toLowerCase().replace(/\s+/g, ' ').trim();
  const b = str2.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // حساب تطابق أساسي (يمكن تحسينه لاحقاً)
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

// وظيفة لمطابقة رقم المستند بشكل مرن
const compareItemNumbers = (num1: string, num2: string): boolean => {
  if (!num1 || !num2) return false;
  
  // إزالة المسافات وتنظيف الأرقام
  const cleanNum1 = num1.replace(/\s+/g, '').trim();
  const cleanNum2 = num2.replace(/\s+/g, '').trim();
  
  // تحقق من التطابق التام
  if (cleanNum1 === cleanNum2) return true;
  
  // تحقق من التطابق الجزئي (إذا كان أحد الأرقام جزءًا من الآخر)
  if (cleanNum1.includes(cleanNum2) || cleanNum2.includes(cleanNum1)) return true;
  
  return false;
};

// وظيفة لمطابقة الأسماء
const compareNames = (name1: string, name2: string): { isMatch: boolean, score: number } => {
  if (!name1 || !name2) return { isMatch: false, score: 0 };
  
  // تنظيف الأسماء
  const cleanName1 = name1.toLowerCase().replace(/\s+/g, ' ').trim();
  const cleanName2 = name2.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // تحقق من التطابق التام
  if (cleanName1 === cleanName2) return { isMatch: true, score: 100 };
  
  // تحقق من الاحتواء
  if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) {
    return { isMatch: true, score: 80 };
  }
  
  // تقسيم الاسماء إلى كلمات
  const words1 = cleanName1.split(' ');
  const words2 = cleanName2.split(' ');
  
  // عدد الكلمات المشتركة
  let matchingWords = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // تجاهل الكلمات القصيرة جدًا
    
    for (const word2 of words2) {
      if (word2.length < 3) continue;
      
      if (word1 === word2) {
        matchingWords++;
        break;
      }
    }
  }
  
  // إذا وجدت على الأقل كلمة مشتركة هامة
  if (matchingWords > 0) {
    const matchRatio = (matchingWords * 2) / (words1.length + words2.length);
    const score = Math.round(matchRatio * 100);
    return { isMatch: score > 30, score };
  }
  
  return { isMatch: false, score: 0 };
};

// البحث عن تطابق محتمل بين إعلان جديد والإعلانات الموجودة
export const findPotentialMatches = async (advertisementId: string): Promise<void> => {
  try {
    console.log(`🔍 بدء البحث عن تطابقات للإعلان: ${advertisementId}`);
    
    // الحصول على معلومات الإعلان الجديد
    const advertisement = await Advertisement.findById(advertisementId);
    
    if (!advertisement) {
      console.error(`❌ الإعلان غير موجود: ${advertisementId}`);
      return;
    }
    
    // تأكد من أن الإعلان معتمد
    if (!advertisement.isApproved) {
      console.log(`⚠️ تخطي الإعلان غير المعتمد: ${advertisementId}`);
      return;
    }
    
    // تحديد نوع البحث (إذا كان مفقود، نبحث في الموجودات والعكس)
    const searchType = advertisement.type === AdvertisementType.LOST 
      ? AdvertisementType.FOUND 
      : AdvertisementType.LOST;
    
    console.log(`📋 البحث عن إعلانات من نوع ${searchType} متوافقة مع ${advertisement.type} (${advertisement.category})`);
    
    // 1. البحث عن إعلانات من نفس الفئة بغض النظر عن المحافظة
    const matchCandidates = await Advertisement.find({
      _id: { $ne: advertisementId },
      type: searchType,
      category: advertisement.category,
      isApproved: true,    // فقط الإعلانات المعتمدة
      isResolved: false    // فقط الإعلانات غير المحلولة
    });
    
    console.log(`✅ تم العثور على ${matchCandidates.length} مرشح محتمل للتطابق مع الإعلان ${advertisementId}`);
    
    // تخزين المطابقات الجديدة
    const newMatches: Array<{
      lostAdvertisementId: string;
      foundAdvertisementId: string;
      matchScore: number;
      matchingFields: string[];
      status: MatchStatus;
      notificationSent: boolean;
    }> = [];
    
    // لكل مرشح، قم بحساب درجة التطابق
    for (const candidate of matchCandidates) {
      // تحديد أي من الإعلانين هو مفقود وأيهما موجود
      const lostAdvertisementId = searchType === AdvertisementType.FOUND 
        ? advertisement._id?.toString() || String(advertisement._id)
        : candidate._id?.toString() || String(candidate._id);
      
      const foundAdvertisementId = searchType === AdvertisementType.FOUND 
        ? candidate._id?.toString() || String(candidate._id)
        : advertisement._id?.toString() || String(advertisement._id);
      
      // التحقق من عدم وجود مطابقة مسجلة بالفعل
      const existingMatch = await AdvertisementMatch.findOne({
        $or: [
          { lostAdvertisementId, foundAdvertisementId },
          { lostAdvertisementId: foundAdvertisementId, foundAdvertisementId: lostAdvertisementId }
        ]
      });
      
      if (existingMatch) {
        console.log(`⚠️ تجاهل مطابقة موجودة بالفعل بين ${lostAdvertisementId} و ${foundAdvertisementId}`);
        continue;
      }
      
      // حساب درجات التشابه لمختلف الحقول
      const matchingFields: string[] = [];
      let totalScore = 0;
      
      // 1. فحص تطابق المحافظة (نعطي وزن منخفض)
      if (advertisement.governorate === candidate.governorate) {
        matchingFields.push('governorate');
        totalScore += 10; // وزن منخفض للمحافظة
      }
      
      // 2. فحص تطابق رقم المستند (إذا كان موجوداً) - هذا مهم جداً
      if (advertisement.itemNumber && candidate.itemNumber) {
        if (compareItemNumbers(advertisement.itemNumber, candidate.itemNumber)) {
          matchingFields.push('itemNumber');
          totalScore += 60; // رقم المستند مهم جداً - وزن أعلى
        }
      }
      
      // 3. فحص تطابق اسم المالك (إذا كان موجوداً) - مهم أيضاً
      if (advertisement.ownerName && candidate.ownerName) {
        const nameComparisonResult = compareNames(advertisement.ownerName, candidate.ownerName);
        if (nameComparisonResult.isMatch) {
          if (nameComparisonResult.score >= 80) {
            matchingFields.push('ownerName');
            totalScore += 30; // تطابق عالي في الاسم - وزن كامل
          } else {
            matchingFields.push('ownerName_partial');
            totalScore += Math.round(30 * (nameComparisonResult.score / 100)); // وزن جزئي حسب درجة التطابق
          }
        }
      }
      
      // 4. فحص تطابق الوصف
      if (advertisement.description && candidate.description) {
        const descriptionSimilarity = calculateSimilarity(advertisement.description, candidate.description);
        if (descriptionSimilarity > 50) {
          matchingFields.push('description');
          totalScore += 10; // الوصف له أهمية أقل - وزن أقل
        } else if (descriptionSimilarity > 30) {
          matchingFields.push('description_partial');
          totalScore += 5; // تطابق جزئي في الوصف
        }
      }
      
      // قواعد خاصة: إذا كان هناك تطابق في رقم المستند أو الاسم، نعتبرها مطابقة مهمة
      const hasStrongMatch = matchingFields.includes('itemNumber') || matchingFields.includes('ownerName');
      
      // إذا كان هناك تطابق كافي أو تطابق قوي، أضف إلى جدول المطابقات
      if (totalScore >= 15 || hasStrongMatch) {
        console.log(`⭐ مطابقة جديدة بين ${lostAdvertisementId} و ${foundAdvertisementId} (${totalScore}%)`);
        console.log(`📝 حقول التطابق: ${matchingFields.join(', ')}`);
        
        // إضافة إلى مصفوفة المطابقات الجديدة
        newMatches.push({
          lostAdvertisementId,
          foundAdvertisementId,
          matchScore: totalScore,
          matchingFields,
          status: MatchStatus.PENDING,
          notificationSent: false
        });
      }
    }
    
    // حفظ جميع المطابقات الجديدة دفعة واحدة
    if (newMatches.length > 0) {
      await AdvertisementMatch.insertMany(newMatches);
      console.log(`✨ تم حفظ ${newMatches.length} مطابقة جديدة في قاعدة البيانات`);
    } else {
      console.log(`😞 لم يتم العثور على مطابقات جديدة للإعلان ${advertisementId}`);
    }
  } catch (error) {
    console.error('❌ خطأ في البحث عن تطابقات محتملة:', error);
  }
};

// استدعاء وظيفة البحث عن تطابقات بعد إنشاء أو تحديث إعلان
export const checkForMatches = async (advertisementId: string): Promise<void> => {
  setTimeout(() => {
    findPotentialMatches(advertisementId).catch(err => {
      console.error('خطأ في جدولة البحث عن تطابقات:', err);
    });
  }, 1000); // تأخير بسيط لضمان حفظ الإعلان في قاعدة البيانات
}; 