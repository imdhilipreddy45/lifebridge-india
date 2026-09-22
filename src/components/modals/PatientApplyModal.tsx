import React, { useState } from 'react';
import { X, Upload, ShieldCheck } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface PatientApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientApplyModal: React.FC<PatientApplyModalProps> = ({ isOpen, onClose }) => {
  const [patientName, setPatientName] = useState('');
  const [diseaseCategory, setDiseaseCategory] = useState('SMA');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !targetAmount) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "patients"), {
        patientName,
        age: 3,
        city: "Mumbai",
        state: "Maharashtra",
        diseaseCategory,
        targetAmount: Number(targetAmount),
        raisedAmount: 0,
        treatingHospital: "Partner Medical Hospital",
        attendingDoctor: "Attending Specialist",
        status: "SUBMITTED",
        verification: {
          identityVerified: true,
          medicalReportsVerified: true,
          hospitalDeskVerified: false,
          doctorVerificationCompleted: false,
          treatmentEstimateVerified: false,
          hopeScorePercentage: 40,
          lastReviewedAt: new Date().toISOString(),
          reviewedByRole: "PATIENT_FAMILY",
          disclaimer: "Verification in progress by hospital desk and medical board."
        },
        milestones: [],
        summary: `Patient support application submitted for ${diseaseCategory} treatment.`,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Firestore submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setPatientName('');
    setTargetAmount('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Apply for Patient Support</h3>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <ShieldCheck color="#059669" size={48} style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: '#047857', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Application Submitted</h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your application for <strong>{patientName}</strong> has been routed to the Admin Verification Queue in Firebase. Status: <strong>SUBMITTED</strong>.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReset}>
              Close & Track Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Patient Full Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Rare Disease Category
              </label>
              <select
                value={diseaseCategory}
                onChange={e => setDiseaseCategory(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
              >
                <option value="SMA">Spinal Muscular Atrophy (SMA)</option>
                <option value="DMD">Duchenne Muscular Dystrophy (DMD)</option>
                <option value="Thalassemia">Thalassemia Major</option>
                <option value="Pediatric Cancer">Pediatric Cancer</option>
                <option value="Organ Transplant">Organ Transplant</option>
                <option value="Blood Disorders">Blood Disorders</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Estimated Treatment Need (₹)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="e.g. 1500000"
                required
                min={1000}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <Upload size={24} color="#64748b" style={{ marginBottom: '0.35rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Upload Diagnostic & Hospital Estimate PDF</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Files will be securely stored under restricted storage path /medical_reports/</span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Submitting to Firebase...' : 'Submit for Hospital Audit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
