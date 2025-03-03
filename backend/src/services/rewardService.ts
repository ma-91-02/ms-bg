import User from '../models/mobile/User';
import RewardTransaction from '../models/mobile/RewardTransaction';

// تعريف أنواع المكافآت
export enum RewardType {
  CONTACT_CONFIRM = 'contact_confirm',
  DOCUMENT_RETURNED = 'document_returned',
  CREATE_DOCUMENT = 'create_document',
  REPORT_INVALID = 'report_invalid',
  MONTHLY_ACTIVE = 'monthly_active'
}

// نقاط كل نوع من المكافآت
const REWARD_POINTS = {
  [RewardType.CONTACT_CONFIRM]: 50,
  [RewardType.DOCUMENT_RETURNED]: 200,
  [RewardType.CREATE_DOCUMENT]: 20,
  [RewardType.REPORT_INVALID]: 10,
  [RewardType.MONTHLY_ACTIVE]: 15
};

// وصف كل نوع من المكافآت
const REWARD_DESCRIPTIONS = {
  [RewardType.CONTACT_CONFIRM]: 'مكافأة تأكيد التواصل',
  [RewardType.DOCUMENT_RETURNED]: 'مكافأة إرجاع مستمسك',
  [RewardType.CREATE_DOCUMENT]: 'مكافأة إنشاء إعلان جديد',
  [RewardType.REPORT_INVALID]: 'مكافأة الإبلاغ عن محتوى غير مناسب',
  [RewardType.MONTHLY_ACTIVE]: 'مكافأة المستخدم النشط شهريًا'
};

/**
 * إضافة نقاط لمستخدم
 * @param userId معرف المستخدم
 * @param type نوع المكافأة
 * @param referenceId المعرف المرجعي (اختياري)
 * @returns النقاط المضافة
 */
export const addPointsToUser = async (userId: string, type: RewardType, referenceId?: string): Promise<number> => {
  try {
    // التحقق من أن نوع المكافأة صالح
    if (!Object.values(RewardType).includes(type)) {
      throw new Error('نوع المكافأة غير صالح');
    }
    
    const points = REWARD_POINTS[type];
    const description = REWARD_DESCRIPTIONS[type];
    
    // إضافة النقاط للمستخدم
    await User.findByIdAndUpdate(
      userId,
      { $inc: { points } }
    );
    
    // تسجيل المعاملة
    await RewardTransaction.create({
      userId,
      points,
      type,
      description,
      referenceId
    });
    
    return points;
  } catch (error) {
    console.error('خطأ في إضافة النقاط:', error);
    throw error;
  }
};

/**
 * الحصول على سجل نقاط المستخدم
 * @param userId معرف المستخدم
 * @returns سجل النقاط
 */
export const getUserPointsHistory = async (userId: string) => {
  try {
    const pointsHistory = await RewardTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const user = await User.findById(userId).select('points');
    
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    
    return {
      currentPoints: user.points,
      history: pointsHistory
    };
  } catch (error) {
    console.error('خطأ في جلب سجل النقاط:', error);
    throw error;
  }
};

/**
 * استبدال النقاط بمكافأة
 * @param userId معرف المستخدم
 * @param rewardId معرف المكافأة
 * @returns تفاصيل الاستبدال
 */
export const redeemReward = async (userId: string, rewardId: string) => {
  try {
    // جلب بيانات المستخدم
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }
    
    // جلب المكافأة من قائمة المكافآت المتاحة
    const availableRewards = getAvailableRewards();
    const reward = availableRewards.find(r => r.id === rewardId);
    
    if (!reward) {
      throw new Error('المكافأة غير موجودة');
    }
    
    // التحقق من أن المستخدم لديه نقاط كافية
    if (user.points < reward.points) {
      throw new Error('النقاط غير كافية');
    }
    
    // خصم النقاط من حساب المستخدم
    await User.findByIdAndUpdate(
      userId,
      { $inc: { points: -reward.points } }
    );
    
    // تسجيل معاملة استبدال النقاط
    await RewardTransaction.create({
      userId,
      points: -reward.points,
      type: 'redeem_reward',
      description: `استبدال نقاط بمكافأة: ${reward.name}`,
      referenceId: rewardId
    });
    
    return {
      rewardId,
      rewardName: reward.name,
      pointsSpent: reward.points,
      redeemDate: new Date()
    };
  } catch (error) {
    console.error('خطأ في استبدال النقاط:', error);
    throw error;
  }
};

// جلب قائمة المكافآت المتاحة
export const getAvailableRewards = () => {
  return [
    { id: 'voucher_5', name: 'قسيمة بقيمة 5 دولار', points: 500, type: 'voucher' },
    { id: 'voucher_10', name: 'قسيمة بقيمة 10 دولار', points: 900, type: 'voucher' },
    { id: 'credit_5', name: 'رصيد هاتف بقيمة 5 دولار', points: 450, type: 'credit' },
    { id: 'credit_10', name: 'رصيد هاتف بقيمة 10 دولار', points: 850, type: 'credit' },
    { id: 'featured_ad', name: 'إظهار إعلان في الصفحة الرئيسية ليوم', points: 200, type: 'premium' },
    { id: 'golden_helper', name: 'ترقية حساب إلى "مساعد ذهبي"', points: 1000, type: 'premium' }
  ];
};

export default {
  addPointsToUser,
  getUserPointsHistory,
  redeemReward,
  getAvailableRewards,
  RewardType
}; 