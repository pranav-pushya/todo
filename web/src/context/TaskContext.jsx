import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TaskAPI } from '../services/api';
import { useProjects } from './ProjectContext';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { selectedProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('inbox'); // 'inbox' | 'today' | 'upcoming' | 'completed' | 'all'
  const [priorityFilter, setPriorityFilter] = useState(null); // 'P1' | 'P2' | 'P3' | 'P4' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } else if (activeFilter !== 'all') {
        options.view = activeFilter;
      }

      const data = await TaskAPI.getTasks(options);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedProjectId, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const created = await TaskAPI.createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      // Refresh projects so completion counts update
      fetchProjects();
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
        fetchTasks,
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
