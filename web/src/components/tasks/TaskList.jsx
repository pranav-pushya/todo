import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import TaskItem from './TaskItem';
import DashboardView from '../dashboard/DashboardView';
import { CheckCircle2, ListFilter, Plus } from 'lucide-react';

export default function TaskList({ onOpenAddTask, onEditTask }) {
  const {
    tasks,
    loading,
    error,
    activeFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
  } = useTasks();

  const { projects, selectedProjectId } = useProjects();

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // If user navigated to Dashboard view and no project is selected, render DashboardView
  if (!selectedProjectId && activeFilter === 'dashboard') {
    return <DashboardView onOpenAddTask={onOpenAddTask} />;
  }

  // Compute view header title
  const getHeaderTitle = () => {
    if (currentProject) return currentProject.title;
    switch (activeFilter) {
      case 'inbox':
        return 'Inbox';
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed Tasks';
      default:
        return 'All Tasks';
    }
  };

  const priorities = [
    { id: null, label: 'All' },
    { id: 'P1', label: 'P1 Urgent' },
    { id: 'P2', label: 'P2 High' },
    { id: 'P3', label: 'P3 Medium' },
    { id: 'P4', label: 'P4 Low' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            {currentProject && (
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: currentProject.color || '#3b82f6' }}
              />
            )}
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {getHeaderTitle()}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-medium">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {currentProject?.description && (
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {currentProject.description}
            </p>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cobalt-400" />
          <span>New</span>
        </button>
      </div>

      {/* Priority Filter Pills */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        <ListFilter className="w-3.5 h-3.5 text-slate-500 mr-1" />
        {priorities.map((p) => {
          const isSelected = priorityFilter === p.id;
          return (
            <button
              key={p.label}
              onClick={() => setPriorityFilter(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cobalt-900 border border-cobalt-600 text-white shadow-glow-subtle'
                  : 'bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 rounded-xl bg-obsidian-850/50 animate-pulse border border-white/[0.04]"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 mb-4">
            <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            {searchQuery ? 'No matching tasks' : 'All clear!'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            {searchQuery
              ? `No tasks matched "${searchQuery}". Try a different keyword.`
              : 'You have no pending tasks in this view. Enjoy your free time or add a new task.'}
          </p>
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold shadow-glow-cobalt transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        /* Task List */
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      )}
    </div>
  );
}
