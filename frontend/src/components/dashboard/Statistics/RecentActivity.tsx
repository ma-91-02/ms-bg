import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { getRecentActivity } from '../../../services/statsService';
import '../../../styles/Statistics.css';

interface ActivityItem {
  id: string;
  type: 'document_added' | 'document_approved' | 'document_rejected' | 'document_resolved' | 'user_registered' | 'contact_request';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  documentId?: string;
  documentType?: string;
}

interface RecentActivityProps {
  title?: string;
  maxItems?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ title = 'النشاط الأخير في النظام', maxItems = 6 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        const data = await getRecentActivity(maxItems);
        setActivities(data);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب بيانات النشاط الأخير:', error);
        setError('فشل في تحميل بيانات النشاط');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [maxItems]);

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      
      // للأنشطة الحديثة جداً (خلال اليوم)، نعرض الساعات
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        // تحويل للعربية
        const timeStr = date.toLocaleTimeString('ar-EG', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return `اليوم ${timeStr}`;
      } else if (diffDays === 1) {
        return 'الأمس';
      } else {
        return date.toLocaleDateString('ar-EG', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const getActivityTypeColor = (type: string): string => {
    switch (type) {
      case 'document_added':
        return 'info';
      case 'document_approved':
        return 'success';
      case 'document_rejected':
        return 'error';
      case 'document_resolved':
        return 'primary';
      case 'user_registered':
        return 'secondary';
      case 'contact_request':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActivityTypeLabel = (type: string): string => {
    switch (type) {
      case 'document_added':
        return 'مستند جديد';
      case 'document_approved':
        return 'موافقة على مستند';
      case 'document_rejected':
        return 'رفض مستند';
      case 'document_resolved':
        return 'استرداد مستند';
      case 'user_registered':
        return 'مستخدم جديد';
      case 'contact_request':
        return 'طلب تواصل';
      default:
        return 'نشاط';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>جاري تحميل البيانات...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Card className="recent-activity-card">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" className="card-title mb-3">
          {title}
        </Typography>
        
        {activities.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            لا توجد أنشطة حديثة لعرضها
          </Typography>
        ) : (
          <List className="activity-list">
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" className="activity-item">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" className="activity-message">
                          {activity.message}
                        </Typography>
                        <Typography variant="caption" className="activity-time" color="text.secondary">
                          {formatDate(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={getActivityTypeLabel(activity.type)} 
                          size="small" 
                          color={getActivityTypeColor(activity.type) as any}
                          variant="outlined"
                        />
                        {activity.userName && (
                          <Typography variant="caption" color="primary" component="span">
                            {activity.userName}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
};

export default RecentActivity; 