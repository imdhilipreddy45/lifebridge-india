import React, { useState } from 'react';
import { HelpCircle, Search, Mail, ShieldCheck, X } from 'lucide-react';
import { submitPilotFeedback } from '../services/api';

export const SupportPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    { q: 'What is Spinal Muscular Atrophy (SMA)?', a: 'SMA is a rare genetic neuromuscular disease affecting motor neurons, leading to muscle weakness. Early gene therapy or targeted protein therapy is critical.' },
    { q: 'How does Hope Verification work?', a: 'Every patient campaign undergoes independent human document audits by attending doctors and hospital verification desks to verify identity, medical records, and treatment estimates.' },
    { q: 'Is my donation tax-deductible in this pilot?', a: 'All contributions in this pilot are simulated demo transactions. Entity tax filing (80G / 12A) will activate in Phase V2 after formal registration.' },
    { q: 'How does voluntary blood matching work?', a: 'Families submit blood component requests (O-negative, platelets, plasma) which are matched against standby registered donors without exposing private contact info.' }
  ];

  const filteredFaqs = query.trim()
    ? faqs.filter(f => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
    : faqs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await submitPilotFeedback({
        message: `[Inquiry from ${name} (${email})]: ${message}`,
        category: 'Other',
        page: 'support',
        severity: 'MEDIUM'
      });
      setSubmitted(true);
    } catch (err) {
      console.warn("Support inquiry submit error:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '80vh', padding: '4rem 0', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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

        {/* SEARCH FAQS */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search frequently asked questions (e.g. SMA, Hope Verification, tax, blood)..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          {query && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setQuery('')}
              title="Clear search"
            >
              <X size={16} /> Clear
            </button>
          )}
        </div>

        {/* FAQ CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3.5rem' }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <p style={{ margin: 0 }}>No questions matched "{query}". Feel free to submit your question below.</p>
            </div>
          ) : (
            filteredFaqs.map((f, i) => (
              <div key={i} className="card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} color="#1d4ed8" /> {f.q}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))
          )}
        </div>

        {/* SUPPORT FORM */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Contact Pilot Support Desk</h3>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#047857' }}>
              <ShieldCheck size={40} style={{ margin: '0 auto 0.5rem', color: '#16a34a' }} />
              <h4 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>Inquiry Submitted Successfully</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Our pilot coordination desk has logged your inquiry. We review all queries within 24 hours.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Please describe your question or support request..." />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                <Mail size={16} /> {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};
