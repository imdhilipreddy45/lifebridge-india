import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  AlertTriangle, 
  Droplet, 
  FileText, 
  HelpCircle, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenEmergency,
  onOpenAuth
}) => {
  const { currentRole, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLabel = (role: UserRole) => {
    switch (role) {
      case 'DOCTOR': return 'Doctor Desk';
      case 'HOSPITAL': return 'Hospital Portal';
      case 'CSR': return 'CSR Dashboard';
      case 'ADMIN': return 'Admin Queue';
      case 'PATIENT_FAMILY': return 'Patient Dashboard';
      case 'VOLUNTEER': return 'Volunteer Portal';
      default: return 'Dashboard';
    }
  };

  const handleMobileNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* BRAND LOGO (NEVER WRAPS) */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ backgroundColor: '#1d4ed8', color: '#ffffff', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
            <Heart size={20} />
          </div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
              LifeBridge <span style={{ color: '#1d4ed8' }}>India</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.625rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Trusted Medical Support
            </span>
          </div>
        </div>

        {/* CENTER DESKTOP NAVIGATION (VISIBLE AT >= 1000px) */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={navButtonStyle(currentTab === 'home')}
          >
            Home
          </button>

          <button 
            onClick={() => onNavigate('rare-diseases')}
            style={navButtonStyle(currentTab === 'rare-diseases')}
          >
            Rare Diseases
          </button>

          <button 
            onClick={() => onNavigate('patients')}
            style={navButtonStyle(currentTab === 'patients')}
          >
            Patients
          </button>

          <button 
            onClick={() => onNavigate('how-it-works')}
            style={navButtonStyle(currentTab === 'how-it-works')}
          >
            How It Works
          </button>

          <button 
            onClick={() => onNavigate('adopt-treatment')}
            style={navButtonStyle(currentTab === 'adopt-treatment' || currentTab === 'micro-support')}
          >
            Micro-Support
          </button>

          {/* MORE DROPDOWN */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ ...navButtonStyle(false), display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              More <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '0.4rem',
                minWidth: '180px',
                zIndex: 110
              }}>
                <button onClick={() => { onNavigate('blood-donation'); setDropdownOpen(false); }} style={dropdownItemStyle}>
                  <Droplet size={15} color="#dc2626" /> Blood Donation
                </button>
                <button onClick={() => { onNavigate('transparency'); setDropdownOpen(false); }} style={dropdownItemStyle}>
                  <FileText size={15} color="#059669" /> Transparency
                </button>
                <button onClick={() => { onNavigate('support'); setDropdownOpen(false); }} style={dropdownItemStyle}>
                  <HelpCircle size={15} color="#1d4ed8" /> Support & FAQ
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT ACTION CONTROLS (DESKTOP) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          
          {/* URGENT HELP EMERGENCY BUTTON */}
          <button 
            onClick={onOpenEmergency}
            className="btn btn-emergency"
            style={{ 
              padding: '0.4rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            <AlertTriangle size={14} color="#ffffff" /> Urgent Help
          </button>


          {/* AUTHENTICATION CONTROL STATE */}
          {isAuthenticated ? (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
              >
                <LayoutDashboard size={14} /> {getDashboardLabel(currentRole)}
              </button>

              <button
                onClick={async () => {
                  await logout();
                  onNavigate('home');
                }}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.4rem 0.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => onOpenAuth('signin')}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
              >
                <LogIn size={14} /> Sign In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE BUTTON (VISIBLE AT < 1000px) */}
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', color: '#0f172a' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button onClick={() => handleMobileNav('home')} style={mobileNavItemStyle}>Home</button>
          <button onClick={() => handleMobileNav('rare-diseases')} style={mobileNavItemStyle}>Rare Diseases</button>
          <button onClick={() => handleMobileNav('patients')} style={mobileNavItemStyle}>Patients</button>
          <button onClick={() => handleMobileNav('how-it-works')} style={mobileNavItemStyle}>How It Works</button>
          <button onClick={() => handleMobileNav('adopt-treatment')} style={mobileNavItemStyle}>Micro-Support</button>
          <button onClick={() => handleMobileNav('blood-donation')} style={mobileNavItemStyle}>Blood Donation</button>
          <button onClick={() => handleMobileNav('transparency')} style={mobileNavItemStyle}>Transparency</button>
          <button onClick={() => handleMobileNav('support')} style={mobileNavItemStyle}>Support & FAQ</button>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

          {/* MOBILE AUTHENTICATION ACTIONS */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => handleMobileNav('dashboard')}
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LayoutDashboard size={16} /> {getDashboardLabel(currentRole)}
              </button>
              <button 
                onClick={async () => { await logout(); setMobileMenuOpen(false); onNavigate('home'); }}
                className="btn" 
                style={{ width: '100%', justifyContent: 'center', border: '1px solid #cbd5e1', color: '#dc2626' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button 
                onClick={() => { onOpenAuth('signin'); setMobileMenuOpen(false); }}
                className="btn" 
                style={{ justifyContent: 'center', border: '1px solid #cbd5e1' }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button 
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="btn btn-primary" 
                style={{ justifyContent: 'center' }}
              >
                <UserPlus size={15} /> Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const navButtonStyle = (active: boolean): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: active ? 700 : 500,
  color: active ? '#1d4ed8' : '#334155',
  cursor: 'pointer',
  padding: '0.4rem 0',
  whiteSpace: 'nowrap'
});

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  background: 'none',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap'
};

const mobileNavItemStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '0.5rem 0',
  background: 'none',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#0f172a',
  cursor: 'pointer'
};
