import React, { useState, useEffect } from 'react';
import { Eye, ShieldCheck, Lock, FileText } from 'lucide-react';
import { TransparencyRecord } from '../../types';
import { fetchTransparencyLedger } from '../../services/api';

export const TransparencySection: React.FC = () => {
  const [records, setRecords] = useState<TransparencyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTransparencyLedger()
      .then(data => {
        if (mounted) {
          setRecords(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setRecords([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Open Accountability
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Public Transparency Ledger
          </h2>
          <p style={{ color: '#64748b' }}>
            Real-time, audited record of verified campaign transactions and zero-fee settlements.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading ledger records from Firebase...
          </div>
        ) : records.length === 0 ? (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <FileText size={40} color="#64748b" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>No Financial Records Available Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto', fontSize: '0.9rem' }}>
              No financial records are available yet. Confirmed campaign transactions will automatically publish to this public ledger.
            </p>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <span className="badge badge-emerald">
                <ShieldCheck size={14} /> Audited Financial Ledger
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{records.length} Recorded Transactions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {records.map(r => (
                <div key={r.id} style={ledgerRowStyle}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{r.amount.toLocaleString('en-IN')} — {r.purpose}</span>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Ref: {r.transactionId} • Method: {r.paymentMethod} • Status: {r.status}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>0% Platform Fee</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ledgerRowStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '0.85rem 1.25rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};
