import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PilotBanner } from './components/layout/PilotBanner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { RareDiseasesPage } from './pages/RareDiseasesPage';
import { PatientDirectoryPage } from './pages/PatientDirectoryPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AdoptTreatmentPage } from './pages/AdoptTreatmentPage';
import { BloodDonationPage } from './pages/BloodDonationPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { SupportPage } from './pages/SupportPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { AuthModal } from './components/modals/AuthModal';
import { FeedbackModal } from './components/modals/FeedbackModal';

export const App: React.FC = () => {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) return 'home';
    if (hash === 'micro-support') return 'adopt-treatment';
    return hash;
  };

  const [currentTab, setCurrentTab] = useState<string>(getTabFromHash);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Synchronize hash changes and Browser Back/Forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleNavigate = (tab: string) => {
    const targetHash = tab === 'adopt-treatment' ? 'adopt-treatment' : tab;
    window.location.hash = targetHash;
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />;
      case 'rare-diseases':
        return <RareDiseasesPage onNavigate={handleNavigate} />;
      case 'patients':
        return <PatientDirectoryPage onNavigate={handleNavigate} />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'adopt-treatment':
      case 'micro-support':
        return <AdoptTreatmentPage />;
      case 'blood-donation':
        return <BloodDonationPage />;
      case 'transparency':
        return <TransparencyPage />;
      case 'support':
        return <SupportPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* COMPACT CONTROLLED PILOT NOTICE */}
        <PilotBanner />

        {/* GLOBAL NAVIGATION HEADER */}
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenEmergency={() => setEmergencyOpen(true)}
          onOpenAuth={handleOpenAuth}
        />

        {/* ROUTE / VIEW DISPATCHER */}
        <div style={{ flex: 1 }}>
          {renderView()}
        </div>

        {/* FOOTER */}
        <Footer
          onNavigate={handleNavigate}
          onOpenFeedback={() => setFeedbackOpen(true)}
        />

        {/* EMERGENCY ASSISTANCE MODAL */}
        <EmergencyModal
          isOpen={emergencyOpen}
          onClose={() => setEmergencyOpen(false)}
        />

        {/* AUTHENTICATION MODAL (SIGN IN & REGISTER) */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => handleNavigate('dashboard')}
        />

        {/* PILOT FEEDBACK MODAL */}
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          currentPage={currentTab}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
