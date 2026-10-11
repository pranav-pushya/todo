import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TaskAPI } from '../services/api';
import { useProjects } from './ProjectContext';

const TaskContext = createContext(null);

const DEFAULT_DEMO_TASKS = [
  {
    id: 101,
    title: 'Explore Kortex workspace features',
    description: 'Create tasks, organize projects, and use Markdown notes with checklist sync',
    priority: 'P2',
    completed: false,
    due_date: new Date().toISOString(),
    project_id: null,
    tags: ['welcome', 'kortex'],
  },
  {
    id: 102,
    title: 'Try Autonomous AI Copilot',
    description: 'Ask copilot to plan your sprint or organize your backlog in natural language',
    priority: 'P1',
    completed: false,
    due_date: new Date(Date.now() + 86400000).toISOString(),
    project_id: null,
    tags: ['ai', 'copilot'],
  },
];

const normalizeTask = (t) => {
  if (!t) return t;
  let normalizedTags = [];
  if (Array.isArray(t.tags)) {
    normalizedTags = t.tags;
  } else if (typeof t.tags === 'string' && t.tags.trim()) {
    normalizedTags = t.tags.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return {
    ...t,
    tags: normalizedTags,
  };
};

const getStoredTasks = () => {
  try {
    const raw = localStorage.getItem('todo_local_tasks');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeTask);
      }
    }
  } catch (e) {
    console.warn('Error reading local tasks:', e);
  }
  return DEFAULT_DEMO_TASKS;
};

const saveStoredTasks = (taskList) => {
  try {
    localStorage.setItem('todo_local_tasks', JSON.stringify(taskList));
  } catch (e) {
    console.warn('Error saving local tasks:', e);
  }
};

