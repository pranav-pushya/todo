import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  Github,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.18 3.66-9.14z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.24C.45 8.16 0 9.99 0 12s.45 3.84 1.24 5.41l4.04-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.57 1.24 6.59l4.04 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
      />
    </svg>
  );
}

function formatFirebaseError(err) {
  if (!err) return 'An unexpected error occurred.';
  const code = err.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }
  return err.message || 'Authentication failed. Please try again.';
}

export default function AuthModal({ isOpen, onClose }) {
  const {
    login,
    loginWithFirebase,
    registerWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
  } = useAuth();
  const { toast } = useUIFeedback();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSentEmail, setResetSentEmail] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Fullstack Developer');
  const [regGithub, setRegGithub] = useState('');
  const [regBio, setRegBio] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

  const handleFillDemo = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login({
        email_or_username: 'demo@example.com',
        password: 'demo123',
      });
      toast.success('Connected to demo workspace!');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect demo user.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (loginEmail === 'demo@example.com' || loginEmail === 'demo_user') {
        await login({ email_or_username: loginEmail, password: loginPassword });
      } else {
        await loginWithFirebase({
          email: loginEmail.trim(),
          password: loginPassword,
        });
      }
      toast.success('Successfully logged in! Welcome back.');
      onClose();
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regEmail || !regPassword) {
      setErrorMsg('Email and password are required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerWithFirebase({
        email: regEmail.trim(),
        password: regPassword,
        full_name: regFullName.trim() || undefined,
        username: regUsername.trim() || regEmail.split('@')[0],
        role: regRole || 'Fullstack Developer',
        bio: regBio.trim() || undefined,
        github_username: regGithub.trim() || undefined,
      });
      toast.success('Account created with Firebase! Welcome aboard.');
      onClose();
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google successfully!');
      onClose();
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendFirebasePasswordReset(forgotEmail.trim());
      setResetSentEmail(forgotEmail.trim());
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-obsidian-950 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.08] bg-gradient-to-b from-cobalt-950/40 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cobalt-600/30 border border-cobalt-500/40 flex items-center justify-center text-cobalt-300 shadow-glow-cobalt">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {mode === 'forgot' ? 'Reset Password' : 'Firebase Authentication'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Sign in to access your synchronized workspaces'
                  : mode === 'register'
                  ? 'Create your developer profile with Firebase'
                  : 'Receive a password reset link in your email'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-1 p-1 bg-obsidian-900 border border-white/[0.06] rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setResetSentEmail(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-cobalt-600 text-white shadow-glow-cobalt'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setResetSentEmail(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-cobalt-600 text-white shadow-glow-cobalt'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            {mode === 'forgot' && (
              <button
                type="button"
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-cobalt-600 text-white shadow-glow-cobalt transition-all"
              >
                Reset Password
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <div className="space-y-4">
              {/* Google 1-Click Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.25] text-white text-xs font-medium transition-all cursor-pointer"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">or email</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="developer@example.com"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        if (loginEmail.includes('@')) setForgotEmail(loginEmail);
                        setErrorMsg('');
                        setResetSentEmail('');
                      }}
                      className="text-xs text-cobalt-400 hover:text-cobalt-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In with Firebase'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Demo 1-Click Credentials Helper */}
                <div className="pt-3 border-t border-white/[0.06] text-center">
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-cobalt-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cobalt-400" />
                    <span>Quick Demo Sign-In (demo123)</span>
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'register' ? (
            <div className="space-y-3.5">
              {/* Google 1-Click Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.25] text-white text-xs font-medium transition-all cursor-pointer"
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">or email</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="developer@example.com"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-3 pr-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Role / Title
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        placeholder="AI Engineer"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      GitHub Handle
                    </label>
                    <div className="relative">
                      <Github className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regGithub}
                        onChange={(e) => setRegGithub(e.target.value)}
                        placeholder="username"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bio / Focus
                  </label>
                  <textarea
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder="Building AI workflows, sprint planning, and ML experiments..."
                    rows={2}
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer mt-1"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Firebase Registration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              {resetSentEmail ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>Password Reset Email Sent!</span>
                    </div>
                    <p className="text-xs text-emerald-300/90 leading-relaxed">
                      We've sent an official password reset link from Firebase to{' '}
                      <span className="font-semibold text-white underline">{resetSentEmail}</span>.
                    </p>
                    <p className="text-[11px] text-emerald-400/80">
                      Check your inbox (and spam/junk folder) and click the link to choose your new password. Once reset, return here to sign in.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setResetSentEmail(''); setErrorMsg(''); }}
                    className="w-full py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="developer@example.com"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Enter your account email. Firebase will automatically send an official password reset email with a secure reset link.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer"
                  >
                    <span>{loading ? 'Sending Email...' : 'Send Password Reset Email'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); }}
                      className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Remembered your password? Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
