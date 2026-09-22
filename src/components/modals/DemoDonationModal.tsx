import React, { useState } from 'react';
import { PatientCampaign } from '../../types';
import { X, Heart, ShieldCheck, Info } from 'lucide-react';
import { recordDonation } from '../../services/api';

interface DemoDonationModalProps {
  campaign: PatientCampaign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DemoDonationModal: React.FC<DemoDonationModalProps> = ({ campaign, isOpen, onClose }) => {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !campaign) return null;

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
      const res = await recordDonation(campaign.id, finalAmt);
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
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Support Patient Campaign</h3>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {receipt ? (
          <div>
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <ShieldCheck color="#059669" size={40} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ color: '#047857', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Contribution Recorded</h4>
              <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>Transaction Reference: {receipt.transactionId}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Recipient Patient:</span>
                <strong style={{ color: '#0f172a' }}>{campaign.patientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Amount:</span>
                <strong style={{ color: '#059669' }}>₹{receipt.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Platform Fee:</span>
                <strong style={{ color: '#1d4ed8' }}>₹0 (0% Platform Fee)</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8125rem', color: '#0369a1', marginBottom: '1.5rem' }}>
              <strong>Ledger Notice:</strong> This transaction has been recorded in the platform transparency ledger.
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReset}>
              Close & Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Supporting:</span>
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{campaign.patientName} ({campaign.diseaseCategory})</h4>
            </div>

            <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8125rem', color: '#1e40af', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} /> 0% platform commission policy applies to all verified campaign contributions.
            </div>

            {/* PRESET AMOUNTS */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Select Contribution Amount
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Processing...' : 'Record Support Contribution'} <Heart size={16} color="#ffffff" fill="#ffffff" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
