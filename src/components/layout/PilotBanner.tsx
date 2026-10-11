import React, { useState } from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';

export const PilotBanner: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '0.4rem 1rem',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b'
        }}
      >
        <span style={{
          background: '#1d4ed8',
          color: '#ffffff',
          padding: '0.15rem 0.55rem',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.03em'
        }}>
          LifeBridge India
        </span>
        <span style={{ color: '#cbd5e1' }}>
          Transparent Medical Support & Rare Disease Care Platform.
        </span>
        <button
          onClick={() => setShowDetails(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            marginLeft: '0.25rem',
            padding: 0,
            fontSize: '0.8125rem'
          }}
        >
          Verification & Trust Policy
        </button>
      </div>

      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck color="#059669" size={22} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Platform Trust & Transparency</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#334155' }}>
              LifeBridge India is built on strict verification standards for rare disease support and medical campaigns.
            </p>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#475569' }}>
                <li>All operational data is fetched directly from Firebase backend records.</li>
                <li>Patient campaigns undergo independent human document and hospital desk audits.</li>
                <li>Voluntary blood donor contact details are never publicly exposed.</li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => setShowDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
