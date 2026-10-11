import React, { useState } from 'react';
import {
  Dna,
  Activity,
  Droplets,
  Stethoscope,
  HeartPulse,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Info,
  FilePlus,
  ExternalLink
} from 'lucide-react';
import { PatientApplyModal } from '../components/modals/PatientApplyModal';

interface RareDiseasesPageProps {
  onNavigate: (tab: string) => void;
  onOpenPatientApply?: () => void;
}

interface DiseaseInfo {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  icon: any;
  color: string;
  bgColor: string;
  prevalence: string;
  clinicalPathway: string;
  nprdCoverage: string;
  diagnosticCriteria: string;
}

export const RareDiseasesPage: React.FC<RareDiseasesPageProps> = ({
  onNavigate,
  onOpenPatientApply
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalDisease, setActiveModalDisease] = useState<DiseaseInfo | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const diseases: DiseaseInfo[] = [
    {
      id: 'SMA',
      name: 'Spinal Muscular Atrophy (SMA)',
      category: 'Neuromuscular',
      shortDesc: 'A rare genetic neuromuscular condition causing progressive motor neuron degradation, hypotonia, and respiratory weakness.',
      icon: Dna,
      color: '#1d4ed8',
      bgColor: '#eff6ff',
      prevalence: 'Approx. 1 in 10,000 live births',
      clinicalPathway: 'Early genetic diagnosis (SMN1/SMN2 gene testing), disease-modifying therapies (gene therapy / SMN splicing modifiers), multidisciplinary physiotherapy, and pulmonary support.',
      nprdCoverage: 'Group 1 & Group 3 eligible under National Policy for Rare Diseases (NPRD 2021), with up to ₹50 Lakhs assistance at designated Centres of Excellence (CoEs).',
      diagnosticCriteria: 'MLPA or Next-Generation Sequencing (NGS) confirming homozygous deletion or mutation in SMN1 gene.'
    },
    {
      id: 'DMD',
      name: 'Duchenne Muscular Dystrophy (DMD)',
      category: 'Neuromuscular',
      shortDesc: 'A progressive X-linked genetic disorder characterized by absence of dystrophin, leading to muscle degeneration in young boys.',
      icon: Activity,
      color: '#059669',
      bgColor: '#ecfdf5',
      prevalence: 'Approx. 1 in 3,500 to 5,000 male births',
      clinicalPathway: 'Corticosteroid therapy, regular physical therapy, nocturnal ventilatory support, cardiac surveillance, and potential exon-skipping therapeutics.',
      nprdCoverage: 'Eligible for NPRD 2021 financial grant at Centre of Excellence hospitals.',
      diagnosticCriteria: 'Serum Creatine Kinase (CK) elevation and dystrophin gene deletion/duplication testing via MLPA.'
    },
    {
      id: 'Thalassemia',
      name: 'Thalassemia Major',
      category: 'Hematology',
      shortDesc: 'An inherited hemoglobin disorder resulting in severe microcytic anemia, chronic fatigue, and organ damage without regular blood transfusions.',
      icon: Droplets,
      color: '#dc2626',
      bgColor: '#fef2f2',
      prevalence: 'Approx. 10,000 to 12,000 infants born annually in India',
      clinicalPathway: 'Regular leucodepleted blood transfusions (every 2-4 weeks), iron chelation therapy to prevent cardiac iron overload, and curative Allogeneic Bone Marrow Transplant (BMT).',
      nprdCoverage: 'Group 2 disorder under NPRD 2021; eligible for BMT funding assistance under Rashtriya Arogya Nidhi (RAN) schemes.',
      diagnosticCriteria: 'High Performance Liquid Chromatography (HPLC) hemoglobin electrophoresis and beta-globin gene sequencing.'
    },
    {
      id: 'Pediatric Cancer',
      name: 'Pediatric Oncology',
      category: 'Oncology',
      shortDesc: 'Rare childhood solid tumors, neuroblastomas, and acute lymphoblastic leukemias requiring multi-agent oncology protocols.',
      icon: Stethoscope,
      color: '#d97706',
      bgColor: '#fffbeb',
      prevalence: 'Accounts for approx. 3-5% of total cancer incidences in India',
      clinicalPathway: 'Risk-stratified intensive multi-agent chemotherapy, precision surgical tumor resection, pediatric radiation therapy, and stem-cell salvage where indicated.',
      nprdCoverage: 'Covered under specialized pediatric oncology grants and hospital emergency assistance programs.',
      diagnosticCriteria: 'Bone marrow aspirate/biopsy, flow cytometry immunophenotyping, and high-resolution PET/CT staging.'
    },
    {
      id: 'Organ Transplant',
      name: 'Pediatric Organ Transplant',
      category: 'Transplants',
      shortDesc: 'End-stage liver or renal disease in infants and children requiring life-saving solid organ transplant surgery and immunosuppression.',
      icon: HeartPulse,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      prevalence: 'Significant cause of end-stage pediatric organ failure',
      clinicalPathway: 'Pediatric living-donor or deceased-donor transplant surgical procedure, intensive post-operative ICU care, and lifelong calcineurin inhibitor immunosuppressive therapy.',
      nprdCoverage: 'Eligible for hospital trust sponsorships, government health funds, and verified crowdfunding.',
      diagnosticCriteria: 'PELD/MELD scoring, pediatric nephrology clearance, and organ compatibility crossmatch.'
    },
    {
      id: 'Blood Disorders',
      name: 'Rare Hematological Disorders',
      category: 'Hematology',
      shortDesc: 'Aplastic anemia, hemophilia, and severe combined immunodeficiencies requiring specialized factor concentrates and immunotherapy.',
      icon: RefreshCw,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      prevalence: 'Rare (less than 5 cases per 100,000 individuals)',
      clinicalPathway: 'Replacement factor infusions, immunosuppressive therapy (ATG/Cyclosporine), immunoglobulin (IVIG) infusions, and bone marrow transplantation.',
      nprdCoverage: 'Supported through state hemophilia schemes and NPRD Centre of Excellence network.',
      diagnosticCriteria: 'Coagulation factor assays, bone marrow cellularity evaluation, and lymphocyte subpopulation flow cytometry.'
    }
  ];

  const categories = ['ALL', 'Neuromuscular', 'Hematology', 'Oncology', 'Transplants'];

  const filteredDiseases = diseases.filter(d => {
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyClick = () => {
    if (onOpenPatientApply) {
      onOpenPatientApply();
    } else {
      setApplyModalOpen(true);
    }
  };

  return (
    <main style={{ minHeight: '80vh', padding: '3.5rem 0 5rem', backgroundColor: '#f8fafc' }}>
      <div className="container">

        {/* PAGE HEADER */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clinical Directory & Support Pathways
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Rare Disease Care & Knowledge Base
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            Accurate clinical overviews and government NPRD policy details for conditions supported across LifeBridge India. Information is derived from national guidelines and verified medical literature.
          </p>
        </div>

        {/* SEARCH AND CATEGORY FILTER TOOLBAR */}
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
                placeholder="Search rare diseases (e.g. SMA, DMD, Thalassemia, Oncology)..."
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

        {/* RESULTS GRID */}
        {filteredDiseases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>No rare diseases match your search query.</p>
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
            {filteredDiseases.map(d => {
              const IconComponent = d.icon;
              return (
                <div key={d.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: d.bgColor,
                        color: d.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconComponent size={22} />
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {d.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>{d.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                      {d.shortDesc}
                    </p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#334155', marginBottom: '1.5rem' }}>
                      <strong>NPRD Policy Coverage:</strong> {d.nprdCoverage}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setActiveModalDisease(d)}
                    >
                      <Info size={14} /> Clinical Overview
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => onNavigate('patients')}
                    >
                      View Campaigns <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLINICAL OVERVIEW MODAL */}
        {activeModalDisease && (
          <div className="modal-overlay" onClick={() => setActiveModalDisease(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ padding: '0.4rem', borderRadius: '8px', backgroundColor: activeModalDisease.bgColor, color: activeModalDisease.color }}>
                    <activeModalDisease.icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{activeModalDisease.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{activeModalDisease.category} Specialty</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalDisease(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* MEDICAL DISCLAIMER */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', fontSize: '0.775rem', color: '#1e40af', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                <strong>Medical Safety Notice:</strong> Information provided is for educational reference under Indian Rare Disease guidelines. It does not replace clinical consultation by a certified medical specialist.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Estimated Clinical Prevalence:</strong>
                  <span style={{ color: '#475569' }}>{activeModalDisease.prevalence}</span>
                </div>

                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Standard Diagnostic Criteria:</strong>
                  <span style={{ color: '#475569' }}>{activeModalDisease.diagnosticCriteria}</span>
                </div>

                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Clinical Management Pathway:</strong>
                  <span style={{ color: '#475569', lineHeight: 1.55 }}>{activeModalDisease.clinicalPathway}</span>
                </div>

                <div>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Government Support (NPRD 2021):</strong>
                  <span style={{ color: '#047857', fontWeight: 600 }}>{activeModalDisease.nprdCoverage}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setActiveModalDisease(null); onNavigate('patients'); }}
                >
                  Find Verified Patients
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setActiveModalDisease(null); handleApplyClick(); }}
                >
                  <FilePlus size={16} /> Apply for Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT APPLICATION MODAL */}
        <PatientApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onNavigateToDashboard={() => onNavigate('dashboard')}
        />
      </div>
    </main>
  );
};
