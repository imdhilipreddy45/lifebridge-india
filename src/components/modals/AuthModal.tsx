import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { firebaseLoginUser, firebaseRegisterUser, firebaseSendPasswordReset } from '../../services/api';
import { UserProfile, UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess
}) => {

  const [mode, setMode] = useState<'signin' | 'register' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'DONOR' | 'PATIENT_FAMILY' | 'VOLUNTEER'>('DONOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setResetSent(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const formatFirebaseError = (err: any): string => {
    const code = String(err?.code || '').toLowerCase();
    const message = String(err?.message || '').toLowerCase();

    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || message.includes('invalid-credential') || message.includes('wrong-password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code.includes('email-already-in-use') || message.includes('email-already-in-use')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (code.includes('invalid-email') || message.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('weak-password') || message.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (code.includes('too-many-requests') || message.includes('too-many-requests')) {
      return 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
    }
    if (code.includes('network-request-failed') || message.includes('network-request-failed')) {
      return 'Network error. Please check your internet connection.';
    }

    const msg = err?.message || 'An error occurred during authentication. Please try again.';
    return msg.replace(/^Firebase:\s*Error\s*\(auth\/[^)]+\):\s*/i, '').trim();
  };

  const { loginUserDirect } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await firebaseLoginUser(email, password);
      loginUserDirect(profile as UserProfile);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (['ADMIN', 'DOCTOR', 'HOSPITAL', 'CSR'].includes(selectedRole)) {
      setError('Privileged roles (Admin, Doctor, Hospital, CSR) cannot be self-created.');
      return;
    }

    setLoading(true);
    try {
      const profile = await firebaseRegisterUser(email, password, selectedRole as UserRole);
      loginUserDirect(profile as UserProfile);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

const handlePasswordReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!email) {
    setError('Please enter your registered email address.');
    return;
  }
  setLoading(true);
  try {
    await firebaseSendPasswordReset(email);
    setResetSent(true);
  } catch (err: any) {
    setResetSent(true); // Sanitized response: never reveal whether account exists
  } finally {
    setLoading(false);
  }
};

return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock color="#1d4ed8" size={22} />
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
            {mode === 'signin' ? 'Sign In to LifeBridge' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={20} />
        </button>
      </div>

      {/* MODE TAB TOGGLE */}
      {mode !== 'reset' && (
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              background: 'none',
              fontWeight: mode === 'signin' ? 700 : 500,
              color: mode === 'signin' ? '#1d4ed8' : '#64748b',
              borderBottom: mode === 'signin' ? '2px solid #1d4ed8' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              background: 'none',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? '#1d4ed8' : '#64748b',
              borderBottom: mode === 'register' ? '2px solid #1d4ed8' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>
      )}

      {/* RESET CONFIRMATION NOTICE */}
      {resetSent ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <CheckCircle color="#059669" size={40} style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ color: '#047857', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Password Reset Email Sent</h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
            If an account exists for {email}, a password reset link has been dispatched.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setResetSent(false); setMode('signin'); }}>
            Back to Sign In
          </button>
        </div>
      ) : mode === 'reset' ? (
        <form onSubmit={handlePasswordReset}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          {error && <div style={errorBoxStyle}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </form>
      ) : (
        <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister}>
          {/* EMAIL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(null); }}
                  style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* ROLE SELECTOR ON REGISTRATION */}
          {mode === 'register' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Register Account As
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
              >
                <option value="DONOR">Donor / Community Supporter</option>
                <option value="PATIENT_FAMILY">Patient Family</option>
                <option value="VOLUNTEER">Voluntary Network Member</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                Note: Doctor, Hospital, CSR, and Admin roles require controlled verification desk assignment.
              </span>
            </div>
          )}

          {error && <div style={errorBoxStyle}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  </div>
);
};

const errorBoxStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '0.65rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  marginBottom: '1rem'
};
