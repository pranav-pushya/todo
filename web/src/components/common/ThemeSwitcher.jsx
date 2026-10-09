import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes, activeThemeMeta } = useTheme();
  const { toast } = useUIFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme.id);
    setIsOpen(false);
    toast.success(`Theme switched to ${newTheme.name} ${newTheme.icon}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-white/[0.08] bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 hover:text-white transition-all cursor-pointer group shadow-sm"
        title="Switch UI Theme"
      >
        <span className="text-sm group-hover:rotate-12 transition-transform">
          {activeThemeMeta.icon}
        </span>
        <span className="hidden sm:inline font-semibold">{activeThemeMeta.name}</span>
        <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-cobalt-400 transition-colors" />
      </button>

      {/* Floating Theme Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-obsidian-950 border border-white/[0.12] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cobalt-400" />
              <span>Select Color Scheme</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">6 themes</span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isActive = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                    isActive
                      ? 'bg-cobalt-600/20 border border-cobalt-500/40 text-white font-medium shadow-sm'
                      : 'hover:bg-white/[0.06] text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="truncate">{t.name}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{t.desc}</div>
                    </div>
                  </div>

                  {isActive ? (
                    <Check className="w-4 h-4 text-cobalt-400 flex-shrink-0 ml-2" />
                  ) : (
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-500 font-mono">
                      Apply
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
