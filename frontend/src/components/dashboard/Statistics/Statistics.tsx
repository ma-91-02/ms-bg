import React, { useEffect, useState } from 'react';
import { Box, Card, Grid, Typography } from '@mui/material';
import { getAdminStats, AdminStats } from '../../../services/statsService';
import PeopleIcon from '@mui/icons-material/People';
import DoneIcon from '@mui/icons-material/Done';
import SearchIcon from '@mui/icons-material/Search';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../../../styles/Statistics.css';

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('بدء جلب الإحصائيات في مكون Statistics...');
        setLoading(true);
        const statsData = await getAdminStats();
        console.log('إحصائيات تم استلامها في المكون:', statsData);
        
        // التحقق من البيانات المستلمة - إذا كانت كل القيم 0، فقد يكون هناك مشكلة في الاتصال
        const hasNonZeroValue = Object.values(statsData).some(value => value > 0);
        
        if (!hasNonZeroValue) {
          console.warn('جميع القيم في الإحصائيات هي 0، قد يكون هناك مشكلة في الاتصال بقاعدة البيانات');
        }
        
        setStats(statsData);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        setError('فشل في تحميل الإحصائيات، يرجى التأكد من اتصال الخادم ووجود بيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // طباعة قيم البيانات الحالية للتصحيح
  console.log('قيم الإحصائيات الحالية في الرندر:', stats);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>جاري تحميل الإحصائيات...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography>{error}</Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          يرجى التأكد من تشغيل الخادم الخلفي وصحة اتصال قاعدة البيانات.
        </Typography>
      </Box>
    );
  }

  // التحقق من وجود بيانات غير صفرية
  const hasNonZeroData = stats && Object.values(stats).some(value => value > 0);

  // إذا كانت كل القيم صفر، نعرض رسالة مفيدة
  if (!hasNonZeroData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'warning.main' }}>
        <Typography variant="h5" gutterBottom>
          لا توجد بيانات للعرض
        </Typography>
        <Typography variant="body1">
          لم يتم العثور على بيانات في قاعدة البيانات. قد يكون هذا بسبب:
        </Typography>
        <Box component="ul" sx={{ textAlign: 'left', display: 'inline-block', mt: 2 }}>
          <li>عدم وجود مستخدمين أو إعلانات مسجلة بعد</li>
          <li>مشكلة في الاتصال بقاعدة البيانات</li>
          <li>خطأ في مسارات API</li>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom className="dashboard-title">
        لوحة الإحصائيات
      </Typography>
      
      <Grid container spacing={3}>
        {/* إجمالي المستخدمين */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card total-users">
            <Box className="card-content">
              <PeopleIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.totalUsers || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  المستخدمين
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* إجمالي الإعلانات */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card total-documents">
            <Box className="card-content">
              <SummarizeIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.totalAdvertisements || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  المستندات
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* الإعلانات المعلقة */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card pending-documents">
            <Box className="card-content">
              <SearchIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.pendingAdvertisements || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  مستندات بانتظار المراجعة
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* طلبات التواصل */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card contact-requests">
            <Box className="card-content">
              <LiveHelpIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.totalContacts || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  طلبات التواصل
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* الإعلانات الموافق عليها */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card approved-documents">
            <Box className="card-content">
              <DoneIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.approvedAdvertisements || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  مستندات تمت الموافقة عليها
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* الإعلانات المستردة */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="stats-card resolved-documents">
            <Box className="card-content">
              <CheckCircleIcon className="stats-icon" />
              <Box>
                <Typography variant="h5" className="stats-value">
                  {stats?.resolvedAdvertisements || 0}
                </Typography>
                <Typography variant="body2" className="stats-label">
                  مستندات تم استردادها
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 