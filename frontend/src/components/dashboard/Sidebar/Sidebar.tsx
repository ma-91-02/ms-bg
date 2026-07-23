import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Sidebar.css';
import logoIcon from '../../../assets/logo-icon.svg';
import { SECTIONS } from '../../../constants/sections';

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
          {/* بُنيت من `SECTIONS` بدل ست كتل متطابقة: إضافة قسم كانت
              تتطلّب تعديل الشريط والمسار والمبدّل، فينسى أحدها */}
          {SECTIONS.map((section) => (
            <div
              key={section.slug}
              className={`sidebar-item ${activeSection === section.slug ? 'active' : ''}`}
              onClick={() => handleSectionChange(section.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSectionChange(section.slug);
                }
              }}
              aria-label={section.label}
              aria-current={activeSection === section.slug ? 'page' : undefined}
            >
              <i className={`fas ${section.icon}`}></i>
              <span>{section.label}</span>
              <div className="tooltip">{section.label}</div>
            </div>
          ))}
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