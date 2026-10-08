import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-obsidian-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-cobalt-800 border border-cobalt-600/40 flex items-center justify-center shadow-glow-cobalt mb-6 animate-pulse-subtle">
        <Sparkles className="w-8 h-8 text-cobalt-300" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        AI-Powered To-Do Platform
      </h1>
      <p className="text-slate-400 max-w-md text-sm mb-6">
        Step 1: Scaffolding and Design System setup verified. Obsidian Black & Cobalt Blue theme active.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cobalt-950 border border-cobalt-800 text-cobalt-300 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-400" />
        Vite + React 18 + Tailwind CSS + Lucide Icons Ready
      </div>
    </div>
  );
}
