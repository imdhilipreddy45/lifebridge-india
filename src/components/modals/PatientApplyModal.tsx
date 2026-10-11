import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, ShieldCheck, AlertCircle, FileText, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { db, auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { PatientCampaign } from '../../types';
import { submitPatientApplicationRemote, saveLocalApplication } from '../../services/api';

interface PatientApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard?: () => void;
  onOpenAuth?: (role?: 'PATIENT_FAMILY') => void;
}

export const PatientApplyModal: React.FC<PatientApplyModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDashboard,
  onOpenAuth
}) => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>(4);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [diseaseCategory, setDiseaseCategory] = useState<'SMA' | 'DMD' | 'Thalassemia' | 'Pediatric Cancer' | 'Organ Transplant' | 'Blood Disorders'>('SMA');
  const [treatingHospital, setTreatingHospital] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setError('Maximum file size allowed is 15 MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName.trim()) {
      setError('Patient Full Name is required.');
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError('City and State are required for medical centre routing.');
      return;
    }
    if (!treatingHospital.trim()) {
      setError('Treating Hospital is required for independent verification audits.');
      return;
    }
    if (!attendingDoctor.trim()) {
      setError('Attending Doctor or Medical Specialist name is required.');
      return;
    }
    if (!targetAmount || Number(targetAmount) < 1000) {
      setError('Please specify a valid estimated treatment amount (minimum ₹1,000).');
      return;
    }
    if (!consentGiven) {
      setError('You must confirm consent for medical verification audits.');
      return;
    }

    setLoading(true);

    const newApplicationRecord = {
      patientName: patientName.trim(),
      age: Number(age) || 0,
      city: city.trim(),
      state: state.trim(),
      diseaseCategory,
      targetAmount: Number(targetAmount),
      raisedAmount: 0,
      treatingHospital: treatingHospital.trim(),
      attendingDoctor: attendingDoctor.trim(),
      status: "SUBMITTED" as const,
      documentFileName: selectedFile ? selectedFile.name : "diagnostic_estimate_pending.pdf",
      // Non-negotiable: Never falsely claim verified status upon submission
      verification: {
        identityVerified: false,
        medicalReportsVerified: false,
        hospitalDeskVerified: false,
        doctorVerificationCompleted: false,
        treatmentEstimateVerified: false,
        hopeScorePercentage: 15,
        lastReviewedAt: new Date().toISOString(),
        reviewedByRole: "PATIENT_FAMILY" as const,
        disclaimer: "Initial application submitted. Independent verification audits pending by hospital desk and medical board."
      },
      milestones: [
        {
          id: 'm1',
          stageName: 'Support Application Submitted',
          date: new Date().toISOString().split('T')[0],
          completed: true,
          notes: 'Application registered in platform intake queue.'
        },
        {
          id: 'm2',
          stageName: 'Hospital Desk & Doctor Verification',
          date: 'Pending Audit',
          completed: false,
          notes: 'Documents will be audited by attending clinical specialist.'
        }
      ],
      summary: summary.trim() || `Patient support application submitted for ${diseaseCategory} medical care at ${treatingHospital.trim()}.`,
      createdAt: new Date().toISOString()
    };

    try {
      if (auth.currentUser && (currentRole === 'PATIENT_FAMILY' || currentRole === 'ADMIN')) {
        // Shared remote persistence in Firestore private collection
        const remoteResult = await submitPatientApplicationRemote(newApplicationRecord);
        setSubmittedApplication(remoteResult);
      } else if (!auth.currentUser) {
        throw new Error('Authentication required. Please sign in as a Patient / Family Member to submit your application.');
      } else {
        throw new Error(`Current role '${currentRole}' cannot submit patient applications. Only PATIENT_FAMILY accounts can submit.`);
      }
    } catch (err: any) {
      console.error('Remote patient application submission error:', err);
      setError(`Remote Firestore persistence denied/failed: ${err?.message || 'Network or permissions error'}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocalFallback = () => {
    const localId = 'app_local_' + Date.now();
    const userId = auth.currentUser ? auth.currentUser.uid : 'anon';
    const localRecord = {
      id: localId,
      userId,
      patientName: patientName.trim(),
      age: Number(age) || 0,
      city: city.trim(),
      state: state.trim(),
      diseaseCategory,
      targetAmount: Number(targetAmount),
      raisedAmount: 0,
      treatingHospital: treatingHospital.trim(),
      attendingDoctor: attendingDoctor.trim(),
      status: "SUBMITTED" as const,
      documentFileName: selectedFile ? selectedFile.name : "diagnostic_estimate_pending.pdf",
      summary: summary.trim() || `Patient support application submitted for ${diseaseCategory} medical care at ${treatingHospital.trim()}.`,
      createdAt: new Date().toISOString(),
      isLocal: true,
      isRemote: false,
      persistenceType: 'LOCAL_DEMO',
      storageNotice: 'Saved to local browser sandbox (pilot demonstration only — not shared with administrators)'
    };
    saveLocalApplication(localRecord);
    setSubmittedApplication(localRecord);
    setError(null);
  };

  const handleReset = () => {
    setSubmittedApplication(null);
    setPatientName('');
    setAge(4);
    setCity('');
    setState('');
    setTreatingHospital('');
    setAttendingDoctor('');
    setTargetAmount('');
    setSummary('');
    setSelectedFile(null);
    setConsentGiven(false);
    setError(null);
    onClose();
  };

  const handleGoToDashboard = () => {
    handleReset();
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleReset}
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-apply-title"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 id="patient-apply-title" style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
              Apply for Patient Support
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              5-Stage Multi-Stakeholder Verification Framework
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close application modal"
          >
            <X size={20} />
          </button>
        </div>

        {submittedApplication ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: submittedApplication.isRemote ? '#ecfdf5' : '#fffbeb',
              color: submittedApplication.isRemote ? '#059669' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              {submittedApplication.isRemote ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
            </div>
            <h4 style={{
              color: submittedApplication.isRemote ? '#047857' : '#b45309',
              fontSize: '1.3rem',
              marginBottom: '0.5rem',
              fontWeight: 700
            }}>
              {submittedApplication.isRemote
                ? 'Application Persisted to Remote Firestore'
                : 'Application Saved Locally (Sandbox Demo Only)'}
            </h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Your application for <strong style={{ color: '#0f172a' }}>{submittedApplication.patientName}</strong> has been {submittedApplication.isRemote ? 'securely stored in Cloud Firestore' : 'saved to this browser sandbox'} with Case ID <strong style={{ color: '#1d4ed8' }}>{submittedApplication.id}</strong>.
            </p>

            <div style={{
              backgroundColor: submittedApplication.isRemote ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${submittedApplication.isRemote ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{
                fontWeight: 700,
                color: submittedApplication.isRemote ? '#166534' : '#92400e',
                marginBottom: '0.5rem'
              }}>
                {submittedApplication.isRemote ? 'Shared Persistence Confirmation (Spark Plan):' : 'Controlled Local Pilot Disclosure:'}
              </div>
              <ul style={{
                paddingLeft: '1.25rem',
                margin: 0,
                color: submittedApplication.isRemote ? '#15803d' : '#78350f',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                {submittedApplication.isRemote ? (
                  <>
                    <li>Record securely written to Firestore private collection <code>patientApplications</code>.</li>
                    <li>Restricted to your authenticated UID ({auth.currentUser?.email}) and authorized reviewers.</li>
                    <li>Persists across browser sessions and devices. You can track this case in your dashboard.</li>
                    <li>Document metadata attached: <strong>{submittedApplication.documentFileName}</strong>.</li>
                  </>
                ) : (
                  <>
                    <li>This application is stored locally in this browser sandbox only.</li>
                    <li>Under the Firebase Spark pilot tier, data was not transmitted to remote servers.</li>
                    <li>It has NOT reached remote administrators or hospital desks.</li>
                    <li>You can view and simulate this case locally in your current browser session.</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleReset}
              >
                Close Window
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleGoToDashboard}
              >
                Track in Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ROLE / AUTH NOTICE */}
            {!isAuthenticated && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div style={{ color: '#1e40af' }}>
                  <strong>Account Link Notice:</strong> You can submit now, or sign in as a Patient / Family Member to link this application directly to your verified profile.
                </div>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAuth('PATIENT_FAMILY'); }}
                    className="btn btn-primary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            {/* PATIENT NAME & AGE */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="e.g. Master Aarav Sharma"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Age (Years) *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 4"
                  min={0}
                  max={120}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* LOCATION: CITY & STATE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  State *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* DISEASE CATEGORY & ESTIMATED AMOUNT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Rare Disease Category *
                </label>
                <select
                  value={diseaseCategory}
                  onChange={e => setDiseaseCategory(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.875rem' }}
                >
                  <option value="SMA">Spinal Muscular Atrophy (SMA)</option>
                  <option value="DMD">Duchenne Muscular Dystrophy (DMD)</option>
                  <option value="Thalassemia">Thalassemia Major</option>
                  <option value="Pediatric Cancer">Pediatric Cancer</option>
                  <option value="Organ Transplant">Organ Transplant</option>
                  <option value="Blood Disorders">Blood Disorders</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Estimated Need (₹) *
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="e.g. 1500000"
                  required
                  min={1000}
                  max={250000000}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* TREATING HOSPITAL & DOCTOR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Treating Hospital *
                </label>
                <input
                  type="text"
                  value={treatingHospital}
                  onChange={e => setTreatingHospital(e.target.value)}
                  placeholder="e.g. AIIMS / Manipal Hospital"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Attending Doctor / Neurologist *
                </label>
                <input
                  type="text"
                  value={attendingDoctor}
                  onChange={e => setAttendingDoctor(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* MEDICAL CASE SUMMARY */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Clinical Summary / Current Medical Status
              </label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Briefly describe patient condition, current treatment stage, and hospital recommendations..."
                rows={3}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            {/* REAL FILE UPLOAD FIELD */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <input
                ref={fileInputRef}
                type="file"
                id="medical-doc-file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <FileText size={28} color="#059669" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for secure audit upload</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={28} color="#64748b" style={{ marginBottom: '0.4rem', display: 'inline-block' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                    Upload Diagnostic Report & Hospital Cost Estimate
                  </div>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    PDF, JPG, or PNG up to 15MB. Files are protected under restricted storage path <code>/medical_reports/</code>.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Document File
                  </button>
                </div>
              )}
            </div>

            {/* MANDATORY CONSENT CHECKBOX */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#334155', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={e => setConsentGiven(e.target.checked)}
                  required
                  style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: '#1d4ed8' }}
                />
                <span>
                  <strong>Patient Privacy & Audit Consent:</strong> I confirm that the medical documents provided are authentic. I give consent for LifeBridge India and treating hospital verification desks to audit these records for verified medical campaign support.
                </span>
              </label>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <AlertCircle size={16} color="#dc2626" /> Remote Submission Error
                </div>
                <div style={{ marginBottom: '0.75rem', lineHeight: 1.45 }}>{error}</div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleSaveLocalFallback}
                  style={{ fontSize: '0.8rem', backgroundColor: '#ffffff', borderColor: '#fca5a5', color: '#b91c1c' }}
                >
                  Save as Local Browser Draft (Demo Only)
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleReset}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {loading ? 'Registering Application...' : 'Submit for Hospital Desk Audit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
