import React, { useState } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { AgentProvider, useAgent } from './context/AgentContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { Sparkles, CheckCircle2 } from 'lucide-react';

function MainCanvas({ onOpenAddTask }) {
  const { activeFilter, priorityFilter, searchQuery } = useTasks();
  const { projects, selectedProjectId } = useProjects();
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const getTitle = () => {
    if (currentProject) return currentProject.title;
    switch (activeFilter) {
      case 'inbox':
        return 'Inbox';
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return 'All Tasks';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          {currentProject && (
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: currentProject.color || '#3b82f6' }}
            />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white">{getTitle()}</h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/[0.04] bg-obsidian-850/40 p-8">
        <div className="w-12 h-12 rounded-2xl bg-cobalt-950 border border-cobalt-800 flex items-center justify-center text-cobalt-400 mb-4 shadow-glow-subtle">
          <CheckCircle2 className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-semibold text-slate-100 mb-1">
          Navigation Layout Shell Active
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-4">
          Step 4 complete: Sidebar navigation, Header search bar, and view filtering are mounted and reactive.
        </p>
        <span className="text-[11px] px-3 py-1 rounded-full bg-cobalt-950 border border-cobalt-800 text-cobalt-300 font-mono">
          Active View: {activeFilter.toUpperCase()} {currentProject ? `(${currentProject.title})` : ''}
        </span>
      </div>
    </main>
  );
}

function AppContent() {
  const handleOpenAddTask = () => {
    alert('Task Modal will be connected in Step 5!');
  };

  const handleOpenCreateProject = () => {
    alert('Create Project Modal will be connected in Step 5!');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-white font-sans select-none">
      {/* Left Navigation Sidebar */}
      <Sidebar onOpenCreateProject={handleOpenCreateProject} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onOpenAddTask={handleOpenAddTask} />
        <MainCanvas onOpenAddTask={handleOpenAddTask} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <TaskProvider>
        <AgentProvider>
          <AppContent />
        </AgentProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}
