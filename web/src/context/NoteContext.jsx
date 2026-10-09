import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NoteAPI, TaskAPI } from '../services/api';
import { useTasks } from './TaskContext';

const NoteContext = createContext(null);

export function NoteProvider({ children }) {
  const { fetchTasks } = useTasks();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NoteAPI.getNotes({ search: searchQuery.trim() || undefined });
      setNotes(data);
      if (data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeNoteId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (initialData = {}) => {
    try {
      const payload = {
        title: initialData.title || 'Untitled Note',
        content: initialData.content || '',
        color: initialData.color || '#1d4ed8',
        pinned: Boolean(initialData.pinned),
        tags: initialData.tags || '',
      };
      const created = await NoteAPI.createNote(payload);
      setNotes((prev) => [created, ...prev]);
      setActiveNoteId(created.id);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editNote = async (noteId, updates) => {
    try {
      // Optimistic local update for responsive typing
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
      );
      const updated = await NoteAPI.updateNote(noteId, updates);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const togglePin = async (noteId) => {
    try {
      const updated = await NoteAPI.togglePin(noteId);
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === noteId ? updated : n));
        return next.sort((a, b) => Number(b.pinned) - Number(a.pinned));
      });
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeNote = async (noteId) => {
    try {
      await NoteAPI.deleteNote(noteId);
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== noteId);
        if (activeNoteId === noteId) {
          setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const convertToTask = async (note) => {
    try {
      const taskData = {
        title: note.title || 'Action from Note',
        description: note.content || null,
        priority: 'P3',
        tags: note.tags ? note.tags.split(',').map((t) => t.trim()) : [],
      };
      const created = await TaskAPI.createTask(taskData);
      fetchTasks();
      return created;
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
