import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { Box, Card, Typography, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { getTimelineStats, TimelineStats } from '../../../services/statsService';
import '../../../styles/Statistics.css';

interface TimelineChartProps {
  title?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ title = 'تحليل النمو على مدار الوقت' }) => {
  const [timelineData, setTimelineData] = useState<TimelineStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        const data = await getTimelineStats(period);
        setTimelineData(data);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب بيانات الإحصائيات الزمنية:', error);
        setError('فشل في تحميل بيانات المخطط الزمني');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [period]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setPeriod(event.target.value as 'week' | 'month' | 'year');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (period === 'year') {
      // للسنة، نعرض اسم الشهر فقط
      return date.toLocaleDateString('ar-EG', { month: 'short' });
    } else {
      // للأسبوع والشهر، نعرض اليوم والشهر
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
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
    <Card className="timeline-chart-card">
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" className="chart-title">{title}</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={period}
              onChange={handlePeriodChange}
              displayEmpty
              className="period-select"
            >
              <MenuItem value="week">أسبوع</MenuItem>
              <MenuItem value="month">شهر</MenuItem>
              <MenuItem value="year">سنة</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timelineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, '']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="المستخدمين" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="advertisements" 
                name="المستندات" 
                stroke="#82ca9d" 
              />
              <Line 
                type="monotone" 
                dataKey="approvedAds" 
                name="الموافق عليها" 
                stroke="#ffc658" 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 4, height: 200, width: '100%' }}>
          <Typography variant="subtitle1" className="chart-subtitle">
            توزيع حالة المستندات
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, '']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="pendingAds" 
                name="قيد المراجعة" 
                stackId="1" 
                stroke="#ffa726" 
                fill="#ffcc80" 
              />
              <Area 
                type="monotone" 
                dataKey="approvedAds" 
                name="الموافق عليها"
                stackId="1" 
                stroke="#66bb6a" 
                fill="#a5d6a7" 
              />
              <Area 
                type="monotone" 
                dataKey="resolvedAds" 
                name="تم استردادها" 
                stackId="1" 
                stroke="#29b6f6" 
                fill="#81d4fa" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Card>
  );
};

export default TimelineChart; 