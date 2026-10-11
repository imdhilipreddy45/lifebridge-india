import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenFeedback }) => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      paddingTop: '4rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
      borderTop: '1px solid #1e293b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* COLUMN 1: BRAND */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                LifeBridge <span style={{ color: '#38bdf8' }}>India</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '360px', marginBottom: '1.25rem' }}>
              LifeBridge India connects families, verified medical professionals, hospitals, donors and volunteers through a transparent medical support platform.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#1e293b',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #334155',
              fontSize: '0.75rem',
              color: '#34d399'
            }}>
              <ShieldCheck size={16} /> Controlled Pilot • Demo Mode
            </div>
          </div>

          {/* COLUMN 2: RARE DISEASES */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Rare Diseases</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><a href="#sma" onClick={(e) => { e.preventDefault(); onNavigate('rare-diseases'); }} style={{ color: '#94a3b8' }}>Spinal Muscular Atrophy (SMA)</a></li>
              <li><a href="#dmd" onClick={(e) => { e.preventDefault(); onNavigate('rare-diseases'); }} style={{ color: '#94a3b8' }}>Duchenne Muscular Dystrophy</a></li>
              <li><a href="#thalassemia" onClick={(e) => { e.preventDefault(); onNavigate('rare-diseases'); }} style={{ color: '#94a3b8' }}>Thalassemia Major</a></li>
              <li><a href="#cancer" onClick={(e) => { e.preventDefault(); onNavigate('rare-diseases'); }} style={{ color: '#94a3b8' }}>Pediatric Oncology</a></li>
            </ul>
          </div>

          {/* COLUMN 3: PLATFORM */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><a href="#how" onClick={(e) => { e.preventDefault(); onNavigate('how-it-works'); }} style={{ color: '#94a3b8' }}>How It Works</a></li>
              <li><a href="#patients" onClick={(e) => { e.preventDefault(); onNavigate('patients'); }} style={{ color: '#94a3b8' }}>Patient Directory</a></li>
              <li><a href="#blood" onClick={(e) => { e.preventDefault(); onNavigate('blood-donation'); }} style={{ color: '#94a3b8' }}>Blood Donor Match</a></li>
              <li><a href="#transparency" onClick={(e) => { e.preventDefault(); onNavigate('transparency'); }} style={{ color: '#94a3b8' }}>Transparency Ledger</a></li>
            </ul>
          </div>

          {/* COLUMN 4: HELP & LEGAL */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Support & Privacy</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li><a href="#support" onClick={(e) => { e.preventDefault(); onNavigate('support'); }} style={{ color: '#94a3b8' }}>Help & Knowledge Base</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigate('support'); }} style={{ color: '#94a3b8' }}>Patient Privacy & Consent</a></li>
              <li><a href="#disclaimer" onClick={(e) => { e.preventDefault(); onNavigate('support'); }} style={{ color: '#94a3b8' }}>Medical Safety Disclaimer</a></li>
              {onOpenFeedback && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenFeedback}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#38bdf8', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    Give Pilot Feedback →
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>


        {/* BOTTOM COPYRIGHT */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 LifeBridge India. All rights reserved. • Operating in Controlled Pilot Mode.
          </div>
          <div>
            LifeBridge India is a medical support platform. It does not provide direct medical advice, diagnosis, or treatment.
          </div>
        </div>
      </div>
    </footer>
  );
};
