import React from 'react';
import { UserRole } from '../../types';
import { ShieldCheck, FileText, Activity, Building2, BarChart3, Users, Settings, Bug, HelpCircle } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeSection: string;
  onSelectSection: (sec: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeSection, onSelectSection }) => {
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { id: 'queue', label: 'Verification Queue', icon: ShieldCheck },
          { id: 'documents', label: 'Human Document Desk', icon: FileText },
          { id: 'blood', label: 'Blood Requests', icon: Activity },
          { id: 'feedback', label: 'Pilot Feedback', icon: MessageSquareIcon },
          { id: 'issues', label: 'Issue Tracker', icon: Bug },
          { id: 'logs', label: 'Audit Logs', icon: Settings }
        ];
      case 'DOCTOR':
        return [
          { id: 'assigned', label: 'Assigned Clinical Cases', icon: Activity },
          { id: 'clinical-logs', label: 'Clinical Log Writer', icon: FileText },
          { id: 'verifications', label: 'Neurology Desk Verification', icon: ShieldCheck }
        ];
      case 'HOSPITAL':
        return [
          { id: 'cases', label: 'Associated Hospital Cases', icon: Building2 },
          { id: 'estimates', label: 'Treatment Estimates', icon: FileText },
          { id: 'milestones', label: 'Treatment Milestones', icon: Activity }
        ];
      case 'CSR':
        return [
          { id: 'esg', label: 'ESG Impact Summary', icon: BarChart3 },
          { id: 'reports', label: 'Simulated Tax Reports', icon: FileText }
        ];
      case 'VOLUNTEER':
        return [
          { id: 'tasks', label: 'Volunteer Assignments', icon: Users },
          { id: 'network', label: 'Community Support', icon: Activity }
        ];
      case 'PATIENT_FAMILY':
        return [
          { id: 'my-app', label: 'My Support Application', icon: FileText },
          { id: 'hope-journey', label: 'Hope Journey Milestones', icon: Activity }
        ];
      default:
        return [
          { id: 'donations', label: 'My Demo Contributions', icon: BarChart3 },
          { id: 'saved', label: 'Saved Patient Campaigns', icon: ShieldCheck }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ padding: '0 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {role.replace('_', ' ')} WORKSPACE
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectSection(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isActive ? '#eff6ff' : 'transparent',
              color: isActive ? '#1d4ed8' : '#475569',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={18} />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};

const MessageSquareIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
