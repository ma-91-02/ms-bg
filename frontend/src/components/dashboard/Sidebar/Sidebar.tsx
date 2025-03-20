import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Sidebar.css';
import logoIcon from '../../../assets/logo-icon.svg';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="sidebar-container">
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
          onClick={() => setActiveSection('home')}
        >
          <span>الصفحة الرئيسية</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          <span>المستخدمون</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeSection === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveSection('matches')}
        >
          <span>الإعلانات المطابقة</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeSection === 'review' ? 'active' : ''}`}
          onClick={() => setActiveSection('review')}
        >
          <span>الإعلانات للمراجعة</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item logout" onClick={handleLogout}>
          <span>تسجيل الخروج</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 