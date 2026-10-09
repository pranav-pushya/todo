import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Trash2,
  Edit3,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { useNotes } from '../../context/NoteContext';

const PRIORITY_CONFIG = {
  P1: { label: 'P1 Urgent', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  P2: { label: 'P2 High', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  P3: { label: 'P3 Medium', bg: 'bg-cobalt-500/10 text-cobalt-300 border-cobalt-500/30' },
  P4: { label: 'P4 Low', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export default function TaskItem({ task, onEdit, onFocus }) {
  const {
    toggleTask,
    removeTask,
    deconstructTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    setActiveFilter,
  } = useTasks();
  const { projects, setSelectedProjectId } = useProjects();
  const { toast, confirm } = useUIFeedback();
  const { openTaskScratchpad } = useNotes();

  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleOpenScratchpad = async (e) => {
    e.stopPropagation();
    try {
      await openTaskScratchpad(task.id);
      setSelectedProjectId(null);
      setActiveFilter('notes');
      toast.success(`Opened Scratchpad for "${task.title}" 📝`);
    } catch (err) {
      toast.error(err.message || 'Failed to open scratchpad');
    }
  };

  const project = projects.find((p) => p.id === task.project_id);

  // Format and determine overdue status
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isOverdue = date < today && !task.completed;

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      text: isToday ? 'Today' : formatted,
      isOverdue,
      isToday,
    };
  };

  const dueInfo = formatDueDate(task.due_date);
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.P4;

  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      await toggleTask(task.id);
      toast.success(task.completed ? 'Task reopened' : 'Task completed! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to toggle task');
    }
  };

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  const handleDeconstruct = async (e) => {
    e.stopPropagation();
    setIsDeconstructing(true);
    try {
      await deconstructTask(task.id);
      setIsSubtasksExpanded(true);
      toast.success('Task deconstructed into actionable steps! ⚡');
    } catch (err) {
      toast.error(err.message || 'Failed to deconstruct task');
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleToggleSubtask = async (e, subtaskId) => {
    e.stopPropagation();
    try {
      await toggleSubtask(task.id, subtaskId);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle subtask');
    }
  };

  const handleDeleteSubtask = async (e, subtaskId) => {
    e.stopPropagation();
    try {
      await deleteSubtask(task.id, subtaskId);
      toast.success('Subtask removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete subtask');
    }
  };

  const handleAddManualSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      await addSubtask(task.id, newSubtaskTitle.trim(), 15);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      setIsSubtasksExpanded(true);
      toast.success('Subtask added');
    } catch (err) {
      toast.error(err.message || 'Failed to add subtask');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      confirmText: 'Delete Task',
      danger: true,
    });
    if (ok) {
      try {
        await removeTask(task.id);
        toast.success(`Task "${task.title}" deleted`);
      } catch (err) {
        toast.error(err.message || 'Failed to delete task');
      }
    }
  };

  return (
    <div
      className={`group flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
        task.completed
          ? 'bg-obsidian-950/40 border-white/[0.04] opacity-60'
          : 'bg-obsidian-850/60 hover:bg-obsidian-800/80 border-white/[0.06] hover:border-white/[0.12] shadow-sm'
      }`}
    >
      {/* Custom Animated Checkbox */}
      <button
        onClick={handleToggle}
        className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-cobalt-600 border-cobalt-600 text-white shadow-glow-subtle'
            : 'border-slate-500/50 hover:border-cobalt-400 bg-obsidian-900/80 text-transparent'
        }`}
        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <Check className={`w-3 h-3 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      {/* Main Task Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`text-sm font-medium leading-snug transition-colors ${
              task.completed ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {task.title}
          </span>
        </div>

        {task.description && (
          <p
            className={`text-xs mb-2 leading-relaxed line-clamp-2 ${
              task.completed ? 'text-slate-600 line-through' : 'text-slate-400'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Metadata Badges (Project, Priority, Due Date, Tags, Subtasks Pill) */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {/* Priority Badge */}
          <span
            className={`px-2 py-0.5 rounded-md font-medium border text-[10px] ${priorityInfo.bg}`}
          >
            {priorityInfo.label}
          </span>

          {/* Project Badge */}
          {project && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: project.color || '#3b82f6' }}
              />
              <span className="truncate max-w-[120px]">{project.title}</span>
            </span>
          )}

          {/* Due Date Badge */}
          {dueInfo && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${
                dueInfo.isOverdue
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : dueInfo.isToday
                  ? 'bg-cobalt-500/15 text-cobalt-300 border-cobalt-500/30'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{dueInfo.text}</span>
            </span>
          )}

          {/* Subtasks Count Badge / Toggle */}
          {subtasks.length > 0 && (
            <button
              type="button"
              onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cobalt-950/70 border border-cobalt-800/50 text-[10px] font-medium text-cobalt-300 hover:bg-cobalt-900/60 transition-colors"
              title="Toggle Subtask Checklist"
            >
              {isSubtasksExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <span>
                Subtasks: {completedSubtasksCount}/{subtasks.length}
              </span>
            </button>
          )}

          {/* Tags */}
          {task.tags &&
            task.tags.length > 0 &&
            task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-400 text-[10px]"
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </span>
            ))}

          {/* Linked Scratchpad Pill */}
          <button
            type="button"
            onClick={handleOpenScratchpad}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cobalt-950/80 border border-white/[0.08] hover:border-cobalt-700/60 text-[10px] text-slate-400 hover:text-cobalt-300 transition-all cursor-pointer"
            title="Open dedicated Notes scratchpad for this task"
          >
            <FileText className="w-2.5 h-2.5 text-cobalt-400" />
            <span>Scratchpad</span>
          </button>
        </div>

        {/* Subtasks Expanded Container */}
        {isSubtasksExpanded && subtasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
            {/* Subtask Progress Bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold text-cobalt-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cobalt-400" />
                <span>Action Steps ({completedSubtasksCount}/{subtasks.length})</span>
              </span>
              <span className="font-mono text-[9px]">
                {Math.round((completedSubtasksCount / subtasks.length) * 100)}% done
              </span>
            </div>
            <div className="w-full h-1 bg-obsidian-950 rounded-full overflow-hidden border border-white/[0.04]">
              <div
                className="h-full bg-gradient-to-r from-cobalt-600 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${(completedSubtasksCount / subtasks.length) * 100}%` }}
              />
            </div>

            {/* Subtasks List */}
            <div className="space-y-1.5 pt-1">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-obsidian-950/60 border border-white/[0.04] hover:border-white/[0.08] transition-colors group/sub"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleSubtask(e, st.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                        st.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'border-slate-500/60 hover:border-cobalt-400 bg-obsidian-900 text-transparent'
                      }`}
                    >
                      <Check className={`w-2.5 h-2.5 stroke-[3] ${st.completed ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                    <span
                      className={`text-xs truncate ${
                        st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {st.estimated_minutes && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5 text-cobalt-400" />
                        <span>{st.estimated_minutes}m</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubtask(e, st.id)}
                      className="opacity-0 group-hover/sub:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                      title="Remove subtask"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Subtask Input */}
            {isAddingSubtask ? (
              <form onSubmit={handleAddManualSubtask} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Subtask title (e.g. Write test fixtures)..."
                  autoFocus
                  className="flex-1 bg-obsidian-950 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cobalt-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-[11px] font-semibold transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cobalt-300 pt-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add step</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons on Hover */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Zen Focus Button */}
        {onFocus && !task.completed && (
          <button
            onClick={() => onFocus(task.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-[10px] font-semibold text-indigo-300 hover:text-white transition-all shadow-glow-subtle cursor-pointer"
            title="🎯 Enter Zen Flow Chamber focused on this task (F)"
          >
            <span>🎯</span>
            <span>Focus</span>
          </button>
        )}

        {/* Magic Subtasking Button */}
        <button
          onClick={handleDeconstruct}
          disabled={isDeconstructing}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cobalt-950 hover:bg-cobalt-900 border border-cobalt-700/60 text-[10px] font-semibold text-cobalt-300 hover:text-white transition-all shadow-glow-subtle disabled:opacity-50"
          title="⚡ Magic Subtasking: AI deconstructs this task into 15m steps"
        >
          <Sparkles className={`w-3 h-3 text-cobalt-400 ${isDeconstructing ? 'animate-spin' : ''}`} />
          <span>{isDeconstructing ? 'Deconstructing...' : 'Deconstruct'}</span>
        </button>

        {/* Scratchpad Button */}
        <button
          onClick={handleOpenScratchpad}
          className="p-1.5 rounded-lg hover:bg-cobalt-950/80 text-slate-400 hover:text-cobalt-300 transition-colors"
          title="Open Linked Notes Scratchpad"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          title="Edit Task"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
