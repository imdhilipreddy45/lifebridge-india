import React from 'react';
import { Activity, Stethoscope, Dna, HeartPulse, Pill, Apple } from 'lucide-react';

interface AdoptTreatmentGridProps {
  onAdoptNeed: (needTitle: string, amount: number) => void;
}

export const AdoptTreatmentGrid: React.FC<AdoptTreatmentGridProps> = ({ onAdoptNeed }) => {
  const needs = [
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

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Micro-Sponsorships
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Adopt a Specific Treatment Need
          </h2>
          <p style={{ color: '#64748b' }}>
            Sponsor specific, itemized medical items directly verified by treating hospital desks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {needs.map(n => {
            const IconComponent = n.icon;
            return (
              <div key={n.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={20} />
                    </div>
                    <span className="badge badge-emerald">₹{n.amount.toLocaleString('en-IN')}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#0f172a' }}>{n.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>{n.description}</p>
                </div>

                <button
                  className="btn btn-emerald"
                  style={{ width: '100%', justifyContent: 'center', height: '44px', fontWeight: 700 }}
                  onClick={() => onAdoptNeed(n.title, n.amount)}
                >
                  Support This Need →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
