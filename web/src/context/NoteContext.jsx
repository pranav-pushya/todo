import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NoteAPI, TaskAPI } from '../services/api';
import { useTasks } from './TaskContext';

const NoteContext = createContext(null);

const DEFAULT_DEMO_NOTES = [
  {
    id: 1,
    title: 'Sprint Backlog & Goals',
    content: `# Sprint Goals\n- [ ] Complete Phase 4 Mobile app verification\n- [ ] Stabilize local-first browser persistence\n- [ ] Connect AI Copilot audit feed\n\nEnsure offline changes sync cleanly!`,
    format: 'markdown',
    color: '#1d4ed8',
    pinned: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Architecture & Host Notes',
    content: `FastAPI deployed on Render Cloud (Production):\nHost: https://kortex-xnin.onrender.com/api/v1\nDatabase: Local-first with cloud mirroring.`,
    format: 'text',
    color: '#10b981',
    pinned: false,
    created_at: new Date().toISOString(),
  },
];

const getStoredNotes = () => {
  try {
    const raw = localStorage.getItem('todo_local_notes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local notes:', e);
  }
  return DEFAULT_DEMO_NOTES;
};

const saveStoredNotes = (notesList) => {
  try {
    localStorage.setItem('todo_local_notes', JSON.stringify(notesList));
  } catch (e) {
    console.warn('Error saving local notes:', e);
  }
};

export function NoteProvider({ children }) {
  const { fetchTasks } = useTasks();
  const [notes, setNotes] = useState(getStoredNotes);
  const [activeNoteId, setActiveNoteId] = useState(() => {
    const initial = getStoredNotes();
    return initial.length > 0 ? initial[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('todo_auth_token');

    // 1. If not logged in, read from local browser storage
    if (!token) {
      const local = getStoredNotes();
      let filtered = local;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
        );
      }
      setNotes(filtered);
      setActiveNoteId((curr) => {
        if (!curr && filtered.length > 0) return filtered[0].id;
        if (curr && filtered.some((n) => n.id === curr)) return curr;
        return filtered.length > 0 ? filtered[0].id : null;
      });
      setLoading(false);
      return;
    }

    // 2. If logged in, fetch from backend API with local cache fallback
    try {
      const data = await NoteAPI.getNotes({ search: searchQuery.trim() || undefined });
      const safeNotes = Array.isArray(data)
        ? data.map((n) => ({ ...n, format: n.format || 'markdown' }))
        : [];

      if (safeNotes.length > 0) {
        setNotes(safeNotes);
        saveStoredNotes(safeNotes);
      } else {
        const cached = getStoredNotes();
        if (cached.length > 0 && !searchQuery.trim()) {
          setNotes(cached);
        } else {
          setNotes(safeNotes);
        }
      }

      setActiveNoteId((curr) => {
        if (!curr && safeNotes.length > 0) return safeNotes[0].id;
        if (curr && safeNotes.some((n) => n.id === curr)) return curr;
        return safeNotes.length > 0 ? safeNotes[0].id : null;
      });
    } catch (err) {
      console.warn('Backend getNotes failed, serving local storage notes:', err.message);
      const cached = getStoredNotes();
      setNotes(cached);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (initialData = {}) => {
    const payload = {
      title: initialData.title || 'Untitled Note',
      content: initialData.content || '',
      format: initialData.format || 'markdown',
      color: initialData.color || '#1d4ed8',
      pinned: Boolean(initialData.pinned),
      tags: initialData.tags || '',
    };

    const token = localStorage.getItem('todo_auth_token');

    // Guest / offline mode
    if (!token) {
      const newNote = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      const updated = [newNote, ...getStoredNotes()];
      saveStoredNotes(updated);
      setNotes((prev) => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      return newNote;
    }

    // Logged in mode
    try {
      const created = await NoteAPI.createNote(payload);
      const normalizedCreated = { ...created, format: created.format || payload.format };
      setNotes((prev) => [normalizedCreated, ...prev]);
      saveStoredNotes([normalizedCreated, ...getStoredNotes()]);
      setActiveNoteId(normalizedCreated.id);
      return normalizedCreated;
    } catch (err) {
      // Local fallback
      const fallback = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      setNotes((prev) => [fallback, ...prev]);
      saveStoredNotes([fallback, ...getStoredNotes()]);
      setActiveNoteId(fallback.id);
      return fallback;
    }
  };

  const editNote = async (noteId, updates) => {
    // Optimistic local update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );

    const currentLocal = getStoredNotes();
    saveStoredNotes(
      currentLocal.map((n) => (n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return updates;

    try {
      const updated = await NoteAPI.updateNote(noteId, updates);
      return updated;
    } catch (err) {
      console.warn('API updateNote failed, preserved in local storage:', err.message);
      return updates;
    }
  };

  const togglePin = async (noteId) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n));
      return next.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    });

    const currentLocal = getStoredNotes();
    saveStoredNotes(
      currentLocal.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return;

    try {
      await NoteAPI.togglePin(noteId);
    } catch (err) {
      console.warn('API togglePin failed, preserved in local storage:', err.message);
    }
  };

  const removeNote = async (noteId) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== noteId);
      if (activeNoteId === noteId) {
        setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });

    const currentLocal = getStoredNotes();
    saveStoredNotes(currentLocal.filter((n) => n.id !== noteId));

    const token = localStorage.getItem('todo_auth_token');
    if (!token) return;

    try {
      await NoteAPI.deleteNote(noteId);
    } catch (err) {
      console.warn('API deleteNote failed, preserved in local storage:', err.message);
    }
  };

  const convertToTask = async (note) => {
    try {
      const taskData = {
        title: note.title || 'Action from Note',
        description: note.content || null,
        priority: 'P3',
        tags: typeof note.tags === 'string' ? note.tags : Array.isArray(note.tags) ? note.tags.join(', ') : '',
      };
      const created = await TaskAPI.createTask(taskData);
      fetchTasks();
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const openTaskScratchpad = async (taskId) => {
    try {
      const scratchpad = await NoteAPI.getTaskScratchpad(taskId);
      setNotes((prev) => {
        const exists = prev.find((n) => n.id === scratchpad.id);
        if (exists) {
          return prev.map((n) => (n.id === scratchpad.id ? scratchpad : n));
        }
        return [scratchpad, ...prev];
      });
      setActiveNoteId(scratchpad.id);
      return scratchpad;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const syncChecklists = async (noteId) => {
    try {
      const res = await NoteAPI.syncChecklists(noteId);
      if (res?.created_tasks_count > 0) {
        fetchTasks();
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <NoteContext.Provider
      value={{
        notes,
        activeNoteId,
        setActiveNoteId,
        activeNote,
        searchQuery,
        setSearchQuery,
        loading,
        error,
        fetchNotes,
        addNote,
        editNote,
        togglePin,
        removeNote,
        convertToTask,
        openTaskScratchpad,
        syncChecklists,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}

export default NoteContext;
