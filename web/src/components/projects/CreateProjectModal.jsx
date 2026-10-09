import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

const COLOR_PRESETS = [
  { name: 'Cobalt', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#ef4444' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Indigo', hex: '#6366f1' },
];

export default function CreateProjectModal({ isOpen, onClose }) {
  const { addProject, setSelectedProjectId } = useProjects();
  const { toast } = useUIFeedback();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a project name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await addProject({
        title: title.trim(),
        description: description.trim() || null,
        color: selectedColor,
      });
      setSelectedProjectId(created.id);
      toast.success(`Project "${created.title}" created ✨`);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-obsidian-900 border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-cobalt-400" />
            <h2 className="text-base font-semibold text-white">Create Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 Roadmap or Redesign"
              className="w-full bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional summary of this project..."
              className="w-full bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg px-3.5 py-2 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-obsidian-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-cobalt transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
