import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Statistics from '../../components/dashboard/Statistics/Statistics';
import UsersList from '../../components/dashboard/Users/UsersList';
import UserDetails from '../../components/dashboard/Users/UserDetails';
import AdvancedDocumentsList from '../../components/dashboard/Documents/AdvancedDocumentsList';
import AdvertisementsList from '../../components/dashboard/Documents/AdvertisementsList';
import MatchesList from '../../components/dashboard/Documents/MatchesList';
import ContactRequestsList from '../../components/dashboard/ContactRequests/ContactRequestsList';
import { DEFAULT_SECTION, isKnownSection, sectionPath } from '../../constants/sections';
import '../../styles/Dashboard.css';

/**
 * هيكل لوحة التحكم.
 *
 * القسم النشط يُشتقّ من المسار لا من حالة محليّة. قبل ذلك كانت كل
 * الأقسام تعيش على `/admin/dashboard`: زر الرجوع يخرج من اللوحة،
 * والتحديث يعيدك للرئيسية، ولا يمكن إرسال رابط لقسم بعينه.
 */
const Dashboard: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ id?: string; section?: string }>();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  const viewingUserId = location.pathname.startsWith('/admin/user/') ? params.id : undefined;

  // مسار غير معروف يعود للرئيسية بدل عرض شاشة فارغة
  const activeSection = isKnownSection(params.section) ? params.section! : DEFAULT_SECTION;

  const setActiveSection = useCallback(
    (section: string) => navigate(sectionPath(section)),
    [navigate]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    if (viewingUserId) {
      return (
        <UserDetails
          userId={viewingUserId}
          // الرجوع يعتمد سجل المتصفّح، فيعود المشرف إلى القسم الذي
          // جاء منه فعلًا بدل قسم محفوظ في حالة قد تكون بائتة
          onClose={() => navigate(-1)}
        />
      );
    }

    switch (activeSection) {
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
      case 'home':
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
