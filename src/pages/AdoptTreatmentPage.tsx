import React, { useState, useEffect } from 'react';
import { Activity, Stethoscope, Dna, HeartPulse, Pill, Apple, Search, X, ShieldCheck, Heart } from 'lucide-react';
import { DemoDonationModal } from '../components/modals/DemoDonationModal';
import { PatientCampaign } from '../types';
import { fetchPatientCampaigns } from '../services/api';

export const AdoptTreatmentPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<{ title: string; amount: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchPatientCampaigns().then(setCampaigns);
  }, []);

  const allNeeds = [
    {
      id: 'n1',
      title: 'Physiotherapy & Mobility Rehab',
      category: 'Rehabilitation',
      amount: 5000,
      description: 'Provides 1 month of specialized physical therapy to maintain motor function for rare disease patients.',
      icon: Activity
    },
    {
      id: 'n2',
      title: 'Diagnostic MRI / CT Scan',
      category: 'Diagnostics',
      amount: 8500,
      description: 'Covers high-resolution neuro-imaging scans required for treatment monitoring.',
      icon: Stethoscope
    },
    {
      id: 'n3',
      title: 'Whole Exome Genetic Test',
      category: 'Genetics',
      amount: 15000,
      description: 'Funds genetic variant sequencing necessary to confirm rare disease diagnoses.',
      icon: Dna
    },
    {
      id: 'n4',
      title: 'ICU High-Care Support Unit',
      category: 'Emergency',
      amount: 25000,
      description: 'Sponsors 1 day of pediatric ICU respiratory monitoring and specialized nursing.',
      icon: HeartPulse
    },
    {
      id: 'n5',
      title: 'Specialized Biologic Medication',
      category: 'Medication',
      amount: 12000,
      description: 'Provides monthly supportive medications and enzyme replacement infusions.',
      icon: Pill
    },
    {
      id: 'n6',
      title: 'Clinical Enteral Nutrition',
      category: 'Nutrition',
      amount: 4500,
      description: 'Supplies 1 month of specialized high-density clinical enteral supplements for infants.',
      icon: Apple
    }
  ];

  const categories = ['ALL', 'Rehabilitation', 'Diagnostics', 'Genetics', 'Emergency', 'Medication', 'Nutrition'];

  const filteredNeeds = allNeeds.filter(n => {
    const matchesCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main style={{ minHeight: '80vh', padding: '3.5rem 0 5rem', backgroundColor: '#f8fafc' }}>
      <div className="container">

        {/* HEADER */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Itemized Micro-Sponsorships
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Adopt a Specific Treatment Need
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            Directly sponsor itemized medical items verified by attending hospital accounts. Each sponsorship targets a specific clinical intervention with 0% platform commission.
          </p>
        </div>

        {/* SEARCH & CATEGORY CONTROLS */}
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
                placeholder="Search treatment needs (e.g. Genetic test, ICU, Nutrition)..."
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
                  border: selectedCategory === cat ? '1px solid #059669' : '1px solid #e2e8f0',
                  backgroundColor: selectedCategory === cat ? '#ecfdf5' : '#ffffff',
                  color: selectedCategory === cat ? '#047857' : '#475569',
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

        {/* RESULTS GRID */}
        {filteredNeeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>No treatment needs match your search or filter criteria.</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {filteredNeeds.map(n => {
              const IconComponent = n.icon;
              return (
                <div key={n.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={22} />
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '0.875rem' }}>
                        ₹{n.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {n.category}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', margin: '0.35rem 0 0.5rem', color: '#0f172a' }}>{n.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.5rem' }}>{n.description}</p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-emerald"
                    style={{ width: '100%', justifyContent: 'center', height: '44px', fontWeight: 700 }}
                    onClick={() => setSelectedNeed({ title: n.title, amount: n.amount })}
                  >
                    Support This Need (Demo) →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* DEMO SUPPORT MODAL */}
        <DemoDonationModal
          campaign={campaigns[0] || null}
          needItem={selectedNeed}
          isOpen={!!selectedNeed}
          onClose={() => setSelectedNeed(null)}
        />
      </div>
    </main>
  );
};
