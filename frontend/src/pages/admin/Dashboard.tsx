import React, { useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Statistics from '../../components/dashboard/Statistics/Statistics';
import UsersList from '../../components/dashboard/Users/UsersList';
import DocumentsList from '../../components/dashboard/Documents/DocumentsList';
import PendingMatches from '../../components/dashboard/Documents/PendingMatches';
import AdvancedDocumentsList from '../../components/dashboard/Documents/AdvancedDocumentsList';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Statistics />;
      case 'users':
        return <UsersList />;
      case 'matches':
        return <DocumentsList />;
      case 'review':
        return <AdvancedDocumentsList />;
      default:
        return <Statistics />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard; 