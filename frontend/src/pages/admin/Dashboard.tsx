import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Statistics from '../../components/dashboard/Statistics/Statistics';
import UsersList from '../../components/dashboard/Users/UsersList';
import UserDetails from '../../components/dashboard/Users/UserDetails';
import DocumentsList from '../../components/dashboard/Documents/DocumentsList';
import PendingMatches from '../../components/dashboard/Documents/PendingMatches';
import AdvancedDocumentsList from '../../components/dashboard/Documents/AdvancedDocumentsList';
import AdvertisementsList from '../../components/dashboard/Documents/AdvertisementsList';
import MatchesList from '../../components/dashboard/Documents/MatchesList';
import ContactRequestsList from '../../components/dashboard/ContactRequests/ContactRequestsList';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [previousSection, setPreviousSection] = useState<string>('home');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    console.log('حالة المسار الحالية:', location.state);
  }, [location.state]);

  // تحديث القسم النشط بناءً على حالة المسار
  useEffect(() => {
    // التحقق من وجود معرف مستخدم في المسار
    if (params.id && location.pathname.includes('/admin/user/')) {
      // حفظ القسم السابق قبل عرض تفاصيل المستخدم
      if (!selectedUserId) {
        // التحقق إذا كان هناك قسم سابق في حالة التنقل
        const stateParams = location.state as { previousSection?: string } | null;
        if (stateParams && stateParams.previousSection) {
          console.log('تم استلام القسم السابق من الحالة:', stateParams.previousSection);
          setPreviousSection(stateParams.previousSection);
        } else {
          console.log('استخدام القسم النشط الحالي كقسم سابق:', activeSection);
          setPreviousSection(activeSection);
        }
      }
      setSelectedUserId(params.id);
    } else {
      setSelectedUserId(null);
      
      const stateParams = location.state as { activeSection?: string } | null;
      if (stateParams && stateParams.activeSection) {
        console.log('تعيين القسم النشط من الحالة:', stateParams.activeSection);
        setActiveSection(stateParams.activeSection);
      }
    }
  }, [location.pathname, params, location.state]);

  // مراقبة تغيير حجم الشاشة لتحديد وضع الجوال
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderContent = () => {
    // إذا كان هناك معرف مستخدم، نعرض تفاصيل المستخدم
    if (selectedUserId) {
      return (
        <UserDetails 
          userId={selectedUserId} 
          onClose={() => {
            // عودة إلى الصفحة السابقة دون تغيير القسم النشط
            console.log('إغلاق تفاصيل المستخدم والعودة إلى القسم السابق:', previousSection);
            navigate('/admin/dashboard', { 
              state: { activeSection: previousSection },
              replace: true
            });
          }} 
        />
      );
    }

    // عرض المحتوى العادي إذا لم يكن هناك معرف مستخدم
    switch (activeSection) {
      case 'home':
        return <Statistics setActiveSection={setActiveSection} />;
      case 'users':
        return <UsersList />;
      case 'matches-system':
        return <MatchesList />;
      case 'review':
        return <AdvancedDocumentsList />;
      case 'advertisements':
        return <AdvertisementsList />;
      case 'contacts':
        return <ContactRequestsList />;
      default:
        return <Statistics setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className={`dashboard-content ${isMobile ? 'mobile-content' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard; 