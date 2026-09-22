import React, { useState } from 'react';
import { PatientCampaign } from '../../types';
import { ShieldCheck, Info, Heart, ChevronRight } from 'lucide-react';

interface PatientCampaignsGridProps {
  campaigns: PatientCampaign[];
  onSelectCampaign: (campaign: PatientCampaign) => void;
  onDonateCampaign: (campaign: PatientCampaign) => void;
}

export const PatientCampaignsGrid: React.FC<PatientCampaignsGridProps> = ({
  campaigns,
  onSelectCampaign,
  onDonateCampaign
}) => {
  const [activeTrustDrawer, setActiveTrustDrawer] = useState<PatientCampaign | null>(null);

  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} Lakhs`;
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified Support Needs
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Verified Patient Campaigns
          </h2>
          <p style={{ color: '#64748b' }}>
            Every campaign has completed independent document reviews by attending doctors and partner hospital desks.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '540px', margin: '0 auto' }}>
            <ShieldCheck size={40} color="#64748b" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.35rem' }}>No Active Campaigns Available</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              No verified support campaigns are currently available.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {campaigns.map(c => {
              const percent = Math.min(100, Math.round((c.raisedAmount / (c.targetAmount || 1)) * 100));
              return (
                <div key={c.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge badge-emerald">
                        <ShieldCheck size={14} /> {c.verification?.hopeScorePercentage ? `${c.verification.hopeScorePercentage}% Hope Score` : 'Verification Active'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{c.diseaseCategory}</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: '#0f172a' }}>{c.patientName}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Age {c.age} • {c.city}, {c.state}
                    </p>

                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {c.summary}
                    </p>

                    {/* HOPE SCORE VERIFICATION BADGES */}
                    <div style={{
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>Hope Verification Audit</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveTrustDrawer(c); }}
                          style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          Why Verified?
                        </button>
                      </div>
                      <div style={{ color: '#059669', fontWeight: 600 }}>
                        Identity ✓ • Medical ✓ • Doctor ✓ • Hospital ✓ • Estimate ✓
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <span style={{ color: '#0f172a' }}>{formatCurrency(c.raisedAmount || 0)} Raised</span>
                        <span style={{ color: '#64748b' }}>Goal: {formatCurrency(c.targetAmount || 0)}</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#059669' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => onSelectCampaign(c)}
                    >
                      View Campaign
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => onDonateCampaign(c)}
                    >
                      Support <Heart size={16} color="#ffffff" fill="#ffffff" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRUST EXPLANATION MODAL DRAWER */}
      {activeTrustDrawer && (
        <div className="modal-overlay" onClick={() => setActiveTrustDrawer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck color="#059669" size={24} />
                <h3 style={{ margin: 0 }}>Why is this campaign verified?</h3>
              </div>
              <button onClick={() => setActiveTrustDrawer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
              Verification for <strong>{activeTrustDrawer.patientName}</strong> ({activeTrustDrawer.diseaseCategory}) confirms that listed documents have undergone independent human review:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={trustItemStyle}>
                <strong>Identity Proof:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED (Admin Desk)</span>
              </div>
              <div style={trustItemStyle}>
                <strong>Medical Reports:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED (Pediatric Neurologist)</span>
              </div>
              <div style={trustItemStyle}>
                <strong>Hospital Partner:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED ({activeTrustDrawer.treatingHospital})</span>
              </div>
              <div style={trustItemStyle}>
                <strong>Doctor Desk:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED ({activeTrustDrawer.attendingDoctor})</span>
              </div>
              <div style={trustItemStyle}>
                <strong>Treatment Estimate:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>VERIFIED (Hospital Accounts)</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '1.25rem' }}>
              <strong>Medical Disclaimer:</strong> Verification confirms that listed information and documents have undergone review. It does not guarantee treatment outcome or medical success.
            </div>

            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTrustDrawer(null)}>
              Close Audit Details
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const trustItemStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};
