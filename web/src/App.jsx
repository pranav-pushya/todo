import React, { useEffect } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { AgentProvider, useAgent } from './context/AgentContext';

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-white font-sans select-none">
      {/* Left Navigation Sidebar */}
      <Sidebar onOpenCreateProject={() => setIsCreateProjectOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onOpenAddTask={handleOpenAddTask} />

        <main className="flex-1 overflow-y-auto flex flex-col bg-obsidian-900">
          <TaskList
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
          />
        </main>
      </div>

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
        <AgentProvider>
          <AppContent />
        </AgentProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}
