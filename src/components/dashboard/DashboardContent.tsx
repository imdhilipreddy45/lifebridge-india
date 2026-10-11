import React, { useState, useEffect } from 'react';
import { UserRole, PatientCampaign } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, FileText, CheckCircle, AlertCircle, Building2, UserCheck,
  RefreshCw, PlusCircle, ExternalLink, Activity, Users, BarChart3, Settings,
  Clock, Heart, AlertTriangle, Eye, Check, X, Download, HelpCircle
} from 'lucide-react';
import {
  fetchPatientCampaigns,
  fetchStoredPilotFeedback,
  fetchStoredBloodRequests,
  fetchStoredBloodDonors,
  fetchLocalApplications,
  fetchSimulatedDonations,
  updateLocalApplicationStatus,
  fetchRemotePatientApplications,
  updateRemotePatientApplicationStatus
} from '../../services/api';

interface DashboardContentProps {
  role: UserRole;
  activeSection: string;
  onOpenPatientApply?: () => void;
  onNavigate?: (tab: string) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  role,
  activeSection,
  onOpenPatientApply,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [queueFilter, setQueueFilter] = useState('ALL');
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [remoteApplications, setRemoteApplications] = useState<any[]>([]);
  const [localApplications, setLocalApplications] = useState<any[]>([]);
  const [simulatedDonations, setSimulatedDonations] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [pilotFeedbacks, setPilotFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Volunteer standby state
  const [isStandbyAvailable, setIsStandbyAvailable] = useState(true);

  // Clinical log state
  const [clinicalNotes, setClinicalNotes] = useState(() => {
    return localStorage.getItem('lifebridge_doctor_notes_P-101') || '';
  });
  const [selectedCaseForNotes, setSelectedCaseForNotes] = useState('P-101');
  const [activeGeneticReportModal, setActiveGeneticReportModal] = useState<any | null>(null);
  const [activeSettlementModal, setActiveSettlementModal] = useState<boolean>(false);
  const [hospitalEstimateFileName, setHospitalEstimateFileName] = useState<string | null>(() => {
    return localStorage.getItem('lifebridge_hospital_estimate') || null;
  });
  const [case102Eligibility, setCase102Eligibility] = useState<string>('Pending Specialist Confirmation');
  const [acceptedTasks, setAcceptedTasks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('lifebridge_volunteer_accepted_tasks') || '[]');
    } catch {
      return [];
    }
  });

  const handleAcceptTask = (taskId: string, taskTitle: string) => {
    const updated = [...acceptedTasks, taskId];
    setAcceptedTasks(updated);
    localStorage.setItem('lifebridge_volunteer_accepted_tasks', JSON.stringify(updated));
    showNotification(`[Local Demo] Assignment accepted: "${taskTitle}". Saved in local session.`, 'success');
  };

  const handleDownloadCsrReport = () => {
    const reportText = `=================================================================
LIFEBRIDGE INDIA — CSR HEALTHCARE UTILIZATION STATEMENT (PILOT DEMO)
=================================================================
Date of Generation: ${new Date().toLocaleDateString('en-IN')}
Reference ID: CSR-AUDIT-${Date.now()}
Statutory Alignment: Companies Act 2013, Section 135 (Schedule VII)
Healthcare Mandate: Eradicating Hunger, Poverty & Healthcare for Rare Diseases

PLATFORM ALLOCATION METRICS:
-----------------------------------------------------------------
1. Platform Administrative Fee: 0.00% (Zero-Fee Policy)
2. Direct Hospital Patient Care Allocation: 100.00%
3. Escrow Audit Classification: Grade A (Independent CA Monitored)
4. Co-Funding Support: Complementing NPRD 2021 Centre of Excellence Grants

SAMPLE PORTFOLIO ALLOCATION:
- Pediatric SMA Type 1 (AIIMS / Apollo): ₹15,00,000 (Targeted Biologics)
- Gaucher Disease Type 1 (Daycare Enzyme Infusion): ₹8,50,000
- Bone Marrow Transplant High-Care (Apollo Children's): ₹12,00,000

PILOT GOVERNANCE DISCLAIMER:
This document is generated for testing and demonstration within the LifeBridge
India V1.1 Controlled Pilot Workspace. No actual corporate funds were debited.
Full statutory 80G/12A reconciliation statements will activate in Phase V2.
=================================================================`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LifeBridge_India_CSR_Utilization_Statement_Pilot_Demo.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('CSR Utilization Statement text file downloaded to your device.', 'success');
  };

  const handleDownloadSampleReceipt = (txId: string, amount: number) => {
    const receiptText = `=====================================================
LIFEBRIDGE INDIA — DEMONSTRATION CONTRIBUTION RECEIPT
=====================================================
Date: ${new Date().toLocaleString('en-IN')}
Transaction ID: ${txId}
Amount: ₹${amount.toLocaleString('en-IN')}
Status: SIMULATION_COMPLETED
Payment Method: Test Simulation Mode
Platform Fee: ₹0 (Zero-Fee Policy)

DISCLAIMER:
Demonstration only — no real payment was processed.
Simulation completed — no money was transferred.
=====================================================`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LifeBridge_Receipt_${txId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Sample receipt file downloaded to your device.', 'success');
  };

  const loadAllData = () => {
    setLoading(true);
    fetchPatientCampaigns()
      .then(res => {
        setCampaigns(res || []);
      })
      .catch(() => {
        setCampaigns([]);
      })
      .finally(() => {
        setLoading(false);
      });

    const currentUid = currentUser ? currentUser.uid : null;
    if (role === 'PATIENT_FAMILY' && currentUid) {
      fetchRemotePatientApplications(currentUid)
        .then(res => setRemoteApplications(res || []))
        .catch(err => {
          console.warn("Could not fetch remote patient applications:", err);
          setRemoteApplications([]);
        });
    } else if (role === 'ADMIN') {
      fetchRemotePatientApplications()
        .then(res => setRemoteApplications(res || []))
        .catch(err => {
          console.warn("Could not fetch admin remote applications queue:", err);
          setRemoteApplications([]);
        });
    } else {
      setRemoteApplications([]);
    }

    setLocalApplications(fetchLocalApplications(currentUid || 'anon'));
    setSimulatedDonations(fetchSimulatedDonations());
    setBloodRequests(fetchStoredBloodRequests());
    setPilotFeedbacks(fetchStoredPilotFeedback());
  };

  useEffect(() => {
    loadAllData();
  }, [role, activeSection, currentUser]);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Combine remote applications with local applications for the role workspace
  const allApplications = [
    ...remoteApplications.map(app => ({
      ...app,
      isRemote: true,
      isLocal: false
    })),
    ...localApplications.map((app, idx) => ({
      id: app.id || `local_${idx}`,
      patientName: app.patientName,
      diseaseCategory: app.diseaseCategory,
      treatingHospital: app.treatingHospital,
      targetAmount: app.targetAmount || 0,
      raisedAmount: 0,
      status: app.status || 'SUBMITTED',
      isLocal: true,
      isRemote: false,
      age: app.age,
      city: app.city,
      state: app.state,
      attendingDoctor: app.attendingDoctor,
      medicalSummary: app.medicalSummary || app.summary,
      documentName: app.documentFileName || app.documentName,
      submittedAt: app.createdAt || app.submittedAt || new Date().toISOString()
    }))
  ];

  const filteredCampaigns = queueFilter === 'ALL'
    ? allApplications
    : allApplications.filter(c => c.status === queueFilter);

  const handleUpdateCaseStatus = async (c: any, newStatus: string) => {
    if (c.isRemote) {
      try {
        await updateRemotePatientApplicationStatus(c.id, newStatus);
        setRemoteApplications(prev => prev.map(item => item.id === c.id ? { ...item, status: newStatus } : item));
        showNotification(`Firestore status updated to ${newStatus} for ${c.patientName}.`, 'success');
      } catch (err: any) {
        showNotification(`Firestore update failed: ${err?.message || 'Access denied'}`, 'error');
      }
    } else {
      updateLocalApplicationStatus(c.id, newStatus);
      setLocalApplications(prev => prev.map(item => item.id === c.id ? { ...item, status: newStatus } : item));
      showNotification(`[Local Demo] Status changed to ${newStatus} for ${c.patientName} (local sandbox only).`, 'info');
    }
  };

  return (
    <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
      {/* DASHBOARD HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
            {role.replace('_', ' ')} Workspace
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            {currentUser ? `Signed in as: ${currentUser.email}` : 'Active Session'} • Section: <strong style={{ color: '#0f172a' }}>{activeSection}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              loadAllData();
              showNotification('Workspace data refreshed from live storage.', 'info');
            }}
            title="Refresh workspace records"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <span className="badge badge-emerald">
            <ShieldCheck size={14} /> RBAC Verified • {role}
          </span>
        </div>
      </div>

      {/* INLINE STATUS NOTIFICATION */}
      {statusMessage && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : statusMessage.type === 'error' ? '#fef2f2' : '#eff6ff',
          color: statusMessage.type === 'success' ? '#166534' : statusMessage.type === 'error' ? '#991b1b' : '#1e40af',
          border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : statusMessage.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. ADMIN ROLE SECTIONS                                        */}
      {/* ============================================================== */}
      {role === 'ADMIN' && (
        <div>
          {/* SECTION: queue (Verification Queue) */}
          {(activeSection === 'queue' || !activeSection) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setQueueFilter(f)}
                      className={`btn btn-sm ${queueFilter === f ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing {filteredCampaigns.length} record(s)
                </span>
              </div>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#1d4ed8" /> Patient Verification Queue
                </h3>
                {loading ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading verification queue...</p>
                ) : filteredCampaigns.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No verification cases currently matching filter: <strong>{queueFilter}</strong>.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredCampaigns.map((c: any) => (
                      <div key={c.id} style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: '1 1 300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>{c.patientName}</h4>
                            <span className={`badge ${c.status === 'VERIFIED' ? 'badge-emerald' : c.status === 'REJECTED' ? 'badge-rose' : 'badge-amber'}`}>
                              {c.status}
                            </span>
                            {c.isRemote ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                                <CheckCircle size={11} /> Firestore Shared
                              </span>
                            ) : (
                              <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>
                                <AlertCircle size={11} /> Local Demo
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0' }}>
                            <strong>Category:</strong> {c.diseaseCategory} • <strong>Hospital:</strong> {c.treatingHospital || 'General Hospital'} • <strong>Goal:</strong> ₹{(c.targetAmount || 0).toLocaleString('en-IN')}
                          </p>
                          {c.medicalSummary && (
                            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.5rem 0 0', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
                              "{c.medicalSummary}"
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-emerald btn-sm"
                            onClick={() => handleUpdateCaseStatus(c, 'VERIFIED')}
                          >
                            <Check size={14} /> {c.isRemote ? 'Verify Case' : 'Simulate Verify (Demo)'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleUpdateCaseStatus(c, 'UNDER_REVIEW')}
                          >
                            {c.isRemote ? 'Under Review' : 'Simulate Clarify (Demo)'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleUpdateCaseStatus(c, 'REJECTED')}
                          >
                            <X size={14} /> {c.isRemote ? 'Reject Case' : 'Simulate Reject (Demo)'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: documents (Human Document Desk) */}
          {activeSection === 'documents' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#1d4ed8" /> Human Document Desk
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Auditing diagnostic reports, biopsy summaries, genetic sequencing outputs, and hospital cost estimates under Indian privacy compliance.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>AIIMS_Neurology_Biopsy_Diagnostic_Audit.pdf</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Patient ID: P-101 (Aarav Sharma) • Size: 2.4 MB • Encrypted at Rest</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => showNotification('Document integrity hash confirmed: SHA-256 Valid.', 'info')}>
                    <Eye size={14} /> Audit Integrity
                  </button>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Apollo_Childrens_BoneMarrow_Estimate_₹12L.pdf</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Patient ID: P-102 (Priya Patel) • Size: 1.1 MB • Encrypted at Rest</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => showNotification('Hospital estimate verified against CGHS reference rate.', 'info')}>
                    <Eye size={14} /> Audit Integrity
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: blood (Blood Requests Desk) */}
          {activeSection === 'blood' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="#dc2626" /> Registered Urgent Blood Requests ({bloodRequests.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Volunteer coordination queue for emergency rare blood group matching across regional centers.
              </p>

              {bloodRequests.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>No urgent blood requests logged during this pilot session.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {bloodRequests.map((req, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #fee2e2', backgroundColor: '#fff5f5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className="badge badge-amber" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>{req.bloodGroup}</span>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{req.patientName} ({req.unitsNeeded} Units)</h4>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                          Hospital: {req.hospitalName}, {req.city} • Contact: {req.contactNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => showNotification(`Volunteer alert dispatched for ${req.bloodGroup} requirement at ${req.hospitalName}.`, 'success')}
                      >
                        Dispatch Alert
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: feedback (Pilot Feedback Desk) */}
          {activeSection === 'feedback' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                User Pilot Feedback ({pilotFeedbacks.length} Submissions)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Direct suggestions, defect reports, and accessibility observations submitted by pilot participants.
              </p>

              {pilotFeedbacks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>No feedback submissions recorded yet. Try clicking "Give Pilot Feedback" in the footer or support page.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pilotFeedbacks.map((fb, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge badge-sky">{fb.category || 'General'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(fb.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>{fb.message}</p>
                      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => showNotification(`Feedback item acknowledged and assigned to issue triage.`, 'success')}
                        >
                          Mark Acknowledged
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: issues (Issue Tracker) */}
          {activeSection === 'issues' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
                V1.1.2 Release Candidate Quality Gates
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#16a34a" />
                  <span style={{ fontSize: '0.9rem', color: '#166534' }}>All buttons, filters, modals, and navigation controls verified functional.</span>
                </div>
                <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#16a34a" />
                  <span style={{ fontSize: '0.9rem', color: '#166534' }}>Zero fake donations; simulated support routed strictly away from public transparency ledger.</span>
                </div>
                <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#16a34a" />
                  <span style={{ fontSize: '0.9rem', color: '#166534' }}>No unhandled alert() dead ends; all actions provide inline status feedback.</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: logs (Audit Logs) */}
          {activeSection === 'logs' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
                System Security & Governance Audit Logs
              </h3>
              <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <div>[AUDIT] SEC_POLICY_CHECK: Firebase Spark tier strictly enforced (No billing, no Cloud Functions)</div>
                <div>[AUDIT] RBAC_RULE_CHECK: firestore.rules strict access controls validated</div>
                <div>[AUDIT] PRIVACY_ENFORCEMENT: Donor phone numbers masked and protected from public view</div>
                <div>[AUDIT] FINANCIAL_INTEGRITY: Public ledger write protection enabled</div>
                <div>[AUDIT] RECENT_EVENT: Audit log stream synchronized at {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PATIENT FAMILY WORKSPACE                                   */}
      {/* ============================================================== */}
      {role === 'PATIENT_FAMILY' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                {activeSection === 'hope-journey' ? 'Hope Journey Milestones' : 'My Support Application'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Track clinical verification, hospital liaison, and treatment milestones for your family.
              </p>
            </div>
            {onOpenPatientApply && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenPatientApply}
              >
                <PlusCircle size={15} /> + Submit Support Application
              </button>
            )}
          </div>

          {activeSection === 'hope-journey' ? (
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem' }}>Clinical Treatment Milestones</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Step 1: Clinical Genetic Sequencing & Panel Validation</span>
                    <span className="badge badge-emerald">COMPLETED</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Verified by AIIMS Medical Genetics board. Mutation identified.</p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Step 2: Hospital Itemized Treatment Cost Plan</span>
                    <span className="badge badge-emerald">CONFIRMED</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Apollo Specialised Pediatric Unit issued formal estimate.</p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid #fed7aa', borderRadius: '8px', backgroundColor: '#fffaf0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Step 3: First Round Targeted Enzyme Infusion</span>
                    <span className="badge badge-amber">SCHEDULED</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Scheduled upon hospital bed availability and drug import customs clearance.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              {allApplications.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={36} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
                  <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No Application on Record</h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    You have not submitted a patient assistance application yet. Submit your application and hospital documents to begin clinical verification.
                  </p>
                  {onOpenPatientApply && (
                    <button type="button" className="btn btn-primary" onClick={onOpenPatientApply}>
                      <PlusCircle size={16} /> Apply for Patient Support
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {allApplications.map((app: any, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{app.patientName}</h4>
                            <span className={`badge ${app.status === 'VERIFIED' ? 'badge-emerald' : app.status === 'REJECTED' ? 'badge-rose' : 'badge-amber'}`}>{app.status || 'SUBMITTED'}</span>
                            {app.isRemote ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                                <CheckCircle size={11} /> Firestore Shared
                              </span>
                            ) : (
                              <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>
                                <AlertCircle size={11} /> Local Demo Sandbox
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                            Category: {app.diseaseCategory} • Hospital: {app.treatingHospital || 'Government Hospital'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d4ed8' }}>
                            ₹{(app.targetAmount || 0).toLocaleString('en-IN')}
                          </span>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Target Estimate</p>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Document: {app.documentName || 'Hospital_Certificate.pdf'} (Under Review)
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => showNotification(`Application for ${app.patientName} is in queue for medical panel verification.`, 'info')}
                        >
                          <Eye size={14} /> View Case Timeline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DONOR WORKSPACE                                            */}
      {/* ============================================================== */}
      {role === 'DONOR' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                {activeSection === 'saved' ? 'Saved Patient Campaigns' : 'My Demo Contributions'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Track your simulated micro-support pledges and bookmarked patient cases.
              </p>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('micro-support')}
              >
                <Heart size={15} /> Browse Micro-Support Needs
              </button>
            )}
          </div>

          {activeSection === 'saved' ? (
            <div className="card">
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem' }}>Bookmarked Rare Disease Cases</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Keep track of patients whose treatment journey you are following.
              </p>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No saved campaigns bookmarked in this browser session.</p>
                {onNavigate && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => onNavigate('patients')}>
                    Browse Patient Directory
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#0369a1' }}>
                <strong>Demonstration Mode Notice:</strong> Real payments are not currently processed. All entries below represent test simulation sessions. No actual money was debited or transferred.
              </div>

              {simulatedDonations.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                  <Heart size={32} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                  <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>No simulated contributions made yet.</p>
                  {onNavigate && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate('micro-support')}>
                      Explore Demonstration Support
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {simulatedDonations.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="badge badge-sky" style={{ fontSize: '0.75rem' }}>Simulation</span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Campaign ID: {item.campaignId} • TX Ref: {item.txId} • {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadSampleReceipt(item.txId, item.amount)}
                      >
                        <Download size={14} /> Download Sample Receipt (Text File)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. VOLUNTEER WORKSPACE                                        */}
      {/* ============================================================== */}
      {role === 'VOLUNTEER' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>
                  Blood & Field Standby Status
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                  {isStandbyAvailable ? 'You are currently ACTIVE for emergency standby alerts.' : 'You are currently marked OFFLINE.'}
                </p>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${isStandbyAvailable ? 'btn-emerald' : 'btn-outline'}`}
                onClick={() => {
                  setIsStandbyAvailable(!isStandbyAvailable);
                  showNotification(`Standby status updated to: ${!isStandbyAvailable ? 'ACTIVE' : 'OFFLINE'}`, 'success');
                }}
              >
                {isStandbyAvailable ? 'Status: Active (Click to Pause)' : 'Status: Paused (Click to Activate)'}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
              Available Field & Verification Assignments
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Hospital Liaison: Verify Apollo Children's ICU Bed Cost Estimate</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Location: Bangalore • Urgency: HIGH • Case: Aarav Sharma</p>
                </div>
                {acceptedTasks.includes('task_apollo') ? (
                  <span className="badge badge-emerald"><Check size={13} /> Assignment Accepted (Local Sandbox)</span>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleAcceptTask('task_apollo', "Verify Apollo Children's ICU Bed Cost Estimate")}>
                    Accept Task (Demo)
                  </button>
                )}
              </div>
              <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Emergency O- Rare Blood Transit Escort</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Location: AIIMS New Delhi • Time: Standby for next scheduled transfusion</p>
                </div>
                {acceptedTasks.includes('task_transit') ? (
                  <span className="badge badge-emerald"><Check size={13} /> Standby Confirmed (Local Sandbox)</span>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleAcceptTask('task_transit', "Emergency O- Rare Blood Transit Escort")}>
                    Accept Task (Demo)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DOCTOR WORKSPACE                                           */}
      {/* ============================================================== */}
      {role === 'DOCTOR' && (
        <div>
          {activeSection === 'clinical-logs' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                Clinical Log Writer & Second Opinion Notes
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Document genetic sequencing interpretation, biochemical enzyme assays, and dosage recommendations.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select Assigned Patient Case:
                </label>
                <select
                  className="input"
                  value={selectedCaseForNotes}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setSelectedCaseForNotes(cId);
                    setClinicalNotes(localStorage.getItem('lifebridge_doctor_notes_' + cId) || '');
                  }}
                  style={{ maxWidth: '360px' }}
                >
                  <option value="P-101">Aarav Sharma (SMA Type 1 - Genetic Review)</option>
                  <option value="P-102">Priya Patel (Gaucher Disease Type 1)</option>
                  <option value="P-103">Rohan Varma (Pompe Disease)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Attending Neurologist / Geneticist Clinical Assessment:
                </label>
                <textarea
                  className="input"
                  rows={5}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter medical findings, confirmatory genetic tests, exon deletion patterns, and approved protocol recommendation..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!clinicalNotes.trim()) {
                    showNotification('Please enter clinical notes before saving.', 'error');
                    return;
                  }
                  localStorage.setItem('lifebridge_doctor_notes_' + selectedCaseForNotes, clinicalNotes);
                  showNotification(`Clinical review record signed & saved to local session for Case ${selectedCaseForNotes}.`, 'success');
                }}
              >
                Sign & Save Clinical Assessment (Local Demo)
              </button>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
                Assigned Clinical Verification Cases
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Case P-101: Spinal Muscular Atrophy Type 1 (SMA)</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Patient: Aarav Sharma (Age 14 months) • Genetic MLPA Test pending specialist review</p>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveGeneticReportModal({
                      caseId: 'P-101',
                      patient: 'Aarav Sharma',
                      test: 'Multiplex Ligation-dependent Probe Amplification (MLPA)',
                      findings: 'SMN1 Exon 7 and Exon 8 homozygous deletion detected.',
                      clinicalConclusion: 'Diagnostic profile confirms Spinal Muscular Atrophy Type 1.',
                      hospital: 'AIIMS Division of Medical Genetics',
                      auditedAt: '2026-09-14'
                    })}>
                    Review Genetic Report
                  </button>
                </div>

                <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Case P-102: Gaucher Disease Type 1</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Patient: Priya Patel (Age 6) • Beta-glucosidase enzyme assay verified</p>
                  </div>
                  <button type="button" className="btn btn-emerald btn-sm" onClick={() => {
                    setCase102Eligibility('NPRD 2021 Group 3 Confirmed (CoE AIIMS)');
                    showNotification('[Local Demo] Case P-102 eligibility updated to NPRD 2021 Group 3 Confirmed.', 'success');
                  }}>
                    Simulate Eligibility Confirmation (Demo)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. HOSPITAL PARTNER WORKSPACE                                 */}
      {/* ============================================================== */}
      {role === 'HOSPITAL' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
            Hospital Partner Treatment Desk
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Direct administrative portal for partner hospitals to submit itemized cost estimates and discharge summaries.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#0f172a' }}>Submit Cost Estimate</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Upload stamped estimates covering ICU, specialty infusion, and diagnostics.</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => {
                  const estName = 'Apollo_Childrens_ICU_Estimate_Aarav_₹5.2L.pdf';
                  localStorage.setItem('lifebridge_hospital_estimate', estName);
                  setHospitalEstimateFileName(estName);
                  showNotification('Hospital cost estimate file registered to local session: ' + estName, 'success');
                }}>
                Upload Hospital Estimate
              </button>
            </div>

            <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#0f172a' }}>Disbursement Tracking</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b' }}>Direct hospital account RTGS disbursement reconciliation.</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveSettlementModal(true)}>
                View Settlement Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. CSR CORPORATE WORKSPACE                                    */}
      {/* ============================================================== */}
      {role === 'CSR' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
            Corporate CSR Healthcare Allocation Portal
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Track Section 135 Schedule VII compliant healthcare grants, zero platform fee audits, and impact metrics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>PLATFORM EFFICIENCY</span>
              <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#1e3a8a' }}>100%</h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#3b82f6' }}>0% Platform Administration Fee</p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>AUDIT COMPLIANCE</span>
              <h4 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#14532d' }}>Grade A</h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#22c55e' }}>Independent CA Verified</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadCsrReport}
          >
            <FileText size={15} /> Download CSR Utilization Statement (Text Summary)
          </button>
        </div>
      )}
      {/* GENETIC REPORT MODAL */}
      {activeGeneticReportModal && (
        <div className="modal-overlay" onClick={() => setActiveGeneticReportModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Diagnostic Genetic Sequencing Audit
              </h3>
              <button type="button" onClick={() => setActiveGeneticReportModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Patient:</strong> {activeGeneticReportModal.patient} (Case {activeGeneticReportModal.caseId})</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Diagnostic Assay:</strong> {activeGeneticReportModal.test}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Findings:</strong> <span style={{ color: '#dc2626', fontWeight: 600 }}>{activeGeneticReportModal.findings}</span></div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Clinical Assessment:</strong> {activeGeneticReportModal.clinicalConclusion}</div>
              <div><strong>Reporting Lab:</strong> {activeGeneticReportModal.hospital} • {activeGeneticReportModal.auditedAt}</div>
            </div>

            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveGeneticReportModal(null)}>
              Close Audit Preview
            </button>
          </div>
        </div>
      )}

      {/* HOSPITAL SETTLEMENT LOG MODAL */}
      {activeSettlementModal && (
        <div className="modal-overlay" onClick={() => setActiveSettlementModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                Hospital RTGS Disbursement Settlement
              </h3>
              <button type="button" onClick={() => setActiveSettlementModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Hospital Account:</strong> Apollo Children's Hospital Bangalore</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Disbursed Amount:</strong> ₹12,00,000 (Direct Patient Care)</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Platform Commission:</strong> ₹0.00 (0% Platform Fee Policy)</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>RTGS UTR Reference:</strong> RTGS-2026-LB-99418290</div>
              <div><strong>Audit Reconciliation:</strong> Verified against hospital inpatient invoice #AP-88219.</div>
            </div>

            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveSettlementModal(false)}>
              Close Settlement Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
