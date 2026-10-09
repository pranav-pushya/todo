import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, ArrowRight, Github, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const { toast } = useUIFeedback();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setMode('login');
    setLoginIdentifier('demo@example.com');
    setLoginPassword('demo123');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
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
              <h2 className="text-base font-semibold text-white">Developer Authentication</h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Sign in to access your profile & synced workspaces' : 'Create your developer profile'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-1 p-1 bg-obsidian-900 border border-white/[0.06] rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
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
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cobalt-600 text-white shadow-glow-cobalt'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    required
                  />
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
          ) : (
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
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    required
                  />
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
          )}
        </div>
      </div>
    </div>
  );
}
