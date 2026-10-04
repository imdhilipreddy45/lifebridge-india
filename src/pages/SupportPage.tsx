import React, { useState } from 'react';
import { HelpCircle, Search, Mail, ShieldCheck } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    { q: 'What is Spinal Muscular Atrophy (SMA)?', a: 'SMA is a rare genetic neuromuscular disease affecting motor neurons, leading to muscle weakness. Early gene therapy or targeted protein therapy is critical.' },
    { q: 'How does Hope Verification work?', a: 'Every patient campaign undergoes independent human document audits by attending doctors and hospital verification desks to verify identity, medical records, and treatment estimates.' },
    { q: 'Is my donation tax-deductible in this pilot?', a: 'All contributions in this pilot are simulated demo transactions. Entity tax filing (80G / 12A) will activate in Phase V2 after formal registration.' },
    { q: 'How does voluntary blood matching work?', a: 'Families submit blood component requests (O-negative, platelets, plasma) which are matched against standby registered donors without exposing private contact info.' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setSubmitted(true);
  };

  return (
    <main style={{ minHeight: '80vh', padding: '4rem 0', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Help & Knowledge Base
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>
            Support & Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748b' }}>
            Learn how LifeBridge India verifies patient campaigns, protects privacy, and coordinates support.
          </p>
        </div>

        {/* FAQ CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3.5rem' }}>
          {faqs.map((f, i) => (
            <div key={i} className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} color="#1d4ed8" /> {f.q}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* SUPPORT FORM */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Contact Pilot Support Desk</h3>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#047857' }}>
              <ShieldCheck size={40} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1.1rem' }}>Inquiry Submitted</h4>
              <p style={{ fontSize: '0.85rem', color: '#065f46' }}>Our pilot support team has received your message.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>How can we help?</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Mail size={16} /> Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};
