import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  FolderPlus,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useTasks } from '../../context/TaskContext';

export default function CommandPalette({ onOpenAddTask, onOpenCreateProject }) {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, sendCommand, setIsDrawerOpen } =
    useAgent();
  const { setActiveFilter } = useTasks();

  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape when Command Palette is open
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleRunCommand = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendCommand(query.trim());
      setIsCommandPaletteOpen(false);
      setIsDrawerOpen(true);
      setQuery('');
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = (actionFn) => {
    setIsCommandPaletteOpen(false);
    actionFn();
  };

  return (
    <div
      onClick={() => setIsCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-obsidian-900 border border-white/[0.12] shadow-2xl overflow-hidden"
      >
        {/* Input Field */}
        <form onSubmit={handleRunCommand} className="relative flex items-center px-4 py-3 border-b border-white/[0.08]">
          <Sparkles className="w-5 h-5 text-cobalt-400 mr-3 animate-pulse-subtle flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsCommandPaletteOpen(false);
              }
            }}
            placeholder="Type an AI command (e.g. 'Add task Test API due tomorrow') or pick below..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-medium transition-all"
            >
              <span>{isSubmitting ? 'Running...' : 'Run AI'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Shortcut Navigation */}
        <div className="p-3 space-y-1 text-xs">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Quick Actions
          </div>

          <button
            onClick={() => handleAction(onOpenAddTask)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors group text-left"
          >
            <span className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-cobalt-400" />
              <span>Create New Task</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">N</span>
          </button>

          <button
            onClick={() => handleAction(onOpenCreateProject)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors group text-left"
          >
            <span className="flex items-center gap-2.5">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Create New Project</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">P</span>
          </button>

          <button
            onClick={() =>
              handleAction(() => {
                setActiveFilter('today');
              })
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors group text-left"
          >
            <span className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>View Today's Tasks</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">T</span>
          </button>

          <button
            onClick={() =>
              handleAction(() => {
                setIsDrawerOpen(true);
              })
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors group text-left"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cobalt-400" />
              <span>Open AI Copilot Chat & Tool Logs</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">C</span>
          </button>
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2.5 bg-obsidian-950/80 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Type instructions like "Create task Fix Bug due tomorrow"</span>
          <span className="font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-400">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
