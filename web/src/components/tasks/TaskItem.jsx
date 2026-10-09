import React from 'react';
import { Check, Calendar, Trash2, Edit3, Tag } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';

const PRIORITY_CONFIG = {
  P1: { label: 'P1 Urgent', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  P2: { label: 'P2 High', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  P3: { label: 'P3 Medium', bg: 'bg-cobalt-500/10 text-cobalt-300 border-cobalt-500/30' },
  P4: { label: 'P4 Low', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export default function TaskItem({ task, onEdit }) {
  const { toggleTask, removeTask } = useTasks();
  const { projects } = useProjects();

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
    } catch (err) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"?`)) {
      try {
        await removeTask(task.id);
      } catch (err) {
        alert(err.message || 'Failed to delete task');
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

        {/* Metadata Badges (Project, Priority, Due Date, Tags) */}
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
        </div>
      </div>

      {/* Action Buttons on Hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
