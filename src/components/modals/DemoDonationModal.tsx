import React, { useState, useEffect } from 'react';
import { PatientCampaign } from '../../types';
import { X, Heart, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { recordDonation } from '../../services/api';

interface DemoDonationModalProps {
  campaign: PatientCampaign | null;
  needItem?: { title: string; amount: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DemoDonationModal: React.FC<DemoDonationModalProps> = ({
  campaign,
  needItem,
  isOpen,
  onClose
}) => {
  const initialAmount = needItem?.amount || 5000;
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (needItem?.amount) {
        setAmount(needItem.amount);
        setCustomAmount('');
      } else {
        setAmount(5000);
        setCustomAmount('');
      }
      setReceipt(null);
      setError(null);
    }
  }, [isOpen, needItem]);

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

  const targetName = needItem ? needItem.title : (campaign?.patientName || "Rare Disease Care Fund");
  const targetSub = needItem ? "Micro-Sponsorship Need" : (campaign?.diseaseCategory || "General Medical Support");
  const targetId = campaign?.id || (needItem ? "need_" + needItem.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : "gen_support");

  const presetAmounts = [500, 1000, 5000, 10000];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalAmt = customAmount ? Number(customAmount) : amount;

    if (!Number.isFinite(finalAmt) || finalAmt < 1 || finalAmt > 500000) {
      setError('Please enter a valid amount between ₹1 and ₹5,00,000.');
      return;
    }

    setLoading(true);
    try {
      const res = await recordDonation(targetId, finalAmt);
      setReceipt(res);
    } catch (err: any) {
      setError(err.message || 'Contribution recording failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleReset}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-modal-title"
    >
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 id="donation-modal-title" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
            {needItem ? 'Sponsor Treatment Need (Demo)' : 'Support Patient Need (Demo)'}
          </h3>
          <button
            type="button"
            onClick={handleReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {receipt ? (
          <div>
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <ShieldCheck color="#059669" size={40} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ color: '#047857', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                Simulation completed — no money was transferred.
              </h4>
              <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>
                Test Reference: {receipt.transactionId}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Designated Need:</span>
                <strong style={{ color: '#0f172a' }}>{targetName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Simulated Amount:</span>
                <strong style={{ color: '#059669' }}>₹{receipt.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Platform Fee:</span>
                <strong style={{ color: '#1d4ed8' }}>₹0 (0% Platform Fee Policy)</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8125rem', color: '#92400e', marginBottom: '1.5rem' }}>
              <strong>Pilot Notice:</strong> This action was executed in demonstration mode. No credit card, UPI, or bank transfer was initiated. Live escrow transactions will activate in Phase V2 upon entity 80G/FCRA onboarding.
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleReset}
            >
              Done & Return to Platform
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Designated Support Item:</span>
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.2rem 0' }}>{targetName}</h4>
              <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>{targetSub}</span>
            </div>

            {/* MANDATORY SIMULATION WARNING */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              color: '#1e40af',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Demonstration only — no real payment will be processed.</strong>
                <div style={{ fontSize: '0.75rem', marginTop: '2px', color: '#3b82f6' }}>
                  LifeBridge India operates in pilot mode with a 0% platform commission policy.
                </div>
              </div>
            </div>

            {/* PRESET AMOUNTS */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Select Contribution Amount (Demo)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {presetAmounts.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    style={{
                      padding: '0.6rem 0.25rem',
                      borderRadius: '8px',
                      border: amount === a && !customAmount ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
                      backgroundColor: amount === a && !customAmount ? '#eff6ff' : '#ffffff',
                      color: amount === a && !customAmount ? '#1d4ed8' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ₹{a.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Or enter custom amount (₹1 to ₹5,00,000)"
                min={1}
                max={500000}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleReset}
              >
                <ArrowLeft size={16} /> Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {loading ? 'Simulating...' : 'Confirm Simulated Support'} <Heart size={16} color="#ffffff" fill="#ffffff" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
