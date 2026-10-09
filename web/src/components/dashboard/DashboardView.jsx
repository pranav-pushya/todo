import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useAgent } from '../../context/AgentContext';
import ConsistencyHeatmap from '../analytics/ConsistencyHeatmap';

export default function DashboardView({ onOpenAddTask }) {
  const { analytics, analyticsLoading, setActiveFilter } = useTasks();
  const { projects } = useProjects();
  const { setIsDrawerOpen, sendCommand } = useAgent();

  const data = analytics || {
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    completion_rate: 0,
    current_streak: 0,
    priority_distribution: { P1: 0, P2: 0, P3: 0, P4: 0 },
    daily_consistency: [],
    weekly_consistency: [],
  };

  // Find max value in daily consistency for scaling bars
  const maxDaily = Math.max(
    ...data.daily_consistency.map((d) => Math.max(d.completed, d.total_due, 1)),
    5
  );

  // Find max value in weekly consistency for scaling bars
  const maxWeekly = Math.max(
    ...data.weekly_consistency.map((w) => Math.max(w.completed, 1)),
    5
  );

  const handleAskAiToReschedule = () => {
    setIsDrawerOpen(true);
    sendCommand('Reschedule overdue tasks to this week');
  };

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-cobalt-800/40 border border-cobalt-600/40 flex items-center justify-center text-cobalt-300 shadow-glow-subtle">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Productivity & Consistency</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Monitor your daily task momentum, weekly consistency habits, and workload distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveFilter('week')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-cobalt-400" />
            <span>View This Week</span>
          </button>
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold shadow-glow-cobalt transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Consistency Streak */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Consistency Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.3)]">
              <Flame className="w-4 h-4 fill-amber-400/20 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.current_streak}</span>
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Days Streak</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {data.current_streak > 0
              ? '🔥 Great momentum! Keep completing daily tasks.'
              : 'Complete a task today to kick off your streak!'}
          </p>
        </div>

        {/* 2. Completion Rate */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-cobalt-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-cobalt-600/10 border border-cobalt-600/20 flex items-center justify-center text-cobalt-300 shadow-glow-subtle">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.completion_rate}%</span>
            <span className="text-[11px] text-slate-400">
              ({data.completed_tasks}/{data.total_tasks})
            </span>
          </div>
          <div className="w-full h-1.5 bg-obsidian-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cobalt-500 to-emerald-400 rounded-full transition-all duration-700 shadow-glow-subtle"
              style={{ width: `${Math.min(data.completion_rate, 100)}%` }}
            />
          </div>
        </div>

        {/* 3. Open vs Overdue */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Workload</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{data.pending_tasks}</span>
            <span className="text-xs text-slate-400">Pending Tasks</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {data.overdue_tasks > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" />
                {data.overdue_tasks} overdue
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400">✓ No overdue tasks</span>
            )}
          </div>
        </div>

        {/* 4. Weekly Velocity */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Weekly Output</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-glow-subtle">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {data.weekly_consistency[3]?.completed || 0}
            </span>
            <span className="text-xs text-indigo-300 font-semibold">Done this week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Across {projects.length} project categories
          </p>
        </div>
      </div>

      {/* GitHub-Style Consistency Matrix & Momentum Heatmap */}
      <ConsistencyHeatmap
        heatmapMatrix={data.heatmap_matrix || {}}
        currentStreak={data.current_streak || 0}
        longestStreak={data.longest_streak || 0}
        momentumScore={data.momentum_score || 0}
        totalActiveDays={data.total_active_days || 0}
      />

      {/* Main Charts Section: Daily Consistency & Weekly Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Consistency Bar Chart (Past 7 Days) */}
        <div className="lg:col-span-2 bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Daily Completion Consistency</span>
                <span className="text-xs text-slate-400 font-normal">(Past 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays completed tasks per day to help you build reliable daily habits.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cobalt-500"></span> Completed
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/[0.06]">
            {data.daily_consistency.map((day, idx) => {
              const compPercent = Math.min(Math.round((day.completed / maxDaily) * 100), 100);
              const barHeight = Math.max(compPercent, day.completed > 0 ? 15 : 6);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Hover tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded bg-obsidian-950 border border-white/[0.1] text-[10px] text-white whitespace-nowrap shadow-lg pointer-events-none">
                    {day.completed} completed
                  </div>

                  {/* The Bar */}
                  <div className="w-full max-w-[42px] bg-obsidian-800 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.is_today
                          ? 'bg-gradient-to-t from-cobalt-700 to-cobalt-400 shadow-glow-cobalt'
                          : day.completed > 0
                          ? 'bg-gradient-to-t from-cobalt-900 to-cobalt-600'
                          : 'bg-white/[0.05]'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-medium block ${
                        day.is_today ? 'text-cobalt-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {day.day}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Consistent daily effort yields higher retention and lower burnout.</span>
            <button
              onClick={() => setActiveFilter('today')}
              className="text-cobalt-400 hover:text-cobalt-300 font-medium flex items-center gap-1 text-xs"
            >
              <span>Go to Today's Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Weekly Consistency Progress (Past 4 Weeks) */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Weekly Trend</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Comparison over the past 4 weeks</p>

            <div className="mt-6 space-y-4">
              {data.weekly_consistency.map((week, idx) => {
                const widthPercent = Math.min(Math.round((week.completed / maxWeekly) * 100), 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={week.is_current ? 'text-cobalt-300 font-semibold' : 'text-slate-400'}>
                        {week.label}
                      </span>
                      <span className="text-white font-mono font-medium">
                        {week.completed} task{week.completed === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-obsidian-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          week.is_current
                            ? 'bg-gradient-to-r from-cobalt-600 to-cobalt-400 shadow-glow-subtle'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(widthPercent, week.completed > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Helper Banner */}
          <div className="mt-6 p-4 rounded-xl bg-cobalt-950/50 border border-cobalt-800/40 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cobalt-400 mt-0.5 flex-shrink-0 animate-pulse-subtle" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-0.5">Need a productivity boost?</span>
              Ask the AI Copilot to organize your week or reschedule overdue items automatically.
              {data.overdue_tasks > 0 && (
                <button
                  onClick={handleAskAiToReschedule}
                  className="mt-2 block text-cobalt-300 hover:text-white font-semibold underline text-[11px]"
                >
                  Reschedule {data.overdue_tasks} overdue tasks now →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution & Project Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Workload Distribution */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cobalt-400" />
            <span>Priority Workload</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6">Distribution across priority levels</p>

          <div className="space-y-3">
            {[
              { label: 'P1 Urgent', key: 'P1', color: 'bg-rose-500', bar: 'from-rose-600 to-rose-400' },
              { label: 'P2 High', key: 'P2', color: 'bg-amber-500', bar: 'from-amber-600 to-amber-400' },
              { label: 'P3 Medium', key: 'P3', color: 'bg-cobalt-500', bar: 'from-cobalt-600 to-cobalt-400' },
              { label: 'P4 Low', key: 'P4', color: 'bg-slate-500', bar: 'from-slate-600 to-slate-400' },
            ].map((p) => {
              const count = data.priority_distribution[p.key] || 0;
              const total = data.total_tasks || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={p.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${p.color}`} />
                      {p.label}
                    </span>
                    <span className="font-mono text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${p.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Velocity Breakdown */}
        <div className="bg-obsidian-850/80 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Project Overview</span>
            </h3>
            <span className="text-xs text-slate-400">{projects.length} Categories</span>
          </div>
          <p className="text-xs text-slate-400 mb-6">Open tasks allocated by project</p>

          <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No custom projects yet. Create one via + in the sidebar!</p>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-300 truncate max-w-[200px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: proj.color || '#1d4ed8' }}
                      />
                      <span className="truncate">{proj.title}</span>
                    </span>
                    <span className="font-mono text-xs text-cobalt-300">
                      {proj.open_tasks_count || 0} active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
