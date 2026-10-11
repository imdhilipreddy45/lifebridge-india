import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardContent } from '../components/dashboard/DashboardContent';
import { LogIn, UserPlus, ArrowLeft, ShieldAlert } from 'lucide-react';
import { PatientApplyModal } from '../components/modals/PatientApplyModal';

interface DashboardPageProps {
  onNavigate?: (tab: string) => void;
  onOpenAuth?: (mode?: 'signin' | 'register') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentRole, isAuthenticated, loading, logout } = useAuth();

  const getDefaultSection = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'queue';
      case 'PATIENT_FAMILY': return 'my-app';
      case 'DONOR': return 'donations';
      case 'VOLUNTEER': return 'tasks';
      case 'DOCTOR': return 'assigned';
      case 'HOSPITAL': return 'cases';
      case 'CSR': return 'esg';
      default: return 'queue';
    }
  };

  const [activeSection, setActiveSection] = useState(() => getDefaultSection(currentRole));
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    setActiveSection(getDefaultSection(currentRole));
  }, [currentRole]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Initializing authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '2.5rem', borderRadius: '16px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Authentication Required</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.55 }}>
            To access your LifeBridge India workspace, verification queue, or patient application tracker, please sign in or register your account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {onOpenAuth && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onOpenAuth('signin')}
                >
                  <LogIn size={16} /> Sign In to Workspace
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onOpenAuth('register')}
                >
                  <UserPlus size={16} /> Create Account
                </button>
              </>
            )}
            {onNavigate && (
              <button
                type="button"
                className="btn"
                style={{ width: '100%', justifyContent: 'center', color: '#64748b' }}
                onClick={() => onNavigate('home')}
              >
                <ArrowLeft size={16} /> Return to Home
              </button>
            )}
          </div>
        </div>
      </main>
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
        onOpenPatientApply={() => setApplyModalOpen(true)}
        onNavigate={onNavigate}
      />

      <PatientApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onNavigateToDashboard={() => setActiveSection('my-app')}
      />
    </div>
  );
};

