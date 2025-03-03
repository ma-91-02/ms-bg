import { Request, Response } from 'express';
import Report from '../../models/mobile/Report';

// الحصول على جميع التقارير المعلقة للمراجعة
export const getPendingReports = async (req: Request, res: Response) => {
  try {
    const pendingReports = await Report.find({ status: 'pending' })
      .populate('user', 'phoneNumber name')
      .sort('-createdAt');
    
    return res.status(200).json({
      success: true,
      results: pendingReports.length,
      data: {
        reports: pendingReports
      }
    });
  } catch (error) {
    console.error('خطأ في جلب التقارير المعلقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقارير المعلقة'
    });
  }
};

// الموافقة على تقرير
export const approveReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: 'approved' },
      { new: true, runValidators: true }
    );
    
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
  } catch (error) {
    console.error('خطأ في الموافقة على التقرير:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الموافقة على التقرير'
    });
  }
};

// رفض تقرير
export const rejectReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: 'rejected' },
      { new: true, runValidators: true }
    );
    
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
  } catch (error) {
    console.error('خطأ في رفض التقرير:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفض التقرير'
    });
  }
}; 