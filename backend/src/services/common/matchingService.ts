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

// البحث عن تطابق محتمل بين إعلان جديد والإعلانات الموجودة
export const findPotentialMatches = async (advertisementId: string): Promise<void> => {
  try {
    // الحصول على معلومات الإعلان الجديد
    const advertisement = await Advertisement.findById(advertisementId);
    
    if (!advertisement) {
      console.error(`الإعلان غير موجود: ${advertisementId}`);
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
    
    // البحث عن إعلانات معتمدة من النوع المطلوب بنفس الفئة والمحافظة
    const matchCandidates = await Advertisement.find({
      _id: { $ne: advertisementId },
      type: searchType,
      category: advertisement.category,
      governorate: advertisement.governorate,
      isApproved: true,    // فقط الإعلانات المعتمدة
      isResolved: false    // فقط الإعلانات غير المحلولة
    });
    
    console.log(`تم العثور على ${matchCandidates.length} مرشح محتمل للتطابق مع الإعلان ${advertisementId}`);
    
    // لكل مرشح، قم بحساب درجة التطابق
    for (const candidate of matchCandidates) {
      // تحديد أي من الإعلانين هو مفقود وأيهما موجود
      const lostAdvertisementId = searchType === AdvertisementType.FOUND ? advertisement._id : candidate._id;
      const foundAdvertisementId = searchType === AdvertisementType.FOUND ? candidate._id : advertisement._id;
      
      // حساب درجات التشابه لمختلف الحقول
      const matchingFields = [];
      let totalScore = 0;
      
      // فحص تطابق رقم المستند (إذا كان موجوداً)
      if (advertisement.itemNumber && candidate.itemNumber) {
        const itemNumberSimilarity = advertisement.itemNumber === candidate.itemNumber ? 100 : 0;
        if (itemNumberSimilarity > 0) {
          matchingFields.push('itemNumber');
          totalScore += 60; // رقم المستند مهم جداً - وزن أعلى
        }
      }
      
      // فحص تطابق اسم المالك (إذا كان موجوداً)
      if (advertisement.ownerName && candidate.ownerName) {
        const nameSimilarity = calculateSimilarity(advertisement.ownerName, candidate.ownerName);
        if (nameSimilarity > 70) {
          matchingFields.push('ownerName');
          totalScore += 30; // اسم المالك مهم - وزن متوسط
        }
      }
      
      // فحص تطابق الوصف
      const descriptionSimilarity = calculateSimilarity(advertisement.description, candidate.description);
      if (descriptionSimilarity > 50) {
        matchingFields.push('description');
        totalScore += 10; // الوصف له أهمية أقل - وزن أقل
      }
      
      // إذا كان هناك تطابق كافي، أضف إلى جدول المطابقات
      if (totalScore > 20 || matchingFields.length > 0) {
        // التحقق من عدم وجود مطابقة مسجلة بالفعل
        const existingMatch = await AdvertisementMatch.findOne({
          $or: [
            { lostAdvertisementId: lostAdvertisementId, foundAdvertisementId: foundAdvertisementId },
            { lostAdvertisementId: foundAdvertisementId, foundAdvertisementId: lostAdvertisementId }
          ]
        });
        
        if (existingMatch) {
          console.log(`⚠️ مطابقة موجودة بالفعل بين ${lostAdvertisementId} و ${foundAdvertisementId}`);
        } else {
          console.log(`✨ إنشاء مطابقة جديدة بين ${lostAdvertisementId} و ${foundAdvertisementId}`);
          const newMatch = new AdvertisementMatch({
            lostAdvertisementId,
            foundAdvertisementId,
            matchScore: totalScore,
            matchingFields,
            status: MatchStatus.PENDING
          });
          
          await newMatch.save();
        }
      }
    }
  } catch (error) {
    console.error('خطأ في البحث عن تطابقات محتملة:', error);
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