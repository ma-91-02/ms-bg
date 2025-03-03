import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as rewardService from '../../services/rewardService';

/**
 * الحصول على رصيد نقاط المستخدم
 */
export const getUserPoints = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const points = req.user.points || 0;

    res.status(200).json({
      success: true,
      data: {
        points,
        userId: req.user._id
      }
    });
  } catch (error) {
    console.error('خطأ في جلب رصيد النقاط:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب رصيد النقاط'
    });
  }
};

/**
 * الحصول على سجل نقاط المستخدم
 */
export const getPointsHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await rewardService.getUserPointsHistory(
      req.user._id.toString(),
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('خطأ في جلب سجل النقاط:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب سجل النقاط'
    });
  }
};

/**
 * الحصول على قائمة المكافآت المتاحة
 */
export const getAvailableRewards = async (req: AuthRequest, res: Response) => {
  try {
    const rewards = rewardService.getAvailableRewards();

    res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    console.error('خطأ في جلب المكافآت المتاحة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المكافآت المتاحة'
    });
  }
};

/**
 * استبدال نقاط بمكافأة
 */
export const redeemPoints = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المكافأة مطلوب'
      });
    }

    const result = await rewardService.redeemReward(
      req.user._id.toString(),
      rewardId
    );

    res.status(200).json({
      success: true,
      message: 'تم استبدال النقاط بنجاح',
      data: result
    });
  } catch (error) {
    console.error('خطأ في استبدال النقاط:', error);
    
    // التحقق من نوع الخطأ لإرجاع رسالة مناسبة
    if (error instanceof Error) {
      if (error.message === 'النقاط غير كافية') {
        return res.status(400).json({
          success: false,
          message: 'النقاط غير كافية لاستبدال هذه المكافأة'
        });
      } else if (error.message === 'المكافأة غير موجودة') {
        return res.status(404).json({
          success: false,
          message: 'المكافأة غير موجودة'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء استبدال النقاط'
    });
  }
}; 