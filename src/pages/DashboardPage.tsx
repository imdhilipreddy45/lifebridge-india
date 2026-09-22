import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardContent } from '../components/dashboard/DashboardContent';

export const DashboardPage: React.FC = () => {
  const { currentRole, isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('queue');

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Initializing authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '2rem', borderRadius: '12px' }}>
          <h3 style={{ color: '#1e3a8a', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Authentication Required</h3>
          <p style={{ color: '#3b82f6', fontSize: '0.875rem', marginBottom: 0 }}>
            Please sign in or create an account to access the LifeBridge dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
      <Sidebar 
        role={currentRole}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />
      <DashboardContent 
        role={currentRole}
        activeSection={activeSection}
      />
    </div>
  );
};

