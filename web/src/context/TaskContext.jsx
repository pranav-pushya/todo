import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TaskAPI } from '../services/api';
import { useProjects } from './ProjectContext';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { selectedProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('inbox'); // 'inbox' | 'today' | 'week' | 'upcoming' | 'completed' | 'dashboard' | 'all'
  const [priorityFilter, setPriorityFilter] = useState(null); // 'P1' | 'P2' | 'P3' | 'P4' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await TaskAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setTasks(data);

      // Auto-load analytics whenever tasks or view updates
      fetchAnalytics();
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedProjectId, priorityFilter, searchQuery, fetchAnalytics]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const created = await TaskAPI.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      fetchProjects();
      fetchAnalytics();
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editTask = async (taskId, updates) => {
    try {
      const updated = await TaskAPI.updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      fetchProjects();
      fetchAnalytics();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const updated = await TaskAPI.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      fetchProjects();
      fetchAnalytics();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTask = async (taskId) => {
    try {
      await TaskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      fetchProjects();
      fetchAnalytics();
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
        fetchAnalytics,
        addTask,
        editTask,
        toggleTask,
        removeTask,
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