export function TaskProvider({ children }) {
  const { selectedProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState(getStoredTasks);
  const [activeFilter, setActiveFilter] = useState('inbox'); // 'inbox' | 'today' | 'week' | 'upcoming' | 'completed' | 'dashboard' | 'all'
  const [priorityFilter, setPriorityFilter] = useState(null); // 'P1' | 'P2' | 'P3' | 'P4' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('todo_auth_token');
    if (!token) return;

    setAnalyticsLoading(true);
    try {
      const data = await TaskAPI.getAnalytics();
      if (data && typeof data === 'object') {
        setAnalytics(data);
      }
    } catch {
      // Ignore if offline
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('todo_auth_token');

    // If user is not logged in, rely entirely on persistent browser localStorage
    if (!token) {
      const allLocal = getStoredTasks();
      let filtered = allLocal;

      if (selectedProjectId) {
        filtered = filtered.filter((t) => t.project_id === selectedProjectId);
      } else if (activeFilter === 'inbox') {
        filtered = filtered.filter((t) => !t.project_id);
      } else if (activeFilter === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        filtered = filtered.filter((t) => !t.due_date || t.due_date.slice(0, 10) <= todayStr);
      } else if (activeFilter === 'upcoming') {
        const todayStr = new Date().toISOString().slice(0, 10);
        filtered = filtered.filter((t) => t.due_date && t.due_date.slice(0, 10) > todayStr);
      } else if (activeFilter === 'completed') {
        filtered = filtered.filter((t) => t.completed);
      }

      if (priorityFilter) {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
        );
      }

      setTasks(filtered.map(normalizeTask));
      setLoading(false);
      return;
    }

    // User is logged in: fetch from backend, but fallback to localStorage if network/server is unavailable
    try {
      const options = {
        priority: priorityFilter || undefined,
        search: searchQuery.trim() || undefined,
      };

      if (selectedProjectId) {
        options.projectId = selectedProjectId;
      } else if (activeFilter !== 'all' && activeFilter !== 'dashboard') {
        options.view = activeFilter;
      }

      const data = await TaskAPI.getTasks(options);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeTask);
        setTasks(normalized);
        if (normalized.length > 0 || (!options.search && !options.priority && activeFilter === 'all')) {
          saveStoredTasks(normalized);
        }
      }

      fetchAnalytics();
    } catch (err) {
      console.warn('Task fetch from backend failed, serving local browser cache:', err.message);
      // Fallback: Never leave user with zero data
      const cached = getStoredTasks();
      setTasks(cached);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedProjectId, priorityFilter, searchQuery, fetchAnalytics]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    const token = localStorage.getItem('todo_auth_token');

    // 1. If not logged in, persist to browser localStorage directly
    if (!token) {
      const newTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'P3',
        completed: false,
        due_date: taskData.due_date || null,
        project_id: taskData.project_id || null,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        created_at: new Date().toISOString(),
      };
      const normalized = normalizeTask(newTask);
      const updatedList = [normalized, ...getStoredTasks().filter((t) => t.id !== normalized.id)];
      saveStoredTasks(updatedList);
      setTasks((prev) => [normalized, ...prev]);
      return normalized;
    }

    // 2. If logged in, save to backend and mirror to localStorage
    try {
      const created = await TaskAPI.createTask(taskData);
      const normalized = normalizeTask(created);
      setTasks((prev) => [normalized, ...prev]);
      saveStoredTasks([normalized, ...getStoredTasks().filter((t) => t.id !== normalized.id)]);
      fetchProjects();
      fetchAnalytics();
      return created;
    } catch (err) {
      // Local fallback on API failure so work is never lost
      const fallback = {
        id: Date.now(),
        ...taskData,
        completed: false,
        created_at: new Date().toISOString(),
      };
      const normalized = normalizeTask(fallback);
      setTasks((prev) => [normalized, ...prev]);
      saveStoredTasks([normalized, ...getStoredTasks()]);
      return fallback;
    }
  };

  const editTask = async (taskId, updates) => {
    // Optimistic local update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? normalizeTask({ ...t, ...updates }) : t)));

    const currentLocal = getStoredTasks();
    const updatedLocal = currentLocal.map((t) => (t.id === taskId ? normalizeTask({ ...t, ...updates }) : t));
    saveStoredTasks(updatedLocal);

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return updates;

    try {
      const updated = await TaskAPI.updateTask(taskId, updates);
      fetchProjects();
      fetchAnalytics();
      return updated;
    } catch (err) {
      console.warn('API updateTask failed, preserved in local storage:', err.message);
      return updates;
    }
  };

  const toggleTask = async (taskId) => {
    let nextCompleted = false;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextCompleted = !t.completed;
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );

    const currentLocal = getStoredTasks();
    const updatedLocal = currentLocal.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveStoredTasks(updatedLocal);

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return { id: taskId, completed: nextCompleted };

    try {
      const updated = await TaskAPI.toggleTask(taskId);
      fetchProjects();
      fetchAnalytics();
      return updated;
    } catch (err) {
      console.warn('API toggleTask failed, preserved in local storage:', err.message);
      return { id: taskId, completed: nextCompleted };
    }
  };

  const removeTask = async (taskId) => {
    // Immediate removal from state and localStorage
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const currentLocal = getStoredTasks();
    saveStoredTasks(currentLocal.filter((t) => t.id !== taskId));

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return;

    try {
      await TaskAPI.deleteTask(taskId);
      fetchProjects();
      fetchAnalytics();
    } catch (err) {
      console.warn('API deleteTask failed, removed from local storage:', err.message);
    }
  };

  const deconstructTask = async (taskId) => {
    try {
      const updated = await TaskAPI.deconstructTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addSubtask = async (taskId, title, estimatedMinutes = 15) => {
    try {
      const updated = await TaskAPI.addSubtask(taskId, {
        title,
        estimated_minutes: estimatedMinutes,
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const updated = await TaskAPI.toggleSubtask(taskId, subtaskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    try {
      const updated = await TaskAPI.deleteSubtask(taskId, subtaskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeFilter,
        setActiveFilter,
        priorityFilter,
        setPriorityFilter,
        searchQuery,
        setSearchQuery,
        loading,
        error,
        analytics,
        analyticsLoading,
        fetchTasks,
        refreshTasks: fetchTasks,
        fetchAnalytics,
        addTask,
        editTask,
        toggleTask,
        removeTask,
        deconstructTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
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
