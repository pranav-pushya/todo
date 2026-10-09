import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Search,
  ArrowLeft,
  CheckSquare,
  Sparkles,
  Tag,
  Palette,
  Check,
} from 'lucide-react';
import { useNotes } from '../../context/NoteContext';

const NOTE_COLORS = [
  { label: 'Cobalt', hex: '#1d4ed8', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { label: 'Emerald', hex: '#059669', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  { label: 'Amber', hex: '#d97706', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  { label: 'Rose', hex: '#e11d48', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
  { label: 'Purple', hex: '#7c3aed', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  { label: 'Cyan', hex: '#0891b2', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10' },
];

export default function NotesApp({ onBackToTasks }) {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    activeNote,
    searchQuery,
    setSearchQuery,
    addNote,
    editNote,
    togglePin,
    removeNote,
    convertToTask,
  } = useNotes();

  const [convertedToast, setConvertedToast] = useState(false);

  const handleCreateNewNote = async () => {
    await addNote({
      title: 'Untitled Note',
      content: '',
      color: '#1d4ed8',
      pinned: false,
    });
  };

  const handleConvertToTask = async () => {
    if (!activeNote) return;
    try {
      await convertToTask(activeNote);
      setConvertedToast(true);
      setTimeout(() => setConvertedToast(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to convert note to task');
    }
  };

  const wordCount = activeNote?.content
    ? activeNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-900 text-white overflow-hidden select-none animate-fadeIn">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all group"
            title="Return to To-Do Tasks"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cobalt-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>To-Do Tasks</span>
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-1" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cobalt-800/40 border border-cobalt-600/40 flex items-center justify-center text-cobalt-300 shadow-glow-subtle">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-white">Notes Workspace</h1>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            <span>⚡ Tip: Double-click logo anytime to jump here</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notes Search */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or tags..."
              className="w-full bg-obsidian-850 hover:bg-obsidian-800 focus:bg-obsidian-800 text-xs text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 border border-white/[0.06] focus:border-cobalt-500 focus:outline-none transition-all"
            />
          </div>

          {/* New Note Button */}
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold shadow-glow-cobalt transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Note</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left List & Right Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Notes List Sidebar */}
        <div className="w-72 sm:w-80 border-r border-white/[0.08] bg-obsidian-950 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{notes.length} {notes.length === 1 ? 'Note' : 'Notes'}</span>
            <span className="text-[11px] text-slate-500">Auto-saved</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {notes.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium mb-1">No notes found</p>
                <p className="text-[11px] text-slate-600 mb-4">Capture your ideas, brainstorms, or meeting notes.</p>
                <button
                  onClick={handleCreateNewNote}
                  className="text-xs text-cobalt-400 hover:text-cobalt-300 font-medium"
                >
                  + Create your first note
                </button>
              </div>
            ) : (
              notes.map((note) => {
                const isSelected = activeNoteId === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`group relative p-3 rounded-xl cursor-pointer border transition-all text-left ${
                      isSelected
                        ? 'bg-cobalt-950/60 border-cobalt-600/60 shadow-glow-subtle text-white'
                        : 'bg-obsidian-900 hover:bg-obsidian-850 border-white/[0.06] text-slate-300'
                    }`}
                  >
                    {/* Left Accent Color Indicator */}
                    <div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                      style={{ backgroundColor: note.color || '#1d4ed8' }}
                    />

                    <div className="flex items-start justify-between gap-2 pl-1 mb-1">
                      <h4 className="text-xs font-semibold truncate flex-1">
                        {note.title || 'Untitled Note'}
                      </h4>
                      {note.pinned && (
                        <Pin className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 pl-1 mb-2 leading-relaxed">
                      {note.content ? note.content : <span className="italic text-slate-600">Empty note...</span>}
                    </p>

                    <div className="flex items-center justify-between pl-1 text-[10px] text-slate-500">
                      <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                      {note.tags && (
                        <span className="truncate max-w-[120px] text-cobalt-400">
                          #{note.tags.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Note Editor Canvas */}
        <div className="flex-1 flex flex-col bg-obsidian-900 overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Note Editor Action Toolbar */}
              <div className="h-12 border-b border-white/[0.08] px-6 flex items-center justify-between flex-shrink-0 bg-obsidian-900/60">
                {/* Color Swatch Picker */}
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => editNote(activeNote.id, { color: c.hex })}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        activeNote.color === c.hex ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Pin Toggle */}
                  <button
                    onClick={() => togglePin(activeNote.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      activeNote.pinned
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                    title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin className={`w-3 h-3 ${activeNote.pinned ? 'fill-amber-400' : ''}`} />
                    <span>{activeNote.pinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {/* Convert to Task */}
                  <button
                    onClick={handleConvertToTask}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cobalt-900 hover:bg-cobalt-800 text-cobalt-200 border border-cobalt-700/60 text-xs font-medium transition-all"
                    title="Create a To-Do Task from this note"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-cobalt-400" />
                    <span>Convert to Task</span>
                  </button>

                  {/* Delete Note */}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this note?')) {
                        removeNote(activeNote.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Converted to Task Alert Banner */}
              {convertedToast && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 px-6 py-2 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  <span>Note successfully converted into a To-Do Task in your Inbox!</span>
                </div>
              )}

              {/* Note Content Editor */}
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full flex flex-col space-y-4">
                {/* Title */}
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => editNote(activeNote.id, { title: e.target.value })}
                  placeholder="Note Title"
                  className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 focus:outline-none tracking-tight"
                />

                {/* Tags row */}
                <div className="flex items-center gap-2 text-xs text-slate-400 border-b border-white/[0.06] pb-3">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={activeNote.tags || ''}
                    onChange={(e) => editNote(activeNote.id, { tags: e.target.value })}
                    placeholder="Add tags separated by comma (e.g. ideas, work, meeting)..."
                    className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Content Textarea */}
                <textarea
                  value={activeNote.content || ''}
                  onChange={(e) => editNote(activeNote.id, { content: e.target.value })}
                  placeholder="Start typing your note here... Use it for meeting notes, ideas, code snippets, or draft outlines."
                  className="flex-1 w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed min-h-[350px] font-sans"
                />
              </div>

              {/* Editor Footer / Word Count */}
              <div className="h-9 border-t border-white/[0.06] px-6 flex items-center justify-between text-[11px] text-slate-500 bg-obsidian-950 flex-shrink-0">
                <span>{wordCount} words • {activeNote.content?.length || 0} characters</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Sparkles className="w-3 h-3 text-cobalt-400" />
                  <span>Markdown-ready Notes</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 stroke-[1.5] text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">No note selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Select a note from the left sidebar or create a new one to start writing.
              </p>
              <button
                onClick={handleCreateNewNote}
                className="px-3.5 py-1.5 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold shadow-glow-cobalt transition-all"
              >
                + New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
