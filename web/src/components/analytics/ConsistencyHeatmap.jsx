import React, { useState, useMemo } from 'react';
import { Flame, Trophy, Zap, Calendar, Sparkles, TrendingUp, Info } from 'lucide-react';

export default function ConsistencyHeatmap({
  heatmapMatrix = {},
  currentStreak = 0,
  longestStreak = 0,
  momentumScore = 0,
  totalActiveDays = 0,
}) {
  const [range, setRange] = useState('year'); // '6months' or 'year'
  const [hoveredDay, setHoveredDay] = useState(null);

  const daysToShow = range === '6months' ? 182 : 364;

  // Build grid of 52 (or 26) weeks x 7 days
  const { weeks, monthLabels, totalCompletedInPeriod } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the end date (today) and start date
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow);

    // Adjust start date to the preceding Sunday so columns align
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const generatedWeeks = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;
    let periodTotal = 0;

    const curr = new Date(startDate);
    let weekIndex = 0;

    while (curr <= today || currentWeek.length > 0) {
      const iso = curr.toISOString().split('T')[0];
      const count = heatmapMatrix[iso] || 0;
      periodTotal += count;

      // Track month transitions for header labels
      const m = curr.getMonth();
      if (m !== lastMonth && currentWeek.length === 0) {
        months.push({
          month: curr.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        lastMonth = m;
      }

      const isFuture = curr > today;

      currentWeek.push({
        date: new Date(curr),
        iso,
        count: isFuture ? 0 : count,
        isFuture,
        isToday:
          curr.getDate() === today.getDate() &&
          curr.getMonth() === today.getMonth() &&
          curr.getFullYear() === today.getFullYear(),
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ isFuture: true, count: 0 });
      }
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalCompletedInPeriod: periodTotal,
    };
  }, [heatmapMatrix, daysToShow]);

  // Color intensity classifier
  const getCellIntensity = (count, isFuture) => {
    if (isFuture) return 'bg-transparent border-transparent pointer-events-none opacity-0';
    if (!count || count === 0) {
      return 'bg-obsidian-950/80 border border-white/[0.04] hover:border-slate-500/50';
    }
    if (count <= 2) {
      return 'bg-cobalt-950 border border-cobalt-700/60 shadow-[0_0_8px_rgba(37,99,235,0.25)] hover:border-cobalt-400';
    }
    if (count <= 4) {
      return 'bg-cobalt-800 border border-cobalt-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:border-cobalt-300';
    }
    if (count <= 6) {
      return 'bg-cobalt-600 border border-cobalt-400 shadow-[0_0_16px_rgba(96,165,250,0.55)] hover:border-white';
    }
    // Level 4 (Supercharged streak)
    return 'bg-gradient-to-tr from-cobalt-400 to-emerald-400 border border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.7)] hover:scale-125';
  };

  // Momentum Tier Description
  const getMomentumTier = (score) => {
    if (score >= 85) return { label: 'Supercharged Hyper-Flow', color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/40' };
    if (score >= 60) return { label: 'High Velocity Momentum', color: 'text-cobalt-300', badge: 'bg-cobalt-500/20 border-cobalt-500/40' };
    if (score >= 35) return { label: 'Consistent Rhythm', color: 'text-amber-300', badge: 'bg-amber-500/20 border-amber-500/40' };
    return { label: 'Building Momentum', color: 'text-slate-400', badge: 'bg-white/[0.06] border-white/[0.1]' };
  };

  const tier = getMomentumTier(momentumScore);

  return (
    <div className="bg-obsidian-850/90 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-cobalt-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06] relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-cobalt-900 border border-cobalt-600/50 flex items-center justify-center shadow-glow-subtle">
              <Flame className="w-4 h-4 text-cobalt-300 fill-cobalt-400/20" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Consistency Matrix & Momentum Heatmap</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cobalt-500/20 text-cobalt-300 border border-cobalt-500/30">
                GitHub-Grade
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {totalCompletedInPeriod} tasks knocked down in {range === 'year' ? 'the past 365 days' : 'the past 6 months'} across your workspace.
          </p>
        </div>

        {/* Momentum & Streak Badges */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Momentum Score Pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-obsidian-900/90 border border-white/[0.08]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                <span>Momentum</span>
              </span>
              <span className="text-lg font-extrabold text-white font-mono leading-tight">
                {momentumScore} <span className="text-xs text-slate-500">/ 100</span>
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.badge} ${tier.color}`}>
              {tier.label}
            </span>
          </div>

          {/* Current Streak */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900/90 border border-white/[0.08]">
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Streak</span>
              <span className="text-sm font-bold text-white font-mono">{currentStreak} days</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900/90 border border-white/[0.08]">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Streak</span>
              <span className="text-sm font-bold text-white font-mono">{longestStreak} days</span>
            </div>
          </div>

          {/* Range Switcher */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setRange('6months')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === '6months' ? 'bg-cobalt-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setRange('year')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === 'year' ? 'bg-cobalt-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="mt-6 overflow-x-auto pb-2 relative z-10 scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month Labels Header Row */}
          <div className="flex text-[10px] text-slate-500 font-medium mb-2 pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.weekIndex * 15 + 28}px` }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Heatmap Columns & Rows */}
          <div className="flex gap-[3.5px]">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2 py-0.5 select-none w-6">
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Mon</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Wed</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Fri</span>
              <span className="h-[12px] leading-[12px]"></span>
            </div>

            {/* Weeks Matrix */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3.5px]">
                {week.map((day, dIdx) => {
                  const intensityClass = getCellIntensity(day.count, day.isFuture);
                  const isHovered = hoveredDay && hoveredDay.iso === day.iso;

                  return (
                    <div
                      key={dIdx}
                      onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[12px] h-[12px] rounded-[2.5px] transition-all duration-150 cursor-pointer relative ${intensityClass} ${
                        isHovered ? 'ring-2 ring-white scale-125 z-20' : ''
                      } ${day.isToday ? 'ring-1 ring-cobalt-400' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <div className="text-slate-200 font-medium animate-fade-in flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cobalt-400" />
              <span>
                <strong className="text-white">
                  {hoveredDay.count} {hoveredDay.count === 1 ? 'task' : 'tasks'} completed
                </strong>{' '}
                on {hoveredDay.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">
              💡 Hover over any glowing square to see completions on that date.
            </span>
          )}
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-obsidian-950 border border-white/[0.06]" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-cobalt-950 border border-cobalt-700/60" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-cobalt-800 border border-cobalt-500" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-cobalt-600 border border-cobalt-400" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-tr from-cobalt-400 to-emerald-400 border border-emerald-300" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
