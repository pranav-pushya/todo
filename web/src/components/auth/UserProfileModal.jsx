import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Github,
  Briefcase,
  Calendar,
  Lock,
  Edit3,
  CheckCircle,
  LogOut,
  Layers,
  FileText,
  Flame,
  Check,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function UserProfileModal({ isOpen, onClose, onOpenAuth }) {
  const { user, updateProfile, changePassword, logout, refreshProfile } = useAuth();
  const { toast, confirm } = useUIFeedback();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'edit' | 'security'
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRole(user.role || 'Fullstack Developer');
      setBio(user.bio || '');
      setGithubUsername(user.github_username || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        role: role.trim() || 'Fullstack Developer',
        bio: bio.trim() || null,
        github_username: githubUsername.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      });
      toast.success('Profile details updated successfully! ✨');
      setActiveTab('overview');
      refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password updated successfully! 🔒');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('overview');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of this developer profile?',
      confirmText: 'Sign Out',
      danger: true,
    });
    if (ok) {
      logout();
      toast.info('Signed out of session.');
      onClose();
    }
  };

  const getInitials = (name, uname) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (uname || 'DE').slice(0, 2).toUpperCase();
  };

  const formattedJoinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Oct 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-obsidian-950 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Profile Banner & Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/[0.08] bg-gradient-to-r from-cobalt-950/60 via-obsidian-900 to-indigo-950/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar with fallback badge */}
            <div className="relative group">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cobalt-500/50 shadow-glow-cobalt"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cobalt-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-glow-cobalt ring-2 ring-cobalt-500/40">
                  {getInitials(user.full_name, user.username)}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-obsidian-950"
                title="Active Developer"
              />
            </div>

            {/* Profile Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white truncate">
                  {user.full_name || user.username}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cobalt-950 border border-cobalt-700 text-cobalt-300 text-[10px] font-mono">
                  @{user.username}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cobalt-400" />
                <span>{user.role || 'Fullstack Developer'}</span>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Joined {formattedJoinDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Tasks</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{user.tasks_count || 0}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Layers className="w-3 h-3 text-cobalt-400" />
                <span>Projects</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{user.projects_count || 0}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <FileText className="w-3 h-3 text-amber-400" />
                <span>Notes</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{user.notes_count || 0}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-obsidian-900/80 border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Sprints</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{user.sprints_count || 0}</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-white/[0.08] mt-4 -mb-5 pt-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-cobalt-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'edit'
                  ? 'border-cobalt-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-2 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'security'
                  ? 'border-cobalt-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  About Developer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-900 border border-white/[0.06] rounded-xl p-3.5 italic">
                  {user.bio || 'No bio written yet. Click "Edit Profile" to tell the team about your focus areas!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-obsidian-900 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">GitHub Profile</span>
                  {user.github_username ? (
                    <a
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cobalt-300 hover:text-white transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>github.com/{user.github_username}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-600">Not linked</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-obsidian-900 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">Account Role</span>
                  <div className="text-xs text-white font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cobalt-400" />
                    <span>{user.role || 'Fullstack Developer'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Linus Torvalds"
                  className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Specialization / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. AI Systems Architect"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Username</label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Developer Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share your technical interests, tech stack, and goals..."
                  className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5 animate-fade-in">
              {pwdError && (
                <div className="px-3.5 py-2 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
                  {pwdError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-3.5 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title={showNewPassword ? "Hide password" : "Show password"}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-obsidian-900 border border-white/[0.08] focus:border-cobalt-500 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-semibold text-xs tracking-wide shadow-glow-cobalt transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-obsidian-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              Switch Account
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
