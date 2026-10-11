import React, { useState, useEffect } from 'react';
import { Bot, Send, X, ShieldAlert } from 'lucide-react';

export const LifeBridgeAI: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; disclaimer?: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am LifeBridge AI. I can answer educational questions regarding SMA, rare disease care, government NPRD 2021 schemes, and platform verification.',
      disclaimer: 'LifeBridge AI provides general educational information only and cannot diagnose, prescribe treatment, or replace a qualified healthcare professional.'
    }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      const queryLower = userText.toLowerCase();
      let responseText = '';
      const medicalSafetyDisclaimer = 'LifeBridge AI provides general educational information only and cannot diagnose, prescribe treatment, or replace a qualified healthcare professional.';

      if (queryLower.includes('diagnose') || queryLower.includes('cure') || queryLower.includes('symptom')) {
        responseText = 'Warning signs for SMA include hypotonia (muscle floppiness), weak cry, and breathing distress. Please seek an immediate evaluation from a certified pediatric neurologist.';
      } else if (queryLower.includes('nprd') || queryLower.includes('government') || queryLower.includes('scheme')) {
        responseText = 'Under India\'s National Policy for Rare Diseases (NPRD 2021), eligible rare disease patients can receive up to ₹50 Lakhs in financial assistance at designated Centre of Excellence (CoE) hospitals.';
      } else {
        responseText = 'LifeBridge India supports rare disease care (SMA, DMD, Thalassemia) through 0%-commission fundraising coordination, voluntary blood donor matching, and hospital networks.';
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: responseText, disclaimer: medicalSafetyDisclaimer }
      ]);
    }, 400);
  };

  return (
    <>
      {/* FLOATING FAB BOT BUTTON */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#1d4ed8',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(29, 78, 216, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 900
        }}
        title="Ask LifeBridge AI"
      >
        <Bot size={26} />
      </button>

      {/* CHAT DRAWER */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          right: '1.5rem',
          width: '360px',
          maxHeight: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 950,
          overflow: 'hidden'
        }}>
          {/* DRAWER HEADER */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot color="#38bdf8" size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>LifeBridge AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.sender === 'user' ? '#1d4ed8' : '#f1f5f9',
                color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: 1.4
              }}>
                {m.text}
                {m.disclaimer && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1', fontSize: '0.7rem', color: '#64748b' }}>
                    <strong>Disclaimer:</strong> {m.disclaimer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about SMA or rare diseases..."
              maxLength={500}
              style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
