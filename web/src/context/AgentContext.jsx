import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AgentAPI } from '../services/api';
import { useTasks } from './TaskContext';
import { useProjects } from './ProjectContext';

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const { fetchTasks } = useTasks();
  const { fetchProjects } = useProjects();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your AI Copilot. You can tell me in natural language to create tasks, organize projects, change priorities, or reschedule items.",
      actions: [],
      timestamp: new Date().toISOString(),
    },
  ]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await AgentAPI.getLogs(30);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load agent logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Global hotkey: Ctrl + K or Cmd + K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendCommand = async (prompt) => {
    if (!prompt.trim() || isExecuting) return;

    const userMsgId = Date.now().toString();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsExecuting(true);
    setError(null);

    try {
      const response = await AgentAPI.sendCommand(prompt);

      const agentMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: response.response,
        actions: response.actions_taken || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // If the agent took any actions in SQLite, auto-refresh tasks and projects immediately
      if (response.actions_taken && response.actions_taken.length > 0) {
        await Promise.all([fetchTasks(), fetchProjects(), fetchLogs()]);
      }

      return response;
    } catch (err) {
      const errMsg = err.message || 'Failed to process AI command';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: `⚠️ Error executing command: ${errMsg}`,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AgentContext.Provider
      value={{
        isDrawerOpen,
        setIsDrawerOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isExecuting,
        error,
        logs,
        messages,
        sendCommand,
        fetchLogs,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
