import React, { useEffect } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { AgentProvider, useAgent } from './context/AgentContext';
import { NoteProvider } from './context/NoteContext';
import { Sparkles } from 'lucide-react';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import AddTaskModal from './components/tasks/AddTaskModal';
import CreateProjectModal from './components/projects/CreateProjectModal';
import AICopilotDrawer from './components/agent/AICopilotDrawer';
import CommandPalette from './components/agent/CommandPalette';

function AppContent() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    isAddTaskOpen,
    setIsAddTaskOpen,
    taskToEdit,
    setTaskToEdit,
    isCreateProjectOpen,
    setIsCreateProjectOpen,
  } = useAgent();

  const { setActiveFilter, searchQuery, setSearchQuery } = useTasks();
  const { setSelectedProjectId } = useProjects();

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsAddTaskOpen(true);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. ESCAPE: Closes any open modal, palette, or drawer, or clears search
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isAddTaskOpen) {
          setIsAddTaskOpen(false);
          setTaskToEdit(null);
          return;
        }
        if (isCreateProjectOpen) {
          setIsCreateProjectOpen(false);
          return;
        }
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          return;
        }
      }

      // 2. Ctrl+K or Cmd+K: Open/close Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 3. Ignore single-key shortcuts when typing in inputs/textareas
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      // 4. Global single-key navigation when not typing
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenAddTask();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsCreateProjectOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedProjectId(null);
        setActiveFilter('today');
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedProjectId(null);
        setActiveFilter('week');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setSelectedProjectId(null);
        setActiveFilter('dashboard');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setSelectedProjectId(null);
        setActiveFilter('inbox');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search tasks"]');
        if (searchInput) {
          searchInput.focus();
        } else {
          setIsCommandPaletteOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isAddTaskOpen,
    isCreateProjectOpen,
    isDrawerOpen,
    setIsCommandPaletteOpen,
    setIsDrawerOpen,
    setIsAddTaskOpen,
    setIsCreateProjectOpen,
    setTaskToEdit,
    setActiveFilter,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
  ]);

  const isNotesView = !selectedProjectId && activeFilter === 'notes';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-white font-sans select-none relative">
      {/* Left Navigation Sidebar - Hidden when in Notes Workspace */}
      {!isNotesView && (
        <Sidebar onOpenCreateProject={() => setIsCreateProjectOpen(true)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header - Hidden when in Notes Workspace */}
        {!isNotesView && <Header onOpenAddTask={handleOpenAddTask} />}

        <main className="flex-1 overflow-y-auto flex flex-col bg-obsidian-900">
          <TaskList
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
          />
        </main>
      </div>

      {/* Floating AI Copilot Trigger at Bottom Right Corner */}
      {!isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-cobalt-700 hover:bg-cobalt-600 text-white font-medium text-xs shadow-glow-cobalt border border-cobalt-500/50 hover:scale-105 active:scale-95 transition-all group backdrop-blur-md cursor-pointer"
          title="Open AI Copilot (Shortcut: C)"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-cobalt-700 animate-pulse" />
          </div>
          <span className="font-semibold tracking-wide">AI Copilot</span>
          <span className="text-[10px] text-cobalt-200 bg-cobalt-900/80 px-1.5 py-0.5 rounded border border-cobalt-600/60 font-mono">
            C
          </span>
        </button>
      )}

      {/* Right AI Copilot Drawer */}
      <AICopilotDrawer />

      {/* Ctrl + K Command Palette */}
      <CommandPalette
        onOpenAddTask={handleOpenAddTask}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <TaskProvider>
        <NoteProvider>
          <AgentProvider>
            <AppContent />
          </AgentProvider>
        </NoteProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}
