import React, { useState, useRef, useEffect } from 'react';
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
  Eye,
  Edit3,
  Columns,
  Code2,
  Sigma,
  Download,
  FileType,
  FileCode,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import MarkdownNotePreview from './MarkdownNotePreview';


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
  const [editorMode, setEditorMode] = useState('split'); // 'edit' | 'split' | 'preview'
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const downloadMenuRef = useRef(null);
  const newMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPlainText = (activeNote?.format || 'markdown') === 'text';

  const handleInsertLatex = () => {
    if (!activeNote) return;
    const latexSnippet = `\n\n### Mathematical Formulation\n$$\n\\mathcal{L}_{\\text{BCE}} = -\\frac{1}{N} \\sum_{i=1}^N \\left[ y_i \\log(\\hat{y}_i) + (1 - y_i)\\log(1 - \\hat{y}_i) \\right]\n$$\n\nInline gradient: $\\nabla_\\theta J(\\theta) = \\frac{1}{m} X^T (h_\\theta(X) - y)$\n`;
    editNote(activeNote.id, { content: (activeNote.content || '') + latexSnippet });
    toast.success('LaTeX Math template inserted! 📐');
  };

  const handleInsertCode = () => {
    if (!activeNote) return;
    const codeSnippet = `\n\n\`\`\`python\nimport torch\nimport torch.nn as nn\n\nclass ResidualBlock(nn.Module):\n    def __init__(self, in_features):\n        super().__init__()\n        self.block = nn.Sequential(\n            nn.Conv2d(in_features, in_features, 3, padding=1),\n            nn.BatchNorm2d(in_features),\n            nn.ReLU(inplace=True)\n        )\n\n    def forward(self, x):\n        return x + self.block(x)\n\`\`\`\n`;
    editNote(activeNote.id, { content: (activeNote.content || '') + codeSnippet });
    toast.success('Python code block template inserted! 💻');
  };

  const handleCreateNewNote = async (format = 'markdown') => {
    try {
      await addNote({
        title: 'Untitled Note',
        content: '',
        format: format,
        color: format === 'text' ? '#059669' : '#1d4ed8',
        pinned: false,
      });
      toast.success(`New ${format === 'text' ? 'Plain Text (.txt)' : 'Markdown (.md)'} note created`);
    } catch (err) {
      toast.error(err.message || 'Failed to create note');
    }
  };

  const handleToggleFormat = async (newFormat) => {
    if (!activeNote) return;
    const currentFormat = activeNote.format || 'markdown';
    if (currentFormat === newFormat) return;

    try {
      await editNote(activeNote.id, { format: newFormat });
      toast.success(`Format changed to ${newFormat === 'text' ? 'Plain Text (.txt)' : 'Markdown (.md)'}`);
    } catch (err) {
      toast.error('Failed to change note format');
    }
  };

  const handleDownloadFile = (forcedExtension = null) => {
    if (!activeNote) return;
    const currentFormat = activeNote.format || 'markdown';
    const ext = forcedExtension || (currentFormat === 'text' ? 'txt' : 'md');
    const mimeType = ext === 'txt' ? 'text/plain;charset=utf-8' : 'text/markdown;charset=utf-8';
    
    // Clean file name
    const rawTitle = (activeNote.title || 'Untitled_Note').trim();
    const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'Untitled_Note';
    const filename = `${cleanTitle}.${ext}`;

    const content = activeNote.content || '';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${filename} 📥`);
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

          {/* New Note Button with Format Picker */}
          <div className="relative" ref={newMenuRef}>
            <div className="inline-flex rounded-lg bg-cobalt-700 hover:bg-cobalt-600 shadow-glow-cobalt overflow-hidden transition-all">
              <button
                onClick={() => handleCreateNewNote('markdown')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold hover:bg-white/[0.08] transition-colors"
                title="Create a new Markdown note"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Note</span>
              </button>
              <button
                onClick={() => setShowNewMenu((v) => !v)}
                className="px-1.5 py-1.5 text-white/80 hover:text-white hover:bg-white/10 border-l border-white/20 transition-colors"
                title="Choose note type (Markdown or Plain Text)"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showNewMenu && (
              <div
                className="absolute top-full right-0 mt-1.5 w-48 bg-obsidian-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn"
              >
                <button
                  onClick={() => {
                    handleCreateNewNote('markdown');
                    setShowNewMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-white/[0.06] text-left transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-cobalt-400" />
                  <span>Markdown Note <strong>(.md)</strong></span>
                </button>
                <button
                  onClick={() => {
                    handleCreateNewNote('text');
                    setShowNewMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-white/[0.06] text-left transition-colors"
                >
                  <FileType className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Plain Text Note <strong>(.txt)</strong></span>
                </button>
              </div>
            )}
          </div>
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
                  onClick={() => handleCreateNewNote('markdown')}
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
                      <div className="flex items-center gap-1.5">
                        <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider ${
                            note.format === 'text'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cobalt-500/15 text-cobalt-400 border border-cobalt-500/30'
                          }`}
                        >
                          {note.format === 'text' ? 'TXT' : 'MD'}
                        </span>
                      </div>
                      {note.tags && (
                        <span className="truncate max-w-[100px] text-cobalt-400">
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
                {/* Left Toolbar: Color Picker & Format Selector */}
                <div className="flex items-center gap-3">
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

                  <div className="h-4 w-px bg-white/[0.08]" />

                  {/* Format Segmented Toggle: Markdown vs Plain Text */}
                  <div className="flex items-center bg-obsidian-950 p-0.5 rounded-lg border border-white/[0.08] text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleFormat('markdown')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                        !isPlainText
                          ? 'bg-cobalt-700 text-white font-semibold shadow-glow-cobalt'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Format as Markdown (.md) with KaTeX math & syntax-highlighted code"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cobalt-300" />
                      <span>Markdown (.md)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFormat('text')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                        isPlainText
                          ? 'bg-emerald-600 text-white font-semibold shadow-glow-emerald'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Format as Plain Text (.txt) with clean unformatted notes"
                    >
                      <FileType className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Plain Text (.txt)</span>
                    </button>
                  </div>
                </div>

                {/* Right Toolbar Actions */}
                <div className="flex items-center gap-2">
                  {/* Mode Switcher: Edit, Split, Preview */}
                  <div className="flex items-center bg-obsidian-950 p-0.5 rounded-lg border border-white/[0.06] text-xs mr-1">
                    <button
                      onClick={() => setEditorMode('edit')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        editorMode === 'edit'
                          ? 'bg-cobalt-700 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setEditorMode('split')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        editorMode === 'split'
                          ? 'bg-cobalt-700 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Side-by-side edit and live preview"
                    >
                      <Columns className="w-3 h-3" />
                      <span>Split</span>
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        editorMode === 'preview'
                          ? 'bg-cobalt-700 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Full preview"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>

                  {/* Download / Export Button with Dropdown */}
                  <div className="relative" ref={downloadMenuRef}>
                    <div className="inline-flex rounded-lg bg-obsidian-950 border border-white/[0.08] overflow-hidden">
                      <button
                        onClick={() => handleDownloadFile()}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs font-medium transition-colors"
                        title={`Download note as ${isPlainText ? '.txt' : '.md'}`}
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Download {isPlainText ? '.txt' : '.md'}</span>
                      </button>
                      <button
                        onClick={() => setShowDownloadMenu((v) => !v)}
                        className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-white/[0.06] border-l border-white/[0.08] transition-colors"
                        title="Choose export format"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {showDownloadMenu && (
                      <div
                        className="absolute top-full right-0 mt-1.5 w-44 bg-obsidian-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-xl animate-fadeIn"
                      >
                        <button
                          onClick={() => {
                            handleDownloadFile('md');
                            setShowDownloadMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white text-left transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cobalt-400" />
                          <span>Export as <strong>.md</strong></span>
                        </button>
                        <button
                          onClick={() => {
                            handleDownloadFile('txt');
                            setShowDownloadMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white text-left transition-colors"
                        >
                          <FileType className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Export as <strong>.txt</strong></span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Markdown Snippet Buttons (Hidden in Plain Text mode) */}
                  {!isPlainText && (
                    <>
                      {/* Insert LaTeX Template */}
                      <button
                        onClick={handleInsertLatex}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium transition-colors"
                        title="Insert sample LaTeX equation"
                      >
                        <Sigma className="w-3.5 h-3.5 text-indigo-400" />
                        <span>+ LaTeX</span>
                      </button>

                      {/* Insert Code Template */}
                      <button
                        onClick={handleInsertCode}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-colors"
                        title="Insert sample syntax-highlighted code block"
                      >
                        <Code2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>+ Code</span>
                      </button>
                    </>
                  )}

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

              {/* Note Content Editor Canvas */}
              <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full flex flex-col space-y-4">
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
                    placeholder="Add tags separated by comma (e.g. math, deeplearning, pytorch)..."
                    className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Content Area Based on Editor Mode */}
                {editorMode === 'edit' && (
                  <textarea
                    value={activeNote.content || ''}
                    onChange={(e) => editNote(activeNote.id, { content: e.target.value })}
                    placeholder={
                      isPlainText
                        ? 'Start typing plain text notes...'
                        : 'Start typing markdown, LaTeX formulas ($E=mc^2$), and ```python code blocks...'
                    }
                    className={`flex-1 w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed min-h-[400px] ${
                      isPlainText ? 'font-sans' : 'font-mono'
                    }`}
                  />
                )}

                {editorMode === 'preview' && (
                  <div className="flex-1 overflow-y-auto bg-obsidian-950/40 p-6 rounded-2xl border border-white/[0.04]">
                    {isPlainText ? (
                      <div className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap select-text leading-relaxed">
                        {activeNote.content ? (
                          activeNote.content
                        ) : (
                          <span className="italic text-slate-600">Empty plain text document...</span>
                        )}
                      </div>
                    ) : (
                      <MarkdownNotePreview
                        content={activeNote.content || ''}
                        onContentChange={(c) => editNote(activeNote.id, { content: c })}
                      />
                    )}
                  </div>
                )}

                {editorMode === 'split' && (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[450px]">
                    {/* Left: Raw Editor */}
                    <div className="flex flex-col h-full">
                      <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-cobalt-400" />
                        <span>{isPlainText ? 'Plain Text Editor' : 'Markdown & LaTeX Input'}</span>
                      </div>
                      <textarea
                        value={activeNote.content || ''}
                        onChange={(e) => editNote(activeNote.id, { content: e.target.value })}
                        placeholder={
                          isPlainText
                            ? 'Start typing unformatted text here...'
                            : 'Write markdown, $inline math$, $$display math$$, or code blocks here...'
                        }
                        className={`flex-1 w-full bg-obsidian-950/60 p-4 rounded-xl border border-white/[0.06] text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cobalt-500/50 resize-none leading-relaxed ${
                          isPlainText ? 'font-sans' : 'font-mono'
                        }`}
                      />
                    </div>

                    {/* Right: Live Render with KaTeX & Code Syntax or Plain Text Preview */}
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="text-[10px] uppercase font-mono text-emerald-400 mb-1.5 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>{isPlainText ? 'Plain Text Preview' : 'Live KaTeX & Code Preview'}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto bg-obsidian-950/40 p-4 rounded-xl border border-white/[0.06]">
                        {isPlainText ? (
                          <div className="font-mono text-xs text-slate-200 whitespace-pre-wrap select-text leading-relaxed">
                            {activeNote.content ? (
                              activeNote.content
                            ) : (
                              <span className="italic text-slate-600">Empty plain text document...</span>
                            )}
                          </div>
                        ) : (
                          <MarkdownNotePreview
                            content={activeNote.content || ''}
                            onContentChange={(c) => editNote(activeNote.id, { content: c })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Footer / Word Count */}
              <div className="h-9 border-t border-white/[0.06] px-6 flex items-center justify-between text-[11px] text-slate-500 bg-obsidian-950 flex-shrink-0">
                <span>{wordCount} words • {activeNote.content?.length || 0} characters</span>
                <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isPlainText ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-cobalt-400 shadow-glow-cobalt'
                    }`}
                  />
                  <span>
                    {isPlainText ? 'Plain Text Document (.txt)' : 'Markdown & LaTeX Notes (.md)'}
                  </span>
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
                onClick={() => handleCreateNewNote('markdown')}
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
