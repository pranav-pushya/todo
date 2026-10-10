import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TaskAPI } from '../services/api.js';

const TaskContext = createContext(null);

const DEFAULT_DEMO_TASKS = [
  {
    id: 101,
    title: 'Initialize Expo mobile scaffold with dark theme',
    description: 'Setup app.json, babel presets, and Obsidian dark base layout',
    priority: 'P1',
    completed: true,
    due_date: new Date().toISOString(),
    project_id: 1,
    tags: ['mobile', 'setup'],
  },
  {
    id: 102,
    title: 'Implement swipeable gesture task items',
    description: 'Swipe right to complete with haptic tick, swipe left to delete',
    priority: 'P1',
    completed: false,
    due_date: new Date().toISOString(),
    project_id: 1,
    tags: ['ui', 'gestures'],
  },
  {
    id: 103,
    title: 'Connect AI Copilot command bar to Groq backend',
    description: 'Allow natural language task creation and status querying',
    priority: 'P2',
    completed: false,
    due_date: new Date(Date.now() + 86400000).toISOString(),
    project_id: 3,
    tags: ['ai', 'copilot'],
  },
  {
    id: 104,
    title: 'Review production Render API health check',
    description: 'Ensure kortex-xnin.onrender.com responds with 200 OK',
    priority: 'P3',
    completed: true,
    due_date: null,
    project_id: 2,
    tags: ['backend', 'devops'],
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('today'); // 'today' | 'inbox' | 'upcoming' | 'completed'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TaskAPI.getTasks({ limit: 100 });
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
      } else if (tasks.length === 0) {
        setTasks(DEFAULT_DEMO_TASKS);
      }
    } catch (err) {
      console.warn('fetchTasks failed, falling back to demo tasks:', err.message);
      if (tasks.length === 0) {
        setTasks(DEFAULT_DEMO_TASKS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tasks.length]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const created = await TaskAPI.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      return { success: true, task: created };
    } catch (err) {
      // Local optimistic fallback
      const fallbackTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'P3',
        completed: false,
        due_date: taskData.due_date || new Date().toISOString(),
        project_id: taskData.project_id || null,
        tags: taskData.tags || [],
      };
      setTasks((prev) => [fallbackTask, ...prev]);
      return { success: true, task: fallbackTask };
    }
  };

  const updateTask = async (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    try {
      await TaskAPI.updateTask(taskId, updates);
    } catch (err) {
      console.warn('updateTask API sync failed:', err.message);
    }
  };

  const toggleTask = async (taskId) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;

    const newCompleted = !current.completed;

    // 1. Optimistic instant UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t))
    );

    // 2. Background server sync
    try {
      await TaskAPI.toggleTask(taskId, newCompleted);
    } catch (err) {
      console.warn('toggleTask API failed:', err.message);
    }
  };

  const deleteTask = async (taskId) => {
    // 1. Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // 2. Background API delete
    try {
      await TaskAPI.deleteTask(taskId);
    } catch (err) {
      console.warn('deleteTask API failed:', err.message);
    }
  };

  // Filtered views
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Project filter
      if (selectedProjectId !== null && task.project_id !== selectedProjectId) {
        return false;
      }

      // View filter
      if (activeFilter === 'completed') {
        return task.completed;
      }

      // For non-completed views:
      if (task.completed) return false;

      if (activeFilter === 'today') {
        if (!task.due_date) return true; // show unassigned in today as default focus
        return task.due_date.slice(0, 10) <= todayStr;
      }

      if (activeFilter === 'inbox') {
        return !task.project_id;
      }

      if (activeFilter === 'upcoming') {
        if (!task.due_date) return false;
        return task.due_date.slice(0, 10) > todayStr;
      }

      return true;
    });
  }, [tasks, activeFilter, selectedProjectId, searchQuery]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, completionRate };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        isLoading,
        activeFilter,
        setActiveFilter,
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        fetchTasks,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;
