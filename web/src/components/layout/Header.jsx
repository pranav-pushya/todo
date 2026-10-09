import React from 'react';
import { Search, Plus, Command } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useTasks } from '../../context/TaskContext';

export default function Header({ onOpenAddTask, onOpenZen }) {
  const { setIsCommandPaletteOpen } = useAgent();
  const { searchQuery, setSearchQuery } = useTasks();

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
