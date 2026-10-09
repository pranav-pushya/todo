import React, { useState } from 'react';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { AgentProvider } from './context/AgentContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import AddTaskModal from './components/tasks/AddTaskModal';
import CreateProjectModal from './components/projects/CreateProjectModal';
import AICopilotDrawer from './components/agent/AICopilotDrawer';
import CommandPalette from './components/agent/CommandPalette';

function AppContent() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsAddTaskOpen(true);
  };

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
