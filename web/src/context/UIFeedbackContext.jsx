import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
} from 'lucide-react';

const UIFeedbackContext = createContext(null);

export function UIFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    resolve: null,
  });

  // --- TOAST SYSTEM ---
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = useRef({
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  }).current;

  // Sync ref to latest addToast
  toast.success = (msg, dur) => addToast('success', msg, dur);
  toast.error = (msg, dur) => addToast('error', msg, dur);
  toast.warning = (msg, dur) => addToast('warning', msg, dur);
  toast.info = (msg, dur) => addToast('info', msg, dur);

  // --- CONFIRM DIALOG SYSTEM ---
  const confirm = useCallback(
    ({
      title = 'Are you sure?',
      message = 'This action cannot be undone.',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      danger = false,
    } = {}) => {
      return new Promise((resolve) => {
        setConfirmModal({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          danger,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirmAction = (result) => {
    if (confirmModal.resolve) {
      confirmModal.resolve(result);
    }
    setConfirmModal((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // Intercept native window.alert to automatically route through UI popups
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      toast.info(String(message));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [toast]);

  // Handle escape key on confirm modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (confirmModal.isOpen && e.key === 'Escape') {
        handleConfirmAction(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal.isOpen]);

  return (
    <UIFeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => {
          let borderClass = 'border-white/[0.1] bg-obsidian-850/95';
          let icon = <Info className="w-4 h-4 text-cobalt-400" />;
          let glowClass = 'shadow-lg';

          if (t.type === 'success') {
            borderClass = 'border-emerald-500/40 bg-obsidian-900/95 text-emerald-200';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            glowClass = 'shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]';
          } else if (t.type === 'error') {
            borderClass = 'border-rose-500/40 bg-obsidian-900/95 text-rose-200';
            icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
            glowClass = 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]';
          } else if (t.type === 'warning') {
            borderClass = 'border-amber-500/40 bg-obsidian-900/95 text-amber-200';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
            glowClass = 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]';
          } else {
            borderClass = 'border-cobalt-500/40 bg-obsidian-900/95 text-cobalt-200';
            icon = <Info className="w-4 h-4 text-cobalt-400" />;
            glowClass = 'shadow-[0_0_20px_-3px_rgba(37,99,235,0.3)]';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${borderClass} ${glowClass}`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-xs font-medium text-white leading-relaxed">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Popup */}
      {confirmModal.isOpen && (
        <div
          onClick={() => handleConfirmAction(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-obsidian-900 border border-white/[0.12] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmModal.danger
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]'
                    : 'bg-cobalt-500/10 border border-cobalt-500/30 text-cobalt-400 shadow-glow-cobalt'
                }`}
              >
                {confirmModal.danger ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] transition-colors"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 ${
                  confirmModal.danger
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]'
                    : 'bg-cobalt-600 hover:bg-cobalt-500 shadow-glow-cobalt'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIFeedbackContext.Provider>
  );
}

export function useUIFeedback() {
  const context = useContext(UIFeedbackContext);
  if (!context) {
    throw new Error('useUIFeedback must be used within a UIFeedbackProvider');
  }
  return context;
}
