import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Folder } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';

export default function AddTaskModal({ isOpen, onClose, taskToEdit = null }) {
  const { addTask, editTask } = useTasks();
  const { projects, selectedProjectId } = useProjects();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P4');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'P4');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.slice(0, 10) : '');
      setProjectId(taskToEdit.project_id ? String(taskToEdit.project_id) : '');
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('P4');
      setDueDate('');
      setProjectId(selectedProjectId ? String(selectedProjectId) : '');
      setTagsInput('');
    }
    setError(null);
  }, [taskToEdit, isOpen, selectedProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      project_id: projectId ? Number(projectId) : null,
      tags: tags.length > 0 ? tags : null,
    };

    try {
      if (taskToEdit) {
        await editTask(taskToEdit.id, payload);
      } else {
        await addTask(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
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
        className="w-full max-w-lg rounded-2xl bg-obsidian-900 border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-white">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize project report"
              className="w-full bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, checklist notes, or links..."
              className="w-full bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg px-3.5 py-2 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Grid: Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-obsidian-800 text-sm text-white rounded-lg px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none"
              >
                <option value="P1">P1 - Urgent</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-obsidian-800 text-sm text-white rounded-lg px-3.5 py-2 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid: Project & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <span>Project</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-obsidian-800 text-sm text-white rounded-lg px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none"
              >
                <option value="">Inbox (No Project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="work, urgent, bug"
                className="w-full bg-obsidian-800 text-sm text-white placeholder-slate-500 rounded-lg px-3.5 py-2 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
