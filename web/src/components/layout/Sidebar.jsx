import React from 'react';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle,
  BarChart3,
  Plus,
  Trash2,
  Sparkles,
  Command,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useAgent } from '../../context/AgentContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function Sidebar({ onOpenCreateProject }) {
  const { activeFilter, setActiveFilter } = useTasks();
  const { projects, selectedProjectId, setSelectedProjectId, removeProject } = useProjects();
  const { setIsDrawerOpen, setIsCommandPaletteOpen } = useAgent();
  const { toast, confirm } = useUIFeedback();

  const handleSelectNav = (filter) => {
    setSelectedProjectId(null);
    setActiveFilter(filter);
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const handleDeleteProject = async (e, projectId, projectTitle = 'this project') => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectTitle}" and all its associated tasks? This action cannot be undone.`,
      confirmText: 'Delete Project',
      danger: true,
    });
    if (ok) {
      try {
        await removeProject(projectId);
        toast.success(`Project "${projectTitle}" deleted successfully`);
      } catch (err) {
        toast.error(err.message || 'Failed to delete project');
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: 'Overview' },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'week', label: 'This Week', icon: CalendarDays },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-obsidian-950 flex flex-col h-screen select-none">
      {/* Brand Logo - Double click triggers Notes Workspace */}
      <div
        onDoubleClick={() => handleSelectNav('notes')}
        title="Double-click logo to open Notes Workspace!"
        className="h-16 border-b border-white/[0.08] px-6 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cobalt-700 flex items-center justify-center shadow-glow-cobalt group-hover:scale-105 transition-transform">
            <CheckCircle className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-cobalt-300 transition-colors">
              AI To-Do
            </span>
            <span className="text-[9px] text-slate-500 font-mono hidden group-hover:block transition-all">
              2x click: Notes
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cobalt-950 border border-cobalt-800 text-cobalt-300">
          v1.0
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Views
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !selectedProjectId && activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cobalt-900/60 text-cobalt-300 border border-cobalt-700/50 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cobalt-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-cobalt-800 text-cobalt-200'
                        : 'bg-white/[0.05] text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            <span>Projects</span>
            <button
              onClick={onOpenCreateProject}
              className="p-1 rounded hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-600 italic">No projects yet</div>
          ) : (
            projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cobalt-900/40 text-white border border-cobalt-800/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color || '#1d4ed8' }}
                    />
                    <span className="truncate">{proj.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {proj.open_tasks_count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
                        {proj.open_tasks_count}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteProject(e, proj.id, proj.title)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Copilot Status Card */}
      <div className="p-3 border-t border-white/[0.08] space-y-2">
        <div
          onClick={() => setIsDrawerOpen(true)}
          className="p-3 rounded-xl bg-cobalt-950/60 border border-cobalt-900/70 hover:border-cobalt-700/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-cobalt-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cobalt-400 group-hover:animate-spin" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Ask AI to organize your day, create tasks, or reschedule items.
          </p>
        </div>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-slate-500" />
            <span>Command Menu</span>
          </span>
          <span className="text-[10px] text-slate-500">Ctrl+K</span>
        </button>
      </div>
    </aside>
  );
}
