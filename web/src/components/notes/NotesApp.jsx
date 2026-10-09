import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Search,
  CheckSquare,
  Sparkles,
  Tag,
  Palette,
  ListChecks,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

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
    syncChecklists,
  } = useNotes();

  const { toast, confirm } = useUIFeedback();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCreateNewNote = async () => {
    await addNote({
      title: 'Untitled Note',
      content: '',
      color: '#1d4ed8',
      pinned: false,
    });
    toast.success('New note created');
  };

  const handleConvertToTask = async () => {
    if (!activeNote) return;
    try {
      await convertToTask(activeNote);
      toast.success('Note converted to To-Do Task in your Inbox! 🚀');
    } catch (err) {
      toast.error(err.message || 'Failed to convert note to task');
    }
  };

  const handleSyncChecklists = async () => {
    if (!activeNote) return;
    setIsSyncing(true);
    try {
      const res = await syncChecklists(activeNote.id);
      if (res.created_tasks_count > 0) {
        toast.success(`⚡ Synced ${res.created_tasks_count} checklist task(s) to your Inbox!`);
      } else {
        toast.info("No un-synced '- [ ] ...' checklist items found in this note. Write '- [ ] Task name' to sync.");
      }
    } catch (err) {
      toast.error(err.message || 'Failed to sync checklists');
    } finally {
      setIsSyncing(false);
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
          <div
            onDoubleClick={onBackToTasks}
            title="Double-click logo to return to To-Do Tasks"
            className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-3 -ml-3 rounded-xl hover:bg-white/[0.04] transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-cobalt-700 flex items-center justify-center shadow-glow-cobalt group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 text-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-cobalt-300 transition-colors">
                Notes Workspace
              </h1>
              <span className="text-[9px] text-slate-500 font-mono hidden group-hover:block transition-all">
                2x click: To-Do
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
            <span>⚡ Tip: Double-click logo to return to To-Do Tasks</span>
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

                  {/* Two-Way Synced Bridge: Sync Checklists to Tasks */}
                  <button
                    onClick={handleSyncChecklists}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-obsidian-850 hover:bg-cobalt-950/80 text-cobalt-300 hover:text-white border border-white/[0.08] hover:border-cobalt-600/50 text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                    title="Scan and sync all '- [ ] ...' checklist items into real To-Do tasks"
                  >
                    <ListChecks className="w-3.5 h-3.5 text-cobalt-400" />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Checklists'}</span>
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
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Delete Note',
                        message: `Are you sure you want to delete "${activeNote.title || 'Untitled Note'}"? This action cannot be undone.`,
                        confirmText: 'Delete Note',
                        danger: true,
                      });
                      if (ok) {
                        removeNote(activeNote.id);
                        toast.success('Note deleted');
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content Editor */}
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full flex flex-col space-y-4">
                {/* Linked Task Scratchpad Banner */}
                {activeNote.task_id && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-cobalt-950/60 border border-cobalt-700/40 text-xs text-cobalt-200 shadow-glow-subtle animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <Link2 className="w-4 h-4 text-cobalt-400 flex-shrink-0" />
                      <div>
                        <span className="text-slate-400">Linked Task: </span>
                        <strong className="text-white font-medium">
                          {activeNote.task_title || `#${activeNote.task_id}`}
                        </strong>
                      </div>
                    </div>
                    <button
                      onClick={onBackToTasks}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white font-medium text-[11px] transition-colors"
                      title="Return to To-Do Tasks list"
                    >
                      <span>View in Tasks</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
