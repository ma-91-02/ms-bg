import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Sidebar.css';
import logoIcon from '../../../assets/logo-icon.svg';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [iconsOnly, setIconsOnly] = useState<boolean>(false); // تعديل القيمة الافتراضية لتكون false (عرض كامل)

  // إغلاق السايد بار عند تغيير القسم النشط على الشاشات الصغيرة
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [activeSection]);

  // الاستماع لتغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false); // إعادة ضبط حالة السايد بار عند تجاوز حجم الهاتف
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // حفظ حالة السايدبار في التخزين المحلي عند تغييرها
  useEffect(() => {
    if (window.innerWidth > 768) {
      localStorage.setItem('sidebarIconsOnly', JSON.stringify(iconsOnly));
    }
  }, [iconsOnly]);

  // استعادة حالة السايدبار من التخزين المحلي عند تحميل الصفحة
  useEffect(() => {
    const savedIconsOnly = localStorage.getItem('sidebarIconsOnly');
    if (savedIconsOnly !== null && window.innerWidth > 768) {
      setIconsOnly(JSON.parse(savedIconsOnly));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleIconsMode = () => {
    setIconsOnly(!iconsOnly);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false); // إغلاق السايد بار بعد اختيار القسم
    }
  };

  // إضافة كلاس لعنصر الصفحة الرئيسية عند استخدام وضع الأيقونات فقط
  useEffect(() => {
    const content = document.querySelector('.dashboard-content');
    if (content) {
      if (iconsOnly && (window.innerWidth > 768)) {
        content.classList.add('with-icons-sidebar');
      } else {
        content.classList.remove('with-icons-sidebar');
      }
    }
  }, [iconsOnly]);

  return (
    <>
      {/* زر فتح/إغلاق السايد بار للشاشات الصغيرة */}
      <button 
        className="toggle-sidebar" 
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* الخلفية المعتمة عند فتح السايد بار */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''} ${iconsOnly ? 'icons-only' : ''}`}>
        {/* زر تبديل وضع الأيقونات */}
        <button 
          className="toggle-icons-mode" 
          onClick={toggleIconsMode}
          aria-label={iconsOnly ? "عرض النص" : "إخفاء النص"}
        >
          <i className={`fas ${iconsOnly ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>

        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logoIcon} alt="مستمسكاتي" className="logo-icon" />
            <div className="logo-text">
              <h3>مستمسكاتي</h3>
              <p>إعادة المفقودات</p>
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleSectionChange('home')}
          >
            <i className="fas fa-home"></i>
            <span>الصفحة الرئيسية</span>
            <div className="tooltip">الصفحة الرئيسية</div>
          </div>
          
          <div 
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => handleSectionChange('users')}
          >
            <i className="fas fa-users"></i>
            <span>المستخدمون</span>
            <div className="tooltip">المستخدمون</div>
          </div>
          
          <div 
            className={`sidebar-item ${activeSection === 'advertisements' ? 'active' : ''}`}
            onClick={() => handleSectionChange('advertisements')}
          >
            <i className="fas fa-ad"></i>
            <span>جميع الإعلانات</span>
            <div className="tooltip">جميع الإعلانات</div>
          </div>
          
          <div 
            className={`sidebar-item ${activeSection === 'matches-system' ? 'active' : ''}`}
            onClick={() => handleSectionChange('matches-system')}
          >
            <i className="fas fa-exchange-alt"></i>
            <span>نظام المطابقات</span>
            <div className="tooltip">نظام المطابقات</div>
          </div>

          <div 
            className={`sidebar-item ${activeSection === 'review' ? 'active' : ''}`}
            onClick={() => handleSectionChange('review')}
          >
            <i className="fas fa-clipboard-check"></i>
            <span>الإعلانات للمراجعة</span>
            <div className="tooltip">الإعلانات للمراجعة</div>
          </div>
          
          <div 
            className={`sidebar-item ${activeSection === 'contacts' ? 'active' : ''}`}
            onClick={() => handleSectionChange('contacts')}
          >
            <i className="fas fa-envelope"></i>
            <span>طلبات التواصل</span>
            <div className="tooltip">طلبات التواصل</div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div 
            className="sidebar-item logout" 
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>تسجيل الخروج</span>
            <div className="tooltip">تسجيل الخروج</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 