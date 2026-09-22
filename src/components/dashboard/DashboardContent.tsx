import React, { useState, useEffect } from 'react';
import { UserRole, PatientCampaign } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, FileText, CheckCircle, AlertCircle, Building2, UserCheck } from 'lucide-react';
import { fetchPatientCampaigns } from '../../services/api';

interface DashboardContentProps {
  role: UserRole;
  activeSection: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ role, activeSection }) => {
  const { currentUser } = useAuth();
  const [queueFilter, setQueueFilter] = useState('ALL');
  const [campaigns, setCampaigns] = useState<PatientCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPatientCampaigns()
      .then(res => {
        if (mounted) {
          setCampaigns(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setCampaigns([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const filteredCampaigns = queueFilter === 'ALL'
    ? campaigns
    : campaigns.filter(c => c.status === queueFilter);

  return (
    <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
      {/* DASHBOARD HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>
            {role.replace('_', ' ')} Workspace
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            {currentUser ? `Authenticated User: ${currentUser.email}` : 'Authenticated Workspace'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-emerald">
            <ShieldCheck size={14} /> RBAC Protected • Role: {role}
          </span>
        </div>
      </div>

      {/* ADMIN WORKSPACE */}
      {role === 'ADMIN' && (
        <div>
          {/* QUEUE FILTERS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED'].map(f => (
              <button
                key={f}
                onClick={() => setQueueFilter(f)}
                className={`btn btn-sm ${queueFilter === f ? 'btn-primary' : 'btn-outline'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
              Verification Queue ({filteredCampaigns.length} Cases)
            </h3>
            {loading ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading verification queue from Firebase...</p>
            ) : filteredCampaigns.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No verification cases currently in queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredCampaigns.map(c => (
                  <div key={c.id} style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: '#0f172a' }}>{c.patientName} ({c.diseaseCategory})</h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: {c.status} • Hospital: {c.treatingHospital}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-emerald btn-sm" onClick={() => alert(`[Admin Action] Audit updated for ${c.patientName}.`)}>
                        Approve & Verify
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`[Admin Action] Clarification requested for ${c.patientName}.`)}>
                        Clarify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCTOR WORKSPACE */}
      {role === 'DOCTOR' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
            Assigned Clinical Cases
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            No assigned clinical verification cases are currently pending doctor review.
          </p>
        </div>
      )}

      {/* HOSPITAL WORKSPACE */}
      {role === 'HOSPITAL' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
            Hospital Partner Desk
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Upload itemized hospital cost estimates and schedule dosing milestones for active patients.
          </p>
        </div>
      )}

      {/* CSR WORKSPACE */}
      {role === 'CSR' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
            Corporate CSR Impact Portal
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track grant allocations, compliance document audits, and zero-fee settlement logs.
          </p>
        </div>
      )}

      {/* PATIENT FAMILY WORKSPACE */}
      {role === 'PATIENT_FAMILY' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
            My Support Application
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track application verification status, document audit logs, and hospital estimate updates.
          </p>
        </div>
      )}

      {/* DONOR / VOLUNTEER WORKSPACE */}
      {(role === 'DONOR' || role === 'VOLUNTEER') && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
            My Activity & Preferences
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage voluntary blood donor availability, saved campaigns, and notification preferences.
          </p>
        </div>
      )}
    </div>
  );
};
