import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitPilotFeedback } from '../../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, currentPage }) => {
  const { currentRole, currentUser } = useAuth();
  const [category, setCategory] = useState<'UX' | 'Trust' | 'Medical' | 'Privacy' | 'Security' | 'Blood Donation' | 'Fundraising' | 'Navigation' | 'Accessibility' | 'Other'>('UX');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await submitPilotFeedback({
      userId: currentUser ? currentUser.uid : 'anon',
      role: currentRole,
      page: currentPage,
      category,
      severity,
      message
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare color="#1d4ed8" size={22} />
            <h3 style={{ margin: 0 }}>Pilot Usability Feedback</h3>
          </div>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle color="#059669" size={48} style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: '#047857', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Feedback Received</h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your feedback has been logged in the Pilot Operations Triage Queue for Advisory Board review.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReset}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  User Role
                </label>
                <input
                  type="text"
                  disabled
                  value={currentRole}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Current Page
                </label>
                <input
                  type="text"
                  disabled
                  value={currentPage}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Feedback Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
              >
                <option value="UX">UX & Layout Usability</option>
                <option value="Trust">Trust & Verification</option>
                <option value="Medical">Medical Disclaimer</option>
                <option value="Privacy">Privacy & Consent</option>
                <option value="Blood Donation">Blood Matching</option>
                <option value="Fundraising">Fundraising Simulation</option>
                <option value="Accessibility">Accessibility</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
              >
                <option value="LOW">Low (Minor Suggestion)</option>
                <option value="MEDIUM">Medium (Usability Improvement)</option>
                <option value="HIGH">High (Confusing Workflow)</option>
                <option value="CRITICAL">Critical (Defect / Error)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Feedback / Suggestion
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What worked? What was confusing? How can we improve trust?"
                required
                rows={4}
                maxLength={1000}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
