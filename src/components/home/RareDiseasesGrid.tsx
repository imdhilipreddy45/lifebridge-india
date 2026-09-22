import React from 'react';
import { ArrowUpRight, Activity, Dna, Droplets, Stethoscope, HeartPulse, RefreshCw } from 'lucide-react';

interface RareDiseasesGridProps {
  onSelectCategory: (cat: string) => void;
}

export const RareDiseasesGrid: React.FC<RareDiseasesGridProps> = ({ onSelectCategory }) => {
  const diseases = [
    {
      id: 'SMA',
      name: 'Spinal Muscular Atrophy (SMA)',
      shortDesc: 'A rare genetic neuromuscular disease affecting motor neurons, requiring specialized gene therapy or targeted protein therapy.',
      icon: Dna,
      color: '#1d4ed8',
      bgColor: '#eff6ff'
    },
    {
      id: 'DMD',
      name: 'Duchenne Muscular Dystrophy (DMD)',
      shortDesc: 'A progressive muscle-wasting genetic condition affecting young children, managed with exon skipping and physical rehab.',
      icon: Activity,
      color: '#059669',
      bgColor: '#ecfdf5'
    },
    {
      id: 'Thalassemia',
      name: 'Thalassemia Major',
      shortDesc: 'An inherited blood disorder requiring lifelong blood transfusions or curative Bone Marrow Transplants (BMT).',
      icon: Droplets,
      color: '#dc2626',
      bgColor: '#fef2f2'
    },
    {
      id: 'Pediatric Cancer',
      name: 'Pediatric Oncology',
      shortDesc: 'Rare pediatric leukemias and solid tumors requiring multi-stage chemotherapy, radiation, or surgical intervention.',
      icon: Stethoscope,
      color: '#d97706',
      bgColor: '#fffbeb'
    },
    {
      id: 'Organ Transplant',
      name: 'Pediatric Organ Transplant',
      shortDesc: 'Life-saving pediatric liver, kidney, or heart transplant procedures requiring urgent specialized surgical support.',
      icon: HeartPulse,
      color: '#7c3aed',
      bgColor: '#f5f3ff'
    },
    {
      id: 'Blood Disorders',
      name: 'Rare Hematological Disorders',
      shortDesc: 'Aplastic anemia, hemophilia, and rare immune deficiencies requiring blood component support and targeted biologics.',
      icon: RefreshCw,
      color: '#0284c7',
      bgColor: '#f0f9ff'
    }
  ];

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Rare Disease Focus
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Specialized Disease Categories
          </h2>
          <p style={{ color: '#64748b' }}>
            Dedicated support workflows tailored for high-impact rare conditions and complex pediatric care.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {diseases.map(d => {
            const IconComponent = d.icon;
            return (
              <div key={d.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: d.bgColor,
                    color: d.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <IconComponent size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>{d.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>{d.shortDesc}</p>
                </div>
                <button
                  onClick={() => onSelectCategory(d.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: d.color,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Learn More & View Campaigns <ArrowUpRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
