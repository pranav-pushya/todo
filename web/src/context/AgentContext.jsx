import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AgentAPI } from '../services/api';
import { useTasks } from './TaskContext';
import { useProjects } from './ProjectContext';
import { useNotes } from './NoteContext';

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const { fetchTasks, setActiveFilter, setPriorityFilter, setSearchQuery } = useTasks();
  const { fetchProjects, projects, setSelectedProjectId } = useProjects();
  const { fetchNotes } = useNotes();

  // Drawers and Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [zenTaskId, setZenTaskId] = useState(null);
  const [isMLOpen, setIsMLOpen] = useState(false);

  // Execution state & logs
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your AI Copilot & UI Controller. You can tell me in natural language to open modals, navigate views, search tasks, create to-dos, or execute multiple commands collectively!",
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

  // Global hotkey: Ctrl + K or Cmd + K to open/close Command Palette
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

  /**
   * Directly executes a web application UI action requested by user or AI
   */
  const executeUiAction = useCallback(
    (actionObj) => {
      if (!actionObj) return;
      const action = (actionObj.ui_action || actionObj.action || '').toLowerCase().trim();

      switch (action) {
        case 'open_command_palette':
          setIsCommandPaletteOpen(true);
          break;
        case 'close_command_palette':
          setIsCommandPaletteOpen(false);
          break;
        case 'open_add_task_modal':
          setTaskToEdit(null);
          setIsAddTaskOpen(true);
          break;
        case 'open_create_project_modal':
          setIsCreateProjectOpen(true);
          break;
        case 'open_ml_lab':
          setIsMLOpen(true);
          break;
        case 'open_focus_chamber':
        case 'open_zen':
          setZenTaskId(actionObj.task_id || null);
          setIsZenOpen(true);
          break;
        case 'close_modals':
          setIsAddTaskOpen(false);
          setTaskToEdit(null);
          setIsCreateProjectOpen(false);
          setIsCommandPaletteOpen(false);
          setIsZenOpen(false);
          setIsMLOpen(false);
          break;
        case 'open_notes':
          setSelectedProjectId(null);
          setActiveFilter('notes');
          break;
        case 'open_sprint':
          setSelectedProjectId(null);
          setActiveFilter('sprint');
          break;
        case 'navigate_view':
          if (actionObj.view) {
            setSelectedProjectId(null);
            setActiveFilter(actionObj.view.toLowerCase());
          } else if (actionObj.project_id) {
            setSelectedProjectId(Number(actionObj.project_id));
          } else if (actionObj.project_name) {
            const found = projects.find(
              (p) => p.title.toLowerCase() === actionObj.project_name.toLowerCase()
            );
            if (found) {
              setSelectedProjectId(found.id);
            }
          }
          break;
        case 'filter_priority':
          if (actionObj.priority) {
            const p = actionObj.priority.toUpperCase();
            setPriorityFilter(p === 'ALL' || !p ? null : p);
          }
          break;
        case 'search_tasks':
          if (actionObj.search_query !== undefined && actionObj.search_query !== null) {
            setSearchQuery(actionObj.search_query);
          }
          break;
        case 'clear_search':
          setSearchQuery('');
          break;
        default:
          break;
      }
    },
    [projects, setActiveFilter, setPriorityFilter, setSearchQuery, setSelectedProjectId]
  );

  /**
   * Fast client-side intent extractor for instant UI responsiveness
   */
  const parseLocalUiIntents = useCallback((prompt) => {
    const p = prompt.toLowerCase().trim();
    const intents = [];

    // 1. Open / Close Command Palette / Menu
    if (
      /\b(open|show|kholo)\s+(cmd|command)\s*(menu|palette|bar)?\b/i.test(p) ||
      p === 'cmd menu' ||
      p === 'command palette' ||
      p === 'cmd' ||
      p === 'menu'
    ) {
      intents.push({ action: 'open_command_palette' });
    } else if (/\b(close|hide|band\s*karo)\s+(cmd|command)\s*(menu|palette)?\b/i.test(p)) {
      intents.push({ action: 'close_command_palette' });
    }

    // 2. Open Add Task Modal
    if (
      /\b(open|show|kholo)\s+(add\s*task|new\s*task)\s*(modal|dialog|form)?\b/i.test(p) ||
      p === 'add task modal' ||
      p === 'new task modal' ||
      p === 'task modal'
    ) {
      intents.push({ action: 'open_add_task_modal' });
    }

    // 3. Open Create Project Modal
    if (
      /\b(open|show|kholo)\s+(create\s*project|new\s*project)\s*(modal|dialog|form)?\b/i.test(p) ||
      p === 'create project modal' ||
      p === 'new project modal'
    ) {
      intents.push({ action: 'open_create_project_modal' });
    }

    // 4. ML Experiment Lab
    if (
      /\b(open|show|kholo|chalu\s*karo)\s+(ml\s*lab|ml\s*experiments?|experiment\s*lab|webhooks?)\b/i.test(p) ||
      p === 'ml lab' ||
      p === 'ml experiment' ||
      p === 'ml experiments' ||
      p === 'experiments'
    ) {
      intents.push({ action: 'open_ml_lab' });
    }

    // 5. Zen Focus Chamber
    if (
      /\b(open|show|kholo|chalu\s*karo|start|enter)\s+(zen\s*mode|zen\s*flow|focus\s*chamber|zen\s*chamber|focus\s*mode)\b/i.test(p) ||
      p === 'zen mode' ||
      p === 'focus chamber' ||
      p === 'zen flow' ||
      p === 'focus mode'
    ) {
      intents.push({ action: 'open_focus_chamber' });
    }

    // 6. View Navigation
    const navMatch = p.match(/\b(go\s+to|show|open|kholo|dikhao|navigate\s+to|switch\s+to)\s+(today|week|this\s+week|dashboard|notes|sprint|inbox|upcoming|completed)\b/i);
    if (navMatch) {
      const v = navMatch[2].toLowerCase().replace(/\s+/, '').replace('thisweek', 'week').trim();
      intents.push({ action: 'navigate_view', view: v });
    } else if (/\b(show|open|view|dikhao)?\s*(my\s+)?(progress|consistency|analytics|streak|dashboard)\b/i.test(p)) {
      intents.push({ action: 'navigate_view', view: 'dashboard' });
    } else if (/\b(open|show|kholo|dikhao|go\s+to|switch\s+to)\s+(my\s+)?notes(\s+app|\s+workspace)?\b/i.test(p) || p === 'notes' || p === 'notes app') {
      intents.push({ action: 'open_notes' });
    } else if (/\b(open|show|kholo|dikhao|go\s+to|switch\s+to)\s+(sprint|sprint\s*board|burndown)\b/i.test(p) || p === 'sprint' || p === 'sprint board') {
      intents.push({ action: 'open_sprint' });
    }

    // 7. Priority Filter
    const priMatch = p.match(/\bfilter\s+(by\s+)?(p1|p2|p3|p4)\b/i);
    if (priMatch) {
      intents.push({ action: 'filter_priority', priority: priMatch[2].toUpperCase() });
    }

    return intents;
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

    // Instant local UI response
    const localIntents = parseLocalUiIntents(prompt);
    for (const intent of localIntents) {
      executeUiAction(intent);
    }

    try {
      const response = await AgentAPI.sendCommand(prompt);

      // Support reply (FastAPI schema) and response fallback
      const replyText =
        response.reply ||
        response.response ||
        response.message ||
        'Command executed successfully.';

      // Support executed_actions (FastAPI schema) and actions_taken fallback
      const actions = response.executed_actions || response.actions_taken || [];

      // Execute all AI-instructed UI actions
      for (const act of actions) {
        if (act.tool === 'ui_control') {
          const args = act.arguments || act.parameters || {};
          executeUiAction({
            action: args.action,
            ...args,
            ...(act.result || {}),
          });
        }
      }

      const agentMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: replyText,
        actions: actions,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Refresh tasks, projects, notes, and logs so the UI is immediately in sync
      await Promise.all([
        fetchTasks(),
        fetchProjects(),
        fetchLogs(),
        fetchNotes ? fetchNotes() : Promise.resolve(),
      ]);

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
        executeUiAction,
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
