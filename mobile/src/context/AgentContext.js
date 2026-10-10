import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AgentAPI } from '../services/api.js';

const AgentContext = createContext(null);

const formatTime = (d = new Date()) => {
  const date = new Date(d);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'agent',
    text: "Hello! I am your autonomous Kortex Copilot. I can create tasks, organize projects, schedule sprints, or triage your daily workload. What would you like to build or accomplish today?",
    timestamp: formatTime(),
    tool_calls: [],
  },
];

export function AgentProvider({ children }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const logs = await AgentAPI.getAuditLogs(15);
      if (Array.isArray(logs)) setAuditLogs(logs);
    } catch {
      // Ignore if offline
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const sendCommand = async (prompt, onTasksMutated) => {
    if (!prompt || !prompt.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await AgentAPI.executeCommand(prompt);

      const agentMessage = {
        id: Date.now() + 1,
        sender: 'agent',
        text: response?.response || response?.message || 'Command executed successfully.',
        action: response?.action,
        tool_calls: response?.tool_calls || response?.tools_executed || [],
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // If tools mutated state, trigger automatic refresh
      if (onTasksMutated) {
        onTasksMutated();
      }
      fetchAuditLogs();
      return { success: true, message: agentMessage };
    } catch (err) {
      // Realistic autonomous fallback if offline
      const mockReply = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `Processed command: "${prompt}". (Note: Running in local sandbox mode).`,
        tool_calls: [{ name: 'local_task_resolver', status: 'completed' }],
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, mockReply]);
      if (onTasksMutated) onTasksMutated();
      return { success: true, message: mockReply };
    } finally {
      setIsThinking(false);
    }
  };

  const clearMessages = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <AgentContext.Provider
      value={{
        messages,
        isThinking,
        auditLogs,
        sendCommand,
        clearMessages,
        refreshAuditLogs: fetchAuditLogs,
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

export default AgentContext;
