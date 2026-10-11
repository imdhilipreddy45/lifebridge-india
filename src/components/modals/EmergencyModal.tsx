import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, PhoneCall, Droplets, Stethoscope, FilePlus, ExternalLink, ArrowRight, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  onOpenPatientApply?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenPatientApply
}) => {
  const [teleconsultNotice, setTeleconsultNotice] = useState(false);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBloodAction = () => {
    onClose();
    if (onNavigate) {
      onNavigate('blood-donation');
    } else {
      window.location.hash = 'blood-donation';
    }
  };

  const handleApplyAction = () => {
    onClose();
    if (onOpenPatientApply) {
      onOpenPatientApply();
    } else if (onNavigate) {
      onNavigate('patients');
    } else {
      window.location.hash = 'patients';
    }
  };

  const handleSupportAction = () => {
    onClose();
    if (onNavigate) {
      onNavigate('support');
    } else {
      window.location.hash = 'support';
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="#dc2626" size={26} />
            <h3 id="emergency-modal-title" style={{ margin: 0, color: '#dc2626', fontSize: '1.3rem' }}>
              Urgent Medical Help Desk
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close emergency panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* CRITICAL SAFETY DISCLAIMER */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '1rem',
          fontSize: '0.85rem',
          color: '#991b1b',
          marginBottom: '1.5rem',
          lineHeight: 1.55
        }}>
          <strong>CRITICAL SAFETY NOTICE:</strong> LifeBridge India is an administrative medical coordination platform. If a patient is experiencing an acute life-threatening emergency, respiratory failure, or ICU collapse, <strong>do not wait for an online response</strong>. Contact national emergency services or proceed immediately to the nearest hospital casualty/emergency department.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* 1. DIRECT EMERGENCY PHONE HELPLINES */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            border: '2px solid #fca5a5',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <PhoneCall color="#dc2626" size={20} />
              <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Immediate Telephone Helplines</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
              Connect directly with round-the-clock Indian emergency and ambulance lines:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <a
                href="tel:112"
                className="btn btn-emergency btn-sm"
                style={{ justifyContent: 'center', textDecoration: 'none' }}
              >
                <PhoneCall size={15} /> Call 112 (National Emergency)
              </a>
              <a
                href="tel:108"
                className="btn btn-emergency btn-sm"
                style={{ justifyContent: 'center', textDecoration: 'none' }}
              >
                <PhoneCall size={15} /> Call 108 (Ambulance)
              </a>
            </div>
          </div>

          {/* 2. URGENT BLOOD / PLATELET REQUEST */}
          <button
            type="button"
            style={emergencyActionCardStyle}
            onClick={handleBloodAction}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <Droplets size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>Urgent Blood / Platelet Match</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Search standby O-negative donors or register acute component need</div>
              </div>
            </div>
            <ArrowRight size={18} color="#dc2626" />
          </button>

          {/* 3. DOCTOR TELE-CONSULT DESK (HONEST PILOT DISCLOSURE) */}
          <div>
            <button
              type="button"
              style={emergencyActionCardStyle}
              onClick={() => setTeleconsultNotice(!teleconsultNotice)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>Doctor Tele-Consult Help</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Check tele-consultation availability & clinical inquiry desk</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                {teleconsultNotice ? 'Hide info' : 'View status'}
              </span>
            </button>

            {teleconsultNotice && (
              <div style={{
                marginTop: '0.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.8125rem',
                color: '#334155',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <AlertTriangle size={15} /> Clinical Onboarding Notice
                </div>
                Direct video tele-consultation is undergoing regulatory clinical onboarding for Release V1.2. For urgent clinical evaluations, please visit your hospital casualty unit directly or submit an inquiry to our pilot desk.
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleSupportAction}
                  >
                    Open Support & Inquiry Desk →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. EMERGENCY PATIENT APPLICATION */}
          <button
            type="button"
            style={emergencyActionCardStyle}
            onClick={handleApplyAction}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                <FilePlus size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>Emergency Patient Campaign Application</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Submit treatment estimates for expedited hospital desk audit</div>
              </div>
            </div>
            <ArrowRight size={18} color="#059669" />
          </button>
        </div>

        <button
          type="button"
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

const emergencyActionCardStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'border-color 0.2s ease, background-color 0.2s ease'
};
