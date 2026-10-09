import React from 'react';
import { Search, Plus, Command, User } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onOpenAddTask, onOpenZen }) {
  const { setIsCommandPaletteOpen } = useAgent();
  const { searchQuery, setSearchQuery } = useTasks();
  const { user, isAuthenticated, setIsProfileModalOpen, setIsAuthModalOpen } = useAuth();

  return (
    <header className="h-16 border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search & Command Bar Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, tags, or press Ctrl+K for AI..."
            className="w-full bg-obsidian-850 hover:bg-obsidian-800 focus:bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg pl-10 pr-20 py-2 border border-white/[0.06] focus:border-cobalt-500 focus:outline-none transition-all"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[11px] text-slate-400 hover:text-white transition-colors"
            title="Open Command Bar (Ctrl+K)"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* User Profile / Auth Button */}
        {isAuthenticated && user ? (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer group shadow-sm"
            title={`Logged in as ${user.full_name || user.username} (@${user.username}) - Click to view profile (Shortcut: U)`}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-cobalt-500/50"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cobalt-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-glow-cobalt">
                {(user.full_name || user.username).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="max-w-[110px] truncate text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight">
                {user.full_name?.split(' ')[0] || user.username}
              </span>
              <span className="text-[9px] text-cobalt-400 font-mono leading-tight">
                @{user.username}
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cobalt-500/40 bg-cobalt-950/40 hover:bg-cobalt-900/60 text-xs font-medium text-cobalt-300 hover:text-white transition-all cursor-pointer shadow-glow-subtle"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Zen Focus Chamber Trigger */}
        <button
          onClick={onOpenZen}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 hover:text-white shadow-glow-subtle transition-all cursor-pointer group"
          title="Open Zen Focus Chamber (Shortcut: F)"
        >
          <span className="text-base group-hover:scale-110 transition-transform">🎯</span>
          <span className="font-semibold">Zen Focus</span>
          <span className="text-[10px] text-indigo-200 bg-indigo-900/80 px-1.5 py-0.5 rounded border border-indigo-500/40 font-mono">
            F
          </span>
        </button>

        {/* Add Task Primary Button */}
        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold shadow-glow-cobalt transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}

