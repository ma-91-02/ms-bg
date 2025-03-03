import Report from '../models/mobile/Report';
import Match from '../models/mobile/Match';

/**
 * خدمة مطابقة الإبلاغات عن المفقودات والموجودات
 */
export const findMatches = async (reportId: string): Promise<any[]> => {
  try {
    // جلب الإبلاغ المستهدف
    const report = await Report.findById(reportId);
    
    if (!report) {
      throw new Error('الإبلاغ غير موجود');
    }
    
    // تحديد ما إذا كان نبحث عن مفقودات أو موجودات
    const targetType = report.type === 'lost' ? 'found' : 'lost';
    
    // بناء استعلام البحث
    const query: any = {
      type: targetType,
      status: 'approved',
      category: report.category
    };
    
    // إذا كان هناك موقع محدد، ابحث ضمن مسافة معينة
    if (report.location && report.location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: report.location.coordinates
          },
          $maxDistance: 10000 // 10 كيلومتر
        }
      };
    }
    
    // البحث عن إبلاغات محتملة للمطابقة
    const potentialMatches = await Report.find(query);
    
    // حساب درجة المطابقة لكل إبلاغ محتمل
    const matches = potentialMatches.map(match => {
      // هنا يمكن تنفيذ منطق أكثر تعقيدًا لحساب درجة المطابقة
      const score = calculateMatchScore(report, match);
      
      return {
        reportId: match._id,
        score,
        matchDetails: {
          category: match.category,
          date: match.date,
          location: match.location
        }
      };
    });
    
    // ترتيب المطابقات حسب الدرجة
    return matches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('خطأ في العثور على مطابقات:', error);
    throw error;
  }
};

/**
 * حساب درجة المطابقة بين إبلاغين
 * درجة من 0 إلى 100
 */
const calculateMatchScore = (report1: any, report2: any): number => {
  let score = 0;
  
  // مطابقة الفئة (وزن: 30%)
  if (report1.category === report2.category) {
    score += 30;
  }
  
  // مطابقة التاريخ (وزن: 20%)
  const date1 = new Date(report1.date);
  const date2 = new Date(report2.date);
  const daysDifference = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
  
  if (daysDifference <= 1) {
    score += 20;
  } else if (daysDifference <= 3) {
    score += 15;
  } else if (daysDifference <= 7) {
    score += 10;
  } else if (daysDifference <= 14) {
    score += 5;
  }
  
  // مطابقة الموقع (وزن: 30%)
  if (report1.location && report2.location) {
    const distance = calculateDistance(
      report1.location.coordinates[1], 
      report1.location.coordinates[0],
      report2.location.coordinates[1], 
      report2.location.coordinates[0]
    );
    
    if (distance <= 0.5) { // أقل من 500 متر
      score += 30;
    } else if (distance <= 1) { // أقل من 1 كم
      score += 25;
    } else if (distance <= 3) { // أقل من 3 كم
      score += 20;
    } else if (distance <= 5) { // أقل من 5 كم
      score += 10;
    } else if (distance <= 10) { // أقل من 10 كم
      score += 5;
    }
  }
  
  // مطابقة الوصف (وزن: 20%)
  // هنا يمكن استخدام خوارزميات معالجة اللغة الطبيعية للمقارنة
  // للتبسيط، نفترض درجة ثابتة
  score += 10;
  
  return score;
};

/**
 * حساب المسافة بين إحداثيين باستخدام صيغة هافرساين
 * تعيد المسافة بالكيلومتر
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * تسجيل مطابقة محتملة في قاعدة البيانات
 */
export const createMatch = async (lostReportId: string, foundReportId: string, matchPercentage: number): Promise<any> => {
  try {
    const newMatch = await Match.create({
      lostReportId,
      foundReportId,
      matchPercentage,
      status: 'pending'
    });
    
    return newMatch;
  } catch (error) {
    console.error('خطأ في إنشاء سجل المطابقة:', error);
    throw error;
  }
};

export default {
  findMatches,
  createMatch
};