import React, { useState, useEffect, useId } from 'react';
import {
  Flame,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingDown,
  Target,
  Rocket,
  AlertTriangle,
  Sparkles,
  Focus,
  ListPlus,
  ChevronRight,
  X,
  Layers,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { SprintAPI, TaskAPI } from '../../services/api';
import { useTasks } from '../../context/TaskContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function SprintBoardView({ onOpenAddTask, onEditTask, onFocusTask }) {
  const { tasks: allGlobalTasks, fetchTasks, toggleTask } = useTasks();
  const { toast, confirm } = useUIFeedback();

  const [activeSprint, setActiveSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [burndownData, setBurndownData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [showAddToSprintModal, setShowAddToSprintModal] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // New Sprint Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newStartDate, setNewStartDate] = useState(todayStr);
  const [newEndDate, setNewEndDate] = useState(nextWeekStr);

  const fetchSprintData = async () => {
    try {
      setLoading(true);
      const res = await SprintAPI.getActiveSprint();
      if (res && res.sprint) {
        setActiveSprint(res.sprint);
        setSprintTasks(res.tasks || []);

        // Fetch burndown metrics
        try {
          const bd = await SprintAPI.getBurndown(res.sprint.id);
          setBurndownData(bd);
        } catch (e) {
          console.error('Failed to load burndown:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load active sprint:', err);
      toast.error('Failed to load active sprint data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprintData();
  }, []);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Sprint title is required');
      return;
    }

    try {
      await SprintAPI.createSprint({
        title: newTitle.trim(),
        goal: newGoal.trim() || undefined,
        start_date: newStartDate,
        end_date: newEndDate,
      });
      toast.success(`Sprint "${newTitle}" started successfully!`);
      setShowNewSprintModal(false);
      setNewTitle('');
      setNewGoal('');
      await fetchSprintData();
      await fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to create sprint');
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    const ok = await confirm({
      title: 'Complete Active Sprint',
      message: `Are you sure you want to finish "${activeSprint.title}"? Completed tasks will remain archived in the burndown history.`,
      confirmText: 'Complete Sprint',
      danger: false,
    });
    if (ok) {
      try {
        await SprintAPI.completeSprint(activeSprint.id);
        toast.success(`Sprint "${activeSprint.title}" marked as complete!`);
        await fetchSprintData();
      } catch (err) {
        toast.error(err.message || 'Failed to complete sprint');
      }
    }
  };

  const handleAssignTask = async (taskId) => {
    if (!activeSprint) return;
    try {
      await SprintAPI.addTaskToSprint(activeSprint.id, taskId);
      toast.success('Task assigned to sprint backlog');
      await fetchSprintData();
      await fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to assign task');
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      await toggleTask(task.id);
      await fetchSprintData();
      await fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  // Divide sprint tasks into columns: Done (completed), In Active Flow (P1/P2/pinned), Backlog (other active)
  const isDone = (t) => Boolean(t.completed || t.is_completed);
  const doneTasks = sprintTasks.filter((t) => isDone(t));
  const inProgressTasks = sprintTasks.filter((t) => !isDone(t) && (t.priority === 'P1' || t.priority === 'P2' || t.is_pinned));
  const backlogTasks = sprintTasks.filter((t) => !isDone(t) && t.priority !== 'P1' && t.priority !== 'P2' && !t.is_pinned);

  // Available tasks to add to sprint (not already assigned to active sprint)
  const sprintTaskIds = new Set(sprintTasks.map((t) => t.id));
  const availableTasks = allGlobalTasks.filter((t) => !sprintTaskIds.has(t.id));

  // Prediction badge config
  const getPredictionBadge = (prediction) => {
    switch (prediction) {
      case 'ahead':
        return {
          icon: Rocket,
          label: 'Ahead of Schedule',
          classes: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
        };
      case 'behind':
        return {
          icon: AlertTriangle,
          label: 'Behind Schedule',
          classes: 'bg-rose-950/70 border-rose-500/40 text-rose-400',
        };
      default:
        return {
          icon: Target,
          label: 'On Track',
          classes: 'bg-cobalt-950/70 border-cobalt-500/40 text-cobalt-300',
        };
    }
  };

  const pred = burndownData ? getPredictionBadge(burndownData.status_prediction) : null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Sprint Overview */}
      <div className="bg-obsidian-950 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cobalt-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cobalt-900/60 border border-cobalt-700/60 flex items-center justify-center text-cobalt-400 shadow-glow-cobalt">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {activeSprint ? activeSprint.title : 'Sprint Mode & Agile Burndown'}
                  </h1>
                  {activeSprint?.is_active && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Sprint
                    </span>
                  )}
                  {pred && (
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${pred.classes}`}
                    >
                      <pred.icon className="w-3.5 h-3.5" />
                      {pred.label}
                    </span>
                  )}
                </div>
                {activeSprint?.goal ? (
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    <span className="font-semibold text-slate-300">Goal:</span> {activeSprint.goal}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Solo-developer velocity tracking & linear task burndown.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddToSprintModal(true)}
              disabled={!activeSprint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <ListPlus className="w-3.5 h-3.5 text-cobalt-400" />
              <span>Add from Backlog</span>
            </button>

            <button
              onClick={() => setShowNewSprintModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white text-xs font-semibold shadow-glow-cobalt transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sprint</span>
            </button>

            {activeSprint && (
              <button
                onClick={handleCompleteSprint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>
            )}
          </div>
        </div>

        {/* Sprint Metrics Bar */}
        {activeSprint && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06] relative z-10">
            <div className="p-3 rounded-xl bg-obsidian-900/70 border border-white/[0.04]">
              <span className="text-[11px] font-medium text-slate-400">Total Scope</span>
              <p className="text-xl font-bold text-white mt-0.5">
                {activeSprint.total_tasks} <span className="text-xs font-normal text-slate-500">tasks</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-900/70 border border-white/[0.04]">
              <span className="text-[11px] font-medium text-slate-400">Burnt Down</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">
                {activeSprint.completed_tasks} <span className="text-xs font-normal text-slate-500">done</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-900/70 border border-white/[0.04]">
              <span className="text-[11px] font-medium text-slate-400">Remaining</span>
              <p className="text-xl font-bold text-cobalt-300 mt-0.5">
                {activeSprint.remaining_tasks} <span className="text-xs font-normal text-slate-500">left</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-900/70 border border-white/[0.04]">
              <span className="text-[11px] font-medium text-slate-400">Velocity</span>
              <p className="text-xl font-bold text-purple-300 mt-0.5">
                {burndownData ? burndownData.velocity_tasks_per_day : 0}{' '}
                <span className="text-xs font-normal text-slate-500">tasks/day</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Burndown Chart */}
      {burndownData && burndownData.burndown_series && burndownData.burndown_series.length > 0 && (
        <div className="bg-obsidian-950 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cobalt-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">Agile Burndown Curve</h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeSprint.start_date} → {activeSprint.end_date}
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-500 inline-block" />
                <span>Ideal Burndown</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded-full shadow-[0_0_8px_#34d399]" />
                <span>Actual Remaining</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-56 pt-2">
            <BurndownSVG
              series={burndownData.burndown_series}
              totalTasks={activeSprint.total_tasks}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
            />

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none z-30 px-3 py-2 rounded-xl bg-obsidian-900 border border-cobalt-500/40 text-xs shadow-glow-cobalt transform -translate-x-1/2 -translate-y-full transition-transform"
                style={{
                  left: `${hoveredPoint.xPct}%`,
                  top: `${Math.max(10, hoveredPoint.yPct)}%`,
                }}
              >
                <div className="font-semibold text-white font-mono text-[11px] mb-1">
                  {hoveredPoint.date} (Day {hoveredPoint.day_index})
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-300 text-[10px]">
                  <span>Ideal:</span>
                  <span className="font-mono text-slate-400">
                    {hoveredPoint.ideal_remaining.toFixed(1)} tasks
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-emerald-300 text-[10px] font-semibold">
                  <span>Actual:</span>
                  <span className="font-mono">{hoveredPoint.actual_remaining} tasks</span>
                </div>
                {hoveredPoint.completed_on_day > 0 && (
                  <div className="flex items-center justify-between gap-4 text-purple-300 text-[10px] mt-0.5">
                    <span>Completed on Day:</span>
                    <span className="font-mono">+{hoveredPoint.completed_on_day}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solo-Developer Agile Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Sprint Backlog */}
        <div className="bg-obsidian-950 border border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sprint Backlog
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 font-mono">
              {backlogTasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {backlogTasks.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/[0.06] rounded-xl">
                <p className="text-xs text-slate-500">No tasks in backlog</p>
                <button
                  onClick={() => setShowAddToSprintModal(true)}
                  className="mt-2 text-[11px] text-cobalt-400 hover:text-cobalt-300 underline cursor-pointer"
                >
                  Add from task pool
                </button>
              </div>
            ) : (
              backlogTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTaskStatus(task)}
                  onFocus={() => onFocusTask(task.id)}
                  onEdit={() => onEditTask(task)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress / Focus Chamber */}
        <div className="bg-obsidian-950 border border-cobalt-900/40 rounded-2xl p-4 flex flex-col min-h-[420px] shadow-glow-cobalt/10">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cobalt-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cobalt-300">
                In Active Flow
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cobalt-950 text-cobalt-300 font-mono border border-cobalt-700/50">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {inProgressTasks.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-cobalt-900/40 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Ready for deep work?</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Pin a task or launch Zen Chamber to pull it into active development flow.
                </p>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  highlighted
                  onToggle={() => handleToggleTaskStatus(task)}
                  onFocus={() => onFocusTask(task.id)}
                  onEdit={() => onEditTask(task)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Done / Burnt Down */}
        <div className="bg-obsidian-950 border border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Burnt Down (Done)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/40">
              {doneTasks.length}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {doneTasks.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/[0.06] rounded-xl">
                <p className="text-xs text-slate-500">No completed tasks yet</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Complete tasks to bend the burndown curve downwards!
                </p>
              </div>
            ) : (
              doneTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  isDone
                  onToggle={() => handleToggleTaskStatus(task)}
                  onFocus={() => onFocusTask(task.id)}
                  onEdit={() => onEditTask(task)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create New Sprint */}
      {showNewSprintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-950 border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-cobalt-400" />
                <h3 className="text-base font-bold text-white">Start New Sprint</h3>
              </div>
              <button
                onClick={() => setShowNewSprintModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSprint} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sprint Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sprint 2: Transformer Optimization & Eval"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cobalt-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sprint Goal / Objective
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the single most critical engineering milestone to hit?"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cobalt-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cobalt-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cobalt-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewSprintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white text-xs font-semibold shadow-glow-cobalt transition-all cursor-pointer"
                >
                  Launch Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Tasks from Backlog to Sprint */}
      {showAddToSprintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-950 border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <ListPlus className="w-5 h-5 text-cobalt-400" />
                <h3 className="text-base font-bold text-white">Add Tasks to Current Sprint</h3>
              </div>
              <button
                onClick={() => setShowAddToSprintModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 my-3">
              Select existing tasks from your general pool to assign into{' '}
              <span className="text-cobalt-300 font-semibold">{activeSprint?.title}</span>.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  All active tasks are already part of this sprint.
                </div>
              ) : (
                availableTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-white/[0.06] hover:border-cobalt-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        {task.priority || 'P3'}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAssignTask(task.id)}
                      className="px-3 py-1 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 text-white text-[11px] font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>Add</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setShowAddToSprintModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-medium text-white hover:bg-white/[0.1] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Burndown SVG Interactive Graphic
function BurndownSVG({ series, totalTasks, hoveredPoint, setHoveredPoint }) {
  if (!series || series.length === 0) return null;

  const width = 800;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxTasks = Math.max(1, totalTasks);
  const numDays = Math.max(1, series.length - 1);

  // Compute points
  const points = series.map((pt, i) => {
    const x = paddingX + (i / numDays) * chartW;
    const yIdeal = paddingY + ((maxTasks - pt.ideal_remaining) / maxTasks) * chartH;
    const yActual = paddingY + ((maxTasks - pt.actual_remaining) / maxTasks) * chartH;
    return {
      ...pt,
      x,
      yIdeal,
      yActual,
      xPct: (x / width) * 100,
      yPct: (yActual / height) * 100,
    };
  });

  const idealPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yIdeal}`).join(' ');
  const actualPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yActual}`).join(' ');

  // Gradient fill under actual line
  const areaPath = `${actualPath} L ${points[points.length - 1].x} ${
    paddingY + chartH
  } L ${points[0].x} ${paddingY + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      <line
        x1={paddingX}
        y1={paddingY}
        x2={width - paddingX}
        y2={paddingY}
        stroke="rgba(255,255,255,0.05)"
        strokeDasharray="4"
      />
      <line
        x1={paddingX}
        y1={paddingY + chartH / 2}
        x2={width - paddingX}
        y2={paddingY + chartH / 2}
        stroke="rgba(255,255,255,0.05)"
        strokeDasharray="4"
      />
      <line
        x1={paddingX}
        y1={paddingY + chartH}
        x2={width - paddingX}
        y2={paddingY + chartH}
        stroke="rgba(255,255,255,0.1)"
      />

      {/* Area fill */}
      <path d={areaPath} fill="url(#burndownGrad)" />

      {/* Ideal Path (Dashed Slate) */}
      <path
        d={idealPath}
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity="0.8"
      />

      {/* Actual Path (Solid Emerald) */}
      <path
        d={actualPath}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {points.map((pt, idx) => (
        <g key={idx} className="cursor-pointer">
          <circle
            cx={pt.x}
            cy={pt.yActual}
            r="4.5"
            fill="#10b981"
            stroke="#0b0f19"
            strokeWidth="2"
            className="transition-all hover:r-6"
            onMouseEnter={() => setHoveredPoint(pt)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        </g>
      ))}
    </svg>
  );
}

// Subcomponent: Kanban Task Card
function KanbanTaskCard({ task, isDone, highlighted, onToggle, onFocus, onEdit }) {
  const priorityColors = {
    P1: 'bg-rose-950/80 text-rose-300 border-rose-800/40',
    P2: 'bg-amber-950/80 text-amber-300 border-amber-800/40',
    P3: 'bg-blue-950/80 text-blue-300 border-blue-800/40',
    P4: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all select-none group relative ${
        highlighted
          ? 'bg-cobalt-950/40 border-cobalt-600/50 shadow-glow-cobalt/20'
          : isDone
          ? 'bg-obsidian-900/60 border-white/[0.04] opacity-75'
          : 'bg-obsidian-900 border-white/[0.06] hover:border-white/[0.15]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={onToggle}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-obsidian-950'
              : 'border-slate-500 hover:border-cobalt-400'
          }`}
        >
          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        <div className="flex-1 min-w-0" onClick={onEdit}>
          <p
            className={`text-xs font-medium cursor-pointer leading-snug line-clamp-2 ${
              isDone ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.priority && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  priorityColors[task.priority] || priorityColors.P3
                }`}
              >
                {task.priority}
              </span>
            )}

            {task.due_date && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {task.due_date}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={onFocus}
            title="Focus in Zen Chamber (F)"
            className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-cobalt-300 cursor-pointer"
          >
            <Focus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
