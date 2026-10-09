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
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const { toast } = useUIFeedback();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Fullstack Developer');
  const [regGithub, setRegGithub] = useState('');
  const [regBio, setRegBio] = useState('');

  // Forgot / Reset password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = identifier input, 2 = code & new password
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setMode('login');
    setLoginIdentifier('demo@example.com');
    setLoginPassword('demo123');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    try {
      await login({
        email_or_username: loginIdentifier,
        password: loginPassword,
      });
      toast.success('Successfully logged in! Welcome back.');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!regEmail || !regUsername || !regPassword) {
      setErrorMsg('Email, username, and password are required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: regEmail,
        username: regUsername,
        password: regPassword,
        full_name: regFullName || undefined,
        role: regRole || 'Fullstack Developer',
        bio: regBio || undefined,
        github_username: regGithub || undefined,
      });
      toast.success(`Account created! Welcome, @${regUsername}.`);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered email or username.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      if (res && res.recovery_code) {
        setGeneratedCode(res.recovery_code);
        setRecoveryCode(res.recovery_code);
      }
      setSuccessMsg(res?.message || 'Recovery code generated successfully!');
      setForgotStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'No account found with this email or username.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!recoveryCode.trim()) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email_or_username: forgotIdentifier.trim(),
        recovery_code: recoveryCode.trim(),
        new_password: newPassword,
      });
      toast.success('Password reset successfully! Logged in with your new password.');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Please check your recovery code.');
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
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cobalt-600/30 border border-cobalt-500/40 flex items-center justify-center text-cobalt-300 shadow-glow-cobalt">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {mode === 'forgot' ? 'Account Recovery' : 'Developer Authentication'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Sign in to access your profile & synced workspaces'
                  : mode === 'register'
                  ? 'Create your developer profile'
                  : 'Reset your password using a 6-digit recovery code'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-1 p-1 bg-obsidian-900 border border-white/[0.06] rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cobalt-600 text-white shadow-glow-cobalt'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
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

          {successMsg && mode !== 'forgot' && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300">
              {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="demo@example.com or demo_user"
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
                      if (loginIdentifier) setForgotIdentifier(loginIdentifier);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setForgotStep(1);
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
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
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
                  <span>Fill Demo Account (demo123)</span>
                </button>
              </div>
            </form>
          ) : mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ada_dev"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    required
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
                    placeholder="ada@computing.org"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Role / Specialization
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="AI/ML Engineer"
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
                      placeholder="adalovelace"
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
                  placeholder="Architecting algorithms, distributed pipelines, and ML agents..."
                  rows={2}
                  className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer mt-1"
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Registered Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="demo@example.com or demo_user"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Enter your account username or email to generate a 6-digit password recovery code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer"
                  >
                    <span>{loading ? 'Generating Code...' : 'Send Recovery Code'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Remembered password? Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  {generatedCode && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-300">Recovery Code</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 text-emerald-100 font-bold tracking-widest">
                          {generatedCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 leading-tight">
                        Valid for 15 minutes. Enter this code and choose your new password below.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      6-Digit Recovery Code *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={10}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.trim())}
                        placeholder="e.g. 299904"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                        title={showResetPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                        aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                        title={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer mt-1"
                  >
                    <span>{loading ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      ← Request another code
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-cobalt-400 hover:text-cobalt-300 transition-colors cursor-pointer"
                    >
                      Back to Sign In
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
