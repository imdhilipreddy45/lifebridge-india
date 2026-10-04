import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Apply',
      description: 'Family or attending doctor submits a support application along with diagnostic and hospital estimate files.'
    },
    {
      step: '02',
      title: 'Verify',
      description: 'Independent human reviews audit identity documents, medical diagnostic records, hospital estimates, and doctor updates.'
    },
    {
      step: '03',
      title: 'Connect',
      description: 'Verified campaigns connect with generous supporters, corporate CSR programs, and voluntary blood donors.'
    },
    {
      step: '04',
      title: 'Track',
      description: 'Every treatment milestone is logged by treating hospitals and doctors, providing transparent update tracking.'
    }
  ];

  return (
    <section style={{ padding: '4.5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transparent Process
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            How LifeBridge Works
          </h2>
          <p style={{ color: '#64748b' }}>
            A structured four-step process built to maximize transparency, safety, and donor confidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', position: 'relative' }}>
          {steps.map((s, idx) => (
            <div key={s.step} className="card" style={{ position: 'relative', borderTop: '3px solid #1d4ed8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    backgroundColor: '#eff6ff',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    letterSpacing: '0.04em'
                  }}>
                    STEP {s.step}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="desktop-only" style={{ color: '#cbd5e1' }}>
                      <ArrowRight size={18} />
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: '#0f172a', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
