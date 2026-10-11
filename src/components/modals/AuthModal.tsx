import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  CheckCircle,
  AlertCircle,
  Heart,
  ArrowLeft,
  UserCheck,
  HeartHandshake,
  Users
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'DONOR' | 'PATIENT_FAMILY' | 'VOLUNTEER'>('DONOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const { loginUserDirect } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setResetSent(false);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  // Accessibility: Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      className="auth-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-container" onClick={e => e.stopPropagation()}>

        {/* LEFT PANEL — BRANDING & TRUST POINTS (DESKTOP) */}
        <div className="auth-brand-panel">
          <div>
            <div className="auth-brand-header">
              <div className="auth-brand-logo-icon">
                <Heart size={22} color="#ffffff" />
              </div>
              <div>
                <span className="auth-brand-title">LifeBridge <span style={{ color: '#1d4ed8' }}>India</span></span>
                <span className="auth-brand-subtitle">Trusted Medical Support</span>
              </div>
            </div>

            <h2 className="auth-hero-heading">
              Connecting Patients with Verified Life-Saving Support
            </h2>
            <p className="auth-hero-desc">
              A transparent healthcare platform linking verified medical support campaigns, rare disease assistance, voluntary donor networks, and hospitals.
            </p>

            <div className="auth-trust-list">
              <div className="auth-trust-item">
                <div className="auth-trust-icon">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="auth-trust-title">Privacy-focused account access</div>
                  <div className="auth-trust-desc">Protected authentication with strict data handling protocols.</div>
                </div>
              </div>

              <div className="auth-trust-item">
                <div className="auth-trust-icon">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="auth-trust-title">Structured medical-support workflows</div>
                  <div className="auth-trust-desc">Direct campaign management, blood requests, and emergency aid.</div>
                </div>
              </div>

              <div className="auth-trust-item">
                <div className="auth-trust-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="auth-trust-title">Secure role-based access</div>
                  <div className="auth-trust-desc">Tailored workspace for donors, patient families, and volunteers.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <ShieldCheck size={15} color="#059669" />
            <span>LifeBridge India Medical Support Platform</span>
          </div>
        </div>

        {/* RIGHT PANEL — CLEAN AUTHENTICATION CARD */}
        <div className="auth-card-panel">
          <button
            className="auth-close-btn"
            onClick={onClose}
            aria-label="Close authentication window"
          >
            <X size={18} />
          </button>

          <div>
            {/* MOBILE BRAND HEADER (< 841px) */}
            <div className="auth-mobile-header">
              <div className="auth-brand-logo-icon" style={{ width: '32px', height: '32px', padding: 0 }}>
                <Heart size={18} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                LifeBridge <span style={{ color: '#1d4ed8' }}>India</span>
              </span>
            </div>

            {/* DYNAMIC CARD HEADER */}
            <div className="auth-header">
              <h3 className="auth-title" id="auth-modal-title">
                {resetSent
                  ? 'Check Your Inbox'
                  : mode === 'signin'
                  ? 'Welcome back'
                  : mode === 'register'
                  ? 'Create your account'
                  : 'Reset your password'}
              </h3>
              <p className="auth-subtitle">
                {resetSent
                  ? 'A reset link has been dispatched if an account exists for this email.'
                  : mode === 'signin'
                  ? 'Sign in to continue your LifeBridge India journey.'
                  : mode === 'register'
                  ? 'Join LifeBridge India to access medical support and donor networks.'
                  : 'Enter your account email to receive password reset instructions.'}
              </p>
            </div>

            {/* RESET EMAIL CONFIRMATION NOTICE */}
            {resetSent ? (
              <div className="auth-success-box">
                <CheckCircle color="#059669" size={48} style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h4 style={{ color: '#047857', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Reset Instructions Sent
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  If an account exists for <strong style={{ color: '#0f172a' }}>{email}</strong>, you will receive password reset instructions shortly.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setResetSent(false); setMode('signin'); }}
                >
                  <ArrowLeft size={16} /> Return to Sign In
                </button>
              </div>
            ) : mode === 'reset' ? (
              /* FORGOT PASSWORD FORM */
              <form onSubmit={handlePasswordReset}>
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="auth-reset-email">Account Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Mail size={17} /></span>
                    <input
                      id="auth-reset-email"
                      type="email"
                      className="auth-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="auth-error-alert" role="alert">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', height: '46px', marginTop: '0.5rem' }}
                >
                  {loading ? 'Sending link...' : 'Send Password Reset Link'}
                </button>
              </form>
            ) : (
              /* SIGN IN / REGISTER FORM */
              <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister}>

                {/* EMAIL FIELD */}
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="auth-email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Mail size={17} /></span>
                    <input
                      id="auth-email"
                      type="email"
                      className="auth-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div className="auth-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="auth-label" htmlFor="auth-password" style={{ margin: 0 }}>Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError(null); }}
                        style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Lock size={17} /></span>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      style={{ paddingRight: '2.6rem' }}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* ROLE SELECTION (REGISTRATION ONLY) */}
                {mode === 'register' && (
                  <div className="auth-form-group">
                    <label className="auth-label">Register Account As</label>
                    <div className="auth-role-selector">
                      <label className={`auth-role-option ${selectedRole === 'DONOR' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="userRole"
                          value="DONOR"
                          checked={selectedRole === 'DONOR'}
                          onChange={() => setSelectedRole('DONOR')}
                          className="auth-role-radio"
                        />
                        <HeartHandshake size={18} color={selectedRole === 'DONOR' ? '#1d4ed8' : '#64748b'} />
                        <div>
                          <div className="auth-role-label">Donor / Community Supporter</div>
                          <div className="auth-role-desc">Contribute to medical campaigns & transparent ledger</div>
                        </div>
                      </label>

                      <label className={`auth-role-option ${selectedRole === 'PATIENT_FAMILY' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="userRole"
                          value="PATIENT_FAMILY"
                          checked={selectedRole === 'PATIENT_FAMILY'}
                          onChange={() => setSelectedRole('PATIENT_FAMILY')}
                          className="auth-role-radio"
                        />
                        <Users size={18} color={selectedRole === 'PATIENT_FAMILY' ? '#1d4ed8' : '#64748b'} />
                        <div>
                          <div className="auth-role-label">Patient / Family Member</div>
                          <div className="auth-role-desc">Apply for campaign support & document uploads</div>
                        </div>
                      </label>

                      <label className={`auth-role-option ${selectedRole === 'VOLUNTEER' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="userRole"
                          value="VOLUNTEER"
                          checked={selectedRole === 'VOLUNTEER'}
                          onChange={() => setSelectedRole('VOLUNTEER')}
                          className="auth-role-radio"
                        />
                        <UserCheck size={18} color={selectedRole === 'VOLUNTEER' ? '#1d4ed8' : '#64748b'} />
                        <div>
                          <div className="auth-role-label">Voluntary Network Member</div>
                          <div className="auth-role-desc">Participate in blood donor matching & local assistance</div>
                        </div>
                      </label>
                    </div>

                    <div className="auth-role-note">
                      🔒 <strong>Controlled Privilege Notice:</strong> Doctor, Hospital, CSR, and Admin roles are assigned exclusively through verified desk onboardings.
                    </div>
                  </div>
                )}

                {/* ERROR ALERT */}
                {error && (
                  <div className="auth-error-alert" role="alert">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>{error}</div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', height: '46px', marginTop: '0.5rem' }}
                >
                  {loading
                    ? (mode === 'signin' ? 'Signing in...' : 'Creating Account...')
                    : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
            )}
          </div>

          {/* MODE SWITCH FOOTER */}
          {!resetSent && (
            <div className="auth-switch-prompt">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => { setMode('register'); setError(null); }}
                  >
                    Create an account
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => { setMode('signin'); setError(null); }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => { setMode('signin'); setError(null); }}
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

