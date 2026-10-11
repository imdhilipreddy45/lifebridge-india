import React, { useState, useEffect } from 'react';
import { Eye, ShieldCheck, Lock, FileText, Search, X, Info, ExternalLink } from 'lucide-react';
import { TransparencyRecord } from '../../types';
import { fetchTransparencyLedger } from '../../services/api';

export const TransparencySection: React.FC = () => {
  const [records, setRecords] = useState<TransparencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolicy, setShowPolicy] = useState(false);

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

  const filteredRecords = records.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.transactionId && r.transactionId.toLowerCase().includes(q)) ||
      (r.purpose && r.purpose.toLowerCase().includes(q)) ||
      (r.paymentMethod && r.paymentMethod.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q))
    );
  });

  return (
    <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">

        {/* HEADER */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Open Accountability
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            Public Transparency Ledger
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Public log of verified campaign financial disbursements. In adherence to strict platform governance, demonstration transactions are never added to this public record.
          </p>
        </div>

        {/* TRUST POLICY BANNER */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 2rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={20} color="#1d4ed8" />
            <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
              0% Platform Fee Policy • Direct Hospital Settlement Model
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowPolicy(true)}
            style={{ backgroundColor: '#ffffff', fontSize: '0.775rem' }}
          >
            Verification & Audit Policy
          </button>
        </div>

        {/* SEARCH BAR IF RECORDS EXIST */}
        {records.length > 0 && (
          <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by transaction reference or purpose..."
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
        )}

        {/* LEDGER CONTENT */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading ledger records from Firebase...
          </div>
        ) : records.length === 0 ? (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <FileText size={44} color="#64748b" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>No Financial Records Available Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.55 }}>
              No production campaign disbursements have been logged yet. Operating in Controlled Pilot Mode. Confirmed hospital settlement records will automatically publish here when processed.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <ShieldCheck size={16} /> Public Ledger Protected • Demo Transactions Excluded
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No transaction records match your search.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSearchQuery('')}
              style={{ marginTop: '0.75rem' }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <span className="badge badge-emerald">
                <ShieldCheck size={14} /> Audited Financial Ledger
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{filteredRecords.length} Confirmed Transactions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRecords.map(r => (
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

        {/* POLICY MODAL */}
        {showPolicy && (
          <div className="modal-overlay" onClick={() => setShowPolicy(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck color="#059669" size={24} />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Transparency & Audit Policy</h3>
                </div>
                <button type="button" onClick={() => setShowPolicy(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.55 }}>
                <p>
                  <strong>1. Zero Platform Commission:</strong> LifeBridge India charges 0% administrative fees on campaign donations. 100% of verified contributions go directly toward treating hospital estimates.
                </p>
                <p>
                  <strong>2. Hospital Escrow Routing:</strong> Funds are never transferred directly to personal accounts. In Phase V2, disbursements route to verified hospital accounts against certified medical invoices.
                </p>
                <p>
                  <strong>3. Simulation Segregation:</strong> Test and demonstration contributions conducted during this pilot are stored strictly in local session storage and never added to this official public ledger.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                onClick={() => setShowPolicy(false)}
              >
                Close Policy Details
              </button>
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
