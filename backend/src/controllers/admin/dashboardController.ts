import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import User from '../../models/mobile/User';
import Advertisement from '../../models/mobile/Advertisement';
import AdvertisementMatch from '../../models/mobile/AdvertisementMatch';
import ContactRequest from '../../models/mobile/ContactRequest';

// الحصول على إحصائيات للوحة التحكم
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    // إحصائيات المستخدمين
    const usersCount = await User.countDocuments();
    
    // إحصائيات الإعلانات
    const adsStats = {
      total: await Advertisement.countDocuments(),
      pending: await Advertisement.countDocuments({ isApproved: false }),
      approved: await Advertisement.countDocuments({ isApproved: true, isResolved: false }),
      resolved: await Advertisement.countDocuments({ isResolved: true }),
      lost: await Advertisement.countDocuments({ type: 'lost' }),
      found: await Advertisement.countDocuments({ type: 'found' })
    };
    
    // إحصائيات المطابقات
    const matchesStats = {
      total: await AdvertisementMatch.countDocuments(),
      pending: await AdvertisementMatch.countDocuments({ status: 'pending' }),
      approved: await AdvertisementMatch.countDocuments({ status: 'approved' }),
      rejected: await AdvertisementMatch.countDocuments({ status: 'rejected' })
    };
    
    // إحصائيات طلبات التواصل
    const contactRequestsStats = {
      total: await ContactRequest.countDocuments(),
      pending: await ContactRequest.countDocuments({ status: 'pending' }),
      approved: await ContactRequest.countDocuments({ status: 'approved' }),
      rejected: await ContactRequest.countDocuments({ status: 'rejected' })
    };
    
    // أحدث الإعلانات بانتظار الموافقة
    const latestPendingAds = await Advertisement.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName phoneNumber');
    
    // أحدث المطابقات المحتملة
    const latestMatches = await AdvertisementMatch.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'lostAdvertisementId',
        select: 'category ownerName itemNumber',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate({
        path: 'foundAdvertisementId',
        select: 'category ownerName itemNumber',
        populate: { path: 'userId', select: 'fullName' }
      });

    return res.status(200).json({
      success: true,
      data: {
        usersCount,
        ads: adsStats,
        matches: matchesStats,
        contactRequests: contactRequestsStats,
        latestPendingAds,
        latestMatches
      }
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 