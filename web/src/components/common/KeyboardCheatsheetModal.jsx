import React from 'react';
import { X, Command, Keyboard, Sparkles } from 'lucide-react';

export default function KeyboardCheatsheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const SHORTCUT_SECTIONS = [
    {
      title: '⚡ Linear / Vim Task Navigation',
      shortcuts: [
        { key: 'j', desc: 'Move highlight to next task below' },
        { key: 'k', desc: 'Move highlight to previous task above' },
        { key: 'x', desc: 'Toggle complete on highlighted task' },
        { key: 'e', desc: 'Open edit modal for highlighted task' },
        { key: 'd', desc: 'Delete highlighted task (with confirmation)' },
        { key: '1, 2, 3, 4', desc: 'Instantly set priority to P1, P2, P3, or P4' },
        { key: 'f', desc: 'Enter Zen Focus Chamber with highlighted task' },
      ],
    },
    {
      title: '🧭 Workspace View Switcher',
      shortcuts: [
        { key: 't', desc: 'Jump to Today\'s tasks' },
        { key: 'w', desc: 'Jump to This Week view' },
        { key: 'i', desc: 'Jump to Inbox' },
        { key: 'd', desc: 'Jump to Productivity Dashboard' },
        { key: 's', desc: 'Jump to Sprint Mode & Burndown Chart' },
        { key: '2x Logo', desc: 'Double-click logo to open Notes Workspace' },
      ],
    },
    {
      title: '🚀 Global Actions & Hotkeys',
      shortcuts: [
        { key: 'n', desc: 'Create new task (+)' },
        { key: 'p', desc: 'Create new project' },
        { key: 'c', desc: 'Toggle AI Copilot drawer' },
        { key: 'f', desc: 'Toggle Fullscreen Zen Focus Chamber' },
        { key: 'Ctrl + K', desc: 'Open Command Palette' },
        { key: '/', desc: 'Focus live task search bar' },
        { key: '?', desc: 'Open this Keyboard Cheatsheet' },
        { key: 'Esc', desc: 'Close any open modal, palette, or Zen mode' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-obsidian-900 border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cobalt-900 border border-cobalt-600/50 flex items-center justify-center shadow-glow-subtle">
              <Keyboard className="w-5 h-5 text-cobalt-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Vim & Hacker Keyboard Shortcuts</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cobalt-500/20 text-cobalt-300 border border-cobalt-500/30">
                  Linear-Style
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Navigate and execute actions at the speed of thought without touching your mouse.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {SHORTCUT_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cobalt-400">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {section.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-950/60 border border-white/[0.04] text-xs"
                  >
                    <span className="text-slate-300 font-medium">{sc.desc}</span>
                    <span className="font-mono text-[11px] font-semibold text-cobalt-300 bg-cobalt-950 px-2 py-1 rounded-md border border-cobalt-800/80 shadow-sm">
                      {sc.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-obsidian-950 flex items-center justify-between text-xs text-slate-400">
          <span>Press <strong className="text-white font-mono">?</strong> anywhere to summon this guide.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
