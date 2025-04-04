import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { getTopActiveUsers } from '../../../services/userService';
import '../../../styles/Statistics.css';

interface TopUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  activityCount: number;
  lastActive?: string;
}

interface TopUsersListProps {
  title?: string;
  maxUsers?: number;
}

const TopUsersList: React.FC<TopUsersListProps> = ({ title = 'المستخدمين الأكثر نشاطاً', maxUsers = 5 }) => {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        // استدعاء الخدمة للحصول على أكثر المستخدمين نشاطاً
        const data = await getTopActiveUsers(maxUsers);
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدمين الأكثر نشاطاً:', error);
        setError('فشل في تحميل بيانات المستخدمين');
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, [maxUsers]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'غير متوفر';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'تاريخ غير صالح';
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
    <Card className="top-users-card">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" className="card-title mb-3">
          {title}
        </Typography>
        
        {users.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            لا توجد بيانات متاحة للمستخدمين النشطين
          </Typography>
        ) : (
          <List>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    {user.profileImage ? (
                      <Avatar src={user.profileImage} alt={user.name} />
                    ) : (
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" className="user-name">
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="span"
                        >
                          {user.email}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          component="div" 
                          className="user-activity"
                        >
                          <span className="activity-count">
                            عدد النشاطات: {user.activityCount}
                          </span>
                          <span className="last-active">
                            آخر نشاط: {formatDate(user.lastActive)}
                          </span>
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < users.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
};

export default TopUsersList; 