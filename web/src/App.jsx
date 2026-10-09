import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { AgentProvider, useAgent } from './context/AgentContext';
import { NoteProvider } from './context/NoteContext';
import { UIFeedbackProvider, useUIFeedback } from './context/UIFeedbackContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sparkles } from 'lucide-react';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import AddTaskModal from './components/tasks/AddTaskModal';
import CreateProjectModal from './components/projects/CreateProjectModal';
import AICopilotDrawer from './components/agent/AICopilotDrawer';
import CommandPalette from './components/agent/CommandPalette';
import ZenFocusChamber from './components/focus/ZenFocusChamber';
import MLExperimentsModal from './components/ml/MLExperimentsModal';
import KeyboardCheatsheetModal from './components/common/KeyboardCheatsheetModal';
import AuthModal from './components/auth/AuthModal';
import UserProfileModal from './components/auth/UserProfileModal';
import ErrorBoundary from './components/common/ErrorBoundary';

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
    isZenOpen,
    setIsZenOpen,
    zenTaskId,
    setZenTaskId,
    isMLOpen,
    setIsMLOpen,
  } = useAgent();

  const {
    tasks,
    toggleTask,
    editTask,
    removeTask,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
  } = useTasks();
  const { selectedProjectId, setSelectedProjectId } = useProjects();
  const { toast, confirm } = useUIFeedback();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isAuthenticated,
  } = useAuth();

  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Keep highlightedIndex in bounds when tasks change
  useEffect(() => {
    if (tasks.length === 0) {
      setHighlightedIndex(-1);
    } else if (highlightedIndex >= tasks.length) {
      setHighlightedIndex(tasks.length - 1);
    }
  }, [tasks.length]);

  const highlightedTaskId =
    highlightedIndex >= 0 && highlightedIndex < tasks.length
      ? tasks[highlightedIndex]?.id
      : null;

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsAddTaskOpen(true);
  };

  const handleOpenZen = (taskId = null) => {
    setZenTaskId(taskId);
    setIsZenOpen(true);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. ESCAPE: Closes any open modal, palette, drawer, cheatsheet, or zen mode
      if (e.key === 'Escape') {
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
          return;
        }
        if (isAuthModalOpen) {
          setIsAuthModalOpen(false);
          return;
        }
        if (isCheatsheetOpen) {
          setIsCheatsheetOpen(false);
          return;
        }
        if (isMLOpen) {
          setIsMLOpen(false);
          return;
        }
        if (isZenOpen) {
          setIsZenOpen(false);
          return;
        }
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

      // 4. Vim & Hacker Keyboard Navigation
      if (e.key === '?') {
        e.preventDefault();
        setIsCheatsheetOpen((prev) => !prev);
        return;
      }

      // Move highlight down (j or ArrowDown)
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (tasks.length > 0) {
          setHighlightedIndex((prev) => (prev < tasks.length - 1 ? prev + 1 : 0));
        }
        return;
      }

      // Move highlight up (k or ArrowUp)
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (tasks.length > 0) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : tasks.length - 1));
        }
        return;
      }

      // Complete / Toggle highlighted task (x)
      if (e.key === 'x') {
        if (highlightedIndex >= 0 && highlightedIndex < tasks.length) {
          e.preventDefault();
          const t = tasks[highlightedIndex];
          toggleTask(t.id);
          toast.success(t.completed ? 'Task reopened [x]' : 'Task completed! ✨ [x]');
        }
        return;
      }

      // Edit highlighted task (e)
      if (e.key === 'e') {
        if (highlightedIndex >= 0 && highlightedIndex < tasks.length) {
          e.preventDefault();
          handleEditTask(tasks[highlightedIndex]);
        }
        return;
      }

      // Delete highlighted task (d or #)
      if (e.key === 'd' || e.key === '#') {
        if (highlightedIndex >= 0 && highlightedIndex < tasks.length) {
          e.preventDefault();
          const targetTask = tasks[highlightedIndex];
          (async () => {
            const ok = await confirm({
              title: 'Delete Task (Vim: d)',
              message: `Are you sure you want to delete "${targetTask.title}"?`,
              confirmText: 'Delete',
              danger: true,
            });
            if (ok) {
              removeTask(targetTask.id);
              toast.success('Task deleted via [d]');
            }
          })();
        }
        return;
      }

      // Set priority 1-4
      if (['1', '2', '3', '4'].includes(e.key)) {
        if (highlightedIndex >= 0 && highlightedIndex < tasks.length) {
          e.preventDefault();
          const p = `P${e.key}`;
          editTask(tasks[highlightedIndex].id, { priority: p });
          toast.success(`Priority set to ${p} on "${tasks[highlightedIndex].title}" ⚡`);
        }
        return;
      }

      // 5. Global View & Action Hotkeys
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
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedProjectId(null);
        setActiveFilter('sprint');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        if (isAuthenticated) {
          setIsProfileModalOpen((prev) => !prev);
        } else {
          setIsAuthModalOpen((prev) => !prev);
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsDrawerOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const targetId = highlightedIndex >= 0 && highlightedIndex < tasks.length
          ? tasks[highlightedIndex].id
          : null;
        handleOpenZen(targetId);
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
    tasks,
    highlightedIndex,
    isCheatsheetOpen,
    isCommandPaletteOpen,
    isAddTaskOpen,
    isCreateProjectOpen,
    isDrawerOpen,
    isZenOpen,
    isMLOpen,
    isAuthModalOpen,
    isProfileModalOpen,
    isAuthenticated,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsCommandPaletteOpen,
    setIsDrawerOpen,
    setIsAddTaskOpen,
    setIsCreateProjectOpen,
    setTaskToEdit,
    setActiveFilter,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
    toggleTask,
    editTask,
    removeTask,
    toast,
    confirm,
  ]);



  const isNotesView = !selectedProjectId && activeFilter === 'notes';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-white font-sans select-none relative">
      {/* Left Navigation Sidebar - Hidden when in Notes Workspace */}
      {!isNotesView && (
        <Sidebar
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenML={() => setIsMLOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header - Hidden when in Notes Workspace */}
        {!isNotesView && (
          <Header
            onOpenAddTask={handleOpenAddTask}
            onOpenZen={() => handleOpenZen()}
          />
        )}

        <main className="flex-1 overflow-y-auto flex flex-col bg-obsidian-900">
          <TaskList
            onOpenAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
            onFocusTask={(taskId) => handleOpenZen(taskId)}
            highlightedTaskId={highlightedTaskId}
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

      {/* Fullscreen Zen Focus Chamber */}
      <ZenFocusChamber
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        initialTaskId={zenTaskId}
      />

      {/* AI/ML Experiment & Webhook Integration Modal */}
      <MLExperimentsModal
        isOpen={isMLOpen}
        onClose={() => setIsMLOpen(false)}
      />

      {/* Linear/Vim Keyboard Shortcuts Cheatsheet */}
      <KeyboardCheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      {/* Developer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />


      {/* Developer User Profile & Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <UIFeedbackProvider>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <NoteProvider>
              <AgentProvider>
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </AgentProvider>
            </NoteProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </UIFeedbackProvider>
  );
}

