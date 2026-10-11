import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  X,
  FilePlus,
  Heart,
  Building2,
  UserCheck,
  Clock,
  ArrowRight,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientApplyModal } from '../components/modals/PatientApplyModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

interface PatientDirectoryPageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth?: (role?: 'PATIENT_FAMILY') => void;
}

export const PatientDirectoryPage: React.FC<PatientDirectoryPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState<PatientCampaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<PatientCampaign | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const loadAllCampaigns = async () => {
    setLoading(true);
    try {
      // Load verified public campaigns from verified storage
      const live = await fetchPatientCampaigns();
      setCampaigns(live);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCampaigns();
  }, []);

  const categories = ['ALL', 'SMA', 'DMD', 'Thalassemia', 'Pediatric Cancer', 'Organ Transplant', 'Blood Disorders'];

  const filteredCampaigns = campaigns.filter(c => {
    const matchesCategory = selectedCategory === 'ALL' || c.diseaseCategory === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.treatingHospital && c.treatingHospital.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.summary && c.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (amt: number) => {
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} Lakhs`;
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <main style={{ minHeight: '80vh', padding: '3.5rem 0 5rem', backgroundColor: '#f8fafc' }}>
      <div className="container">

        {/* HEADER BAR WITH APPLY CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Support Directory
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Patient Support Directory
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '580px' }}>
              Browse verified medical campaigns for rare disease treatments. Every case undergoes multi-stage hospital desk audits.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.925rem' }}
            onClick={() => setApplyModalOpen(true)}
          >
            <FilePlus size={18} /> Apply for Patient Support
          </button>
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '2.5rem',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {/* SEARCH INPUT */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, city, or hospital..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* RESET BUTTON */}
            {(selectedCategory !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="btn btn-outline btn-sm"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: selectedCategory === cat ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === cat ? '#eff6ff' : '#ffffff',
                  color: selectedCategory === cat ? '#1d4ed8' : '#475569',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPAIGNS GRID / EMPTY STATE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Loading patient campaigns from Firebase...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '560px', margin: '0 auto', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 700 }}>
              {searchQuery || selectedCategory !== 'ALL' ? 'No Matching Campaigns Found' : 'No Public Campaigns Currently Active'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your search keywords or resetting category filters.'
                : 'All campaigns undergo strict human document review and hospital desk verification before public listing. If you or a family member requires medical support, submit an application.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {(searchQuery || selectedCategory !== 'ALL') ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setApplyModalOpen(true)}
              >
                <FilePlus size={16} /> Apply for Patient Support
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {filteredCampaigns.map(c => {
              const percent = Math.min(100, Math.round(((c.raisedAmount || 0) / (c.targetAmount || 1)) * 100));
              return (
                <div key={c.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge badge-emerald">
                        <ShieldCheck size={14} /> {c.verification?.hopeScorePercentage ? `${c.verification.hopeScorePercentage}% Hope Score` : `${c.status || 'Verified'}`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{c.diseaseCategory}</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: '#0f172a' }}>{c.patientName}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Age {c.age} • {c.city}{c.state ? `, ${c.state}` : ''}
                    </p>

                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {c.summary}
                    </p>

                    <div style={{
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                        Hospital: {c.treatingHospital || 'Partner Hospital Desk'}
                      </div>
                      <div style={{ color: '#059669', fontWeight: 600 }}>
                        Doctor: {c.attendingDoctor || 'Attending Clinical Specialist'}
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
                      type="button"
                      className="btn btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setViewingCampaign(c)}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setSelectedDonationCampaign(c)}
                    >
                      Support <Heart size={16} color="#ffffff" fill="#ffffff" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CAMPAIGN DETAILS MODAL */}
        {viewingCampaign && (
          <div className="modal-overlay" onClick={() => setViewingCampaign(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{viewingCampaign.patientName}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
                    Age {viewingCampaign.age} • {viewingCampaign.diseaseCategory} • {viewingCampaign.city}, {viewingCampaign.state}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCampaign(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {viewingCampaign.summary}
              </p>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Treating Hospital:</span>
                  <strong style={{ color: '#0f172a' }}>{viewingCampaign.treatingHospital}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Attending Doctor:</span>
                  <strong style={{ color: '#0f172a' }}>{viewingCampaign.attendingDoctor}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Application Status:</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>{viewingCampaign.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Target Treatment Estimate:</span>
                  <strong style={{ color: '#047857' }}>₹{viewingCampaign.targetAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* VERIFICATION CHECKLIST OVERVIEW */}
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065f46', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <ShieldCheck size={16} /> Hope Verification Review
                </div>
                <div style={{ color: '#047857' }}>
                  {viewingCampaign.verification?.disclaimer || "Multi-stakeholder review by hospital accounts and attending physician."}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setViewingCampaign(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const c = viewingCampaign;
                    setViewingCampaign(null);
                    setSelectedDonationCampaign(c);
                  }}
                >
                  Support This Case <Heart size={16} color="#ffffff" fill="#ffffff" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEMO DONATION MODAL */}
        <DemoDonationModal
          campaign={selectedDonationCampaign}
          isOpen={!!selectedDonationCampaign}
          onClose={() => setSelectedDonationCampaign(null)}
        />

        {/* PATIENT APPLICATION MODAL */}
        <PatientApplyModal
          isOpen={applyModalOpen}
          onClose={() => { setApplyModalOpen(false); loadAllCampaigns(); }}
          onNavigateToDashboard={() => onNavigate('dashboard')}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </main>
  );
};
