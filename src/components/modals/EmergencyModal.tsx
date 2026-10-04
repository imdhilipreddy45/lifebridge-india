import React from 'react';
import { ShieldAlert, X, PhoneCall, Droplets, Stethoscope, FilePlus } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="#dc2626" size={24} />
            <h3 style={{ margin: 0, color: '#dc2626' }}>Urgent Emergency Help Desk</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '1.5rem' }}>
          <strong>Pilot Limitation Notice:</strong> Support services are currently operating in controlled pilot mode. In case of acute medical emergencies, please contact 112 or visit your nearest tertiary care hospital emergency department immediately.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <button style={channelBtnStyle} onClick={() => alert('[Pilot Action] Hospital Emergency Assistance Desk notified.')}>
            <PhoneCall color="#dc2626" size={20} /> Hospital Emergency ICU Desk
          </button>
          <button style={channelBtnStyle} onClick={() => alert('[Pilot Action] Emergency Blood & Platelet Donor Search dispatched.')}>
            <Droplets color="#dc2626" size={20} /> Urgent Blood / Platelet Request
          </button>
          <button style={channelBtnStyle} onClick={() => alert('[Pilot Action] Tele-Consult Desk standby requested.')}>
            <Stethoscope color="#1d4ed8" size={20} /> Doctor Tele-Consult Help
          </button>
          <button style={channelBtnStyle} onClick={() => alert('[Pilot Action] Fast-track Campaign Expeditor assigned.')}>
            <FilePlus color="#059669" size={20} /> Emergency Campaign Application
          </button>
        </div>

        <button 
          className="btn btn-outline" 
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            height: '44px', 
            fontWeight: 600, 
            fontSize: '0.9375rem', 
            borderColor: '#cbd5e1', 
            color: '#334155',
            backgroundColor: '#ffffff'
          }} 
          onClick={onClose}
        >
          Close Emergency Panel
        </button>
      </div>
    </div>
  );
};

const channelBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.85rem 1.25rem',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#0f172a',
  cursor: 'pointer',
  textAlign: 'left'
};
