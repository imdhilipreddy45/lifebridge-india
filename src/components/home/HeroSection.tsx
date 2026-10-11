import React from 'react';
import { ShieldCheck, Lock, UserCheck, Eye, ArrowRight, Heart } from 'lucide-react';

interface HeroSectionProps {
  onFindSupport: () => void;
  onHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onFindSupport, onHowItWorks }) => {
  return (
    <section style={{
      backgroundColor: '#ffffff',
      paddingTop: '3.5rem',
      paddingBottom: '4rem',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div className="container">
        {/* HERO GRID: TWO-COLUMN DESKTOP / SINGLE-COLUMN MOBILE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          {/* LEFT COLUMN: TEXT CONTENT */}
          <div>
            {/* EYEBROW */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}>
              <Heart size={16} color="#1d4ed8" fill="#1d4ed8" /> Trusted support for rare-disease families
            </div>

            {/* HEADLINE */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '1.25rem'
            }}>
              Helping families find <span style={{ color: '#1d4ed8' }}>trusted medical support.</span>
            </h1>

            {/* SUBHEADING */}
            <p style={{
              fontSize: '1.125rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '540px'
            }}>
              LifeBridge India connects families, verified medical professionals, hospitals, donors and volunteers through a transparent medical support platform.
            </p>

            {/* ACTION BUTTONS: PROPER HERO CTA BUTTON STYLING */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '2.5rem'
            }}>
              {/* PRIMARY HERO CTA BUTTON */}
              <button
                type="button"
                onClick={onFindSupport}
                className="hero-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  height: '48px',
                  padding: '0 1.5rem',
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.25)',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  transition: 'background-color 0.2s ease, transform 0.1s ease'
                }}
              >
                Find Support <ArrowRight size={18} />
              </button>

              {/* SECONDARY HERO CTA BUTTON */}
              <button
                type="button"
                onClick={onHowItWorks}
                className="hero-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  height: '48px',
                  padding: '0 1.5rem',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }}
              >
                How LifeBridge Works
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CLEAN PLATFORM VISUAL PREVIEW */}
          <div>
            <div className="card" style={{
              padding: '2rem',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <span className="badge badge-emerald">
                  <ShieldCheck size={14} /> Verification Framework
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  PLATFORM TRUST AUDIT
                </span>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: '#0f172a' }}>Human Document Review Model</h3>
                <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 600 }}>5-Stage Multi-Stakeholder Verification</span>
              </div>

              {/* SIMPLIFIED HOPE SCORE INDICATOR */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#047857' }}>Human Verification Standards</span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>5 Independent Audits</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#065f46' }}>
                  <span>Identity Proof ✓</span> • <span>Medical Records ✓</span> • <span>Attending Doctor ✓</span> • <span>Hospital Desk ✓</span> • <span>Treatment Estimate ✓</span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                🔒 Direct Backend Verification • Protected Health Documents
              </div>
            </div>
          </div>
        </div>

        {/* TRUST STRIP UNDER HERO */}
        <div style={{
          marginTop: '3.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a' }}>Verified Workflows</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Independent document desk audits</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Lock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a' }}>Privacy-Focused</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Protected medical reports</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a' }}>Human Review</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No automated AI approvals</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569' }}>
              <Eye size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a' }}>Transparent Architecture</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct Firebase backend integration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
