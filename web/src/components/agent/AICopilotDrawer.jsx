import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wrench,
  Bot,
  User,
  Copy,
  Check,
  FileCode,
  Plus,
  BookOpen,
  Cpu,
  FlaskConical,
  Flame,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useNotes } from '../../context/NoteContext';
import { useTasks } from '../../context/TaskContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

const ML_SUGGESTIONS = [
  { label: '🧪 Debug CUDA OOM & Memory', prompt: 'How do I debug and fix a PyTorch CUDA out of memory error during backward pass?' },
  { label: '⚡ PyTorch Training Loop + Webhook', prompt: 'Write a clean PyTorch training loop that sends metric webhooks to our app on epoch complete.' },
  { label: '🏃‍♂️ Deconstruct Sprint: Fine-tune LoRA', prompt: 'Deconstruct a sprint for fine-tuning a Llama-3 model using Unsloth/PEFT into actionable subtasks.' },
  { label: '📐 Cross-Entropy Loss Formula', prompt: 'Derive the Softmax Cross-Entropy loss mathematical formula with LaTeX and explain numerical stability.' },
  { label: '🧭 Open ML Experiment Lab', prompt: 'Open the ML Experiment Lab to review webhook curl endpoints.' },
  { label: '🔥 Switch to Sprint Mode', prompt: 'Switch to sprint mode and show my burndown chart.' },
];

export default function AICopilotDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    messages,
    sendCommand,
    isExecuting,
  } = useAgent();

  const { addNote, fetchNotes } = useNotes();
  const { addTask } = useTasks();
  const { toast } = useUIFeedback();

  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  if (!isDrawerOpen) return null;

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isExecuting) return;
    setInput('');
    try {
      await sendCommand(prompt);
    } catch (err) {
      // Handled inside context
    }
  };

  const handleCopyCode = async (code, blockId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(blockId);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleSaveToNotes = async (code, language = 'python') => {
    try {
      const title = `AI Code Snippet: ${language.toUpperCase()} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      await addNote({
        title,
        content: `\`\`\`${language}\n${code.trim()}\n\`\`\``,
        tags: `ai, ${language}, code`,
      });
      await fetchNotes();
      toast.success(`Saved snippet to Notes Workspace! 📝`);
    } catch (err) {
      toast.error('Failed to save to notes');
    }
  };

  const handleCreateTaskFromCode = async (codeSnippet) => {
    try {
      const firstLine = codeSnippet.split('\n')[0].replace(/^[#//\s]+/, '').trim() || 'Implement AI code snippet';
      await addTask({
        title: `Implement: ${firstLine.slice(0, 60)}`,
        priority: 'P2',
      });
      toast.success('Created task from snippet! ⚡');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-obsidian-950 border-l border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 px-5 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-900/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cobalt-800/80 border border-cobalt-600/50 flex items-center justify-center shadow-glow-cobalt">
            <Cpu className="w-4 h-4 text-cobalt-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AI ML & Code Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-cobalt-300 font-mono">Groq Llama 3.3 LPU</span>
              <span className="text-[9px] text-slate-500 font-mono">• Pair Programmer</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, msgIdx) => (
            <div
              key={msg.id || msgIdx}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-cobalt-950 border border-cobalt-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-cobalt-400 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-cobalt-700 text-white rounded-tr-sm shadow-md'
                    : 'bg-obsidian-900 border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                {/* Render Text and Formatted Code Blocks */}
                <MessageContent
                  text={msg.text}
                  msgId={msg.id || msgIdx}
                  copiedIndex={copiedIndex}
                  onCopy={handleCopyCode}
                  onSaveToNotes={handleSaveToNotes}
                  onCreateTask={handleCreateTaskFromCode}
                />

                {/* Actions Executed Callout */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cobalt-300 flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-cobalt-400" />
                      <span>Actions Executed ({msg.actions.length})</span>
                    </div>
                    {msg.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-black/50 rounded-xl p-2.5 font-mono text-[10px] text-slate-300 border border-white/[0.04] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {act.tool}
                          </span>
                          {act.tool === 'ui_control' && act.ui_action && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cobalt-950 text-cobalt-300 border border-cobalt-700/50">
                              {act.ui_action}
                            </span>
                          )}
                        </div>

                        {act.result && (
                          <div className="text-slate-400 text-[9px] truncate">
                            {typeof act.result === 'object'
                              ? JSON.stringify(act.result)
                              : String(act.result)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isExecuting && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-cobalt-950 border border-cobalt-800 flex items-center justify-center text-cobalt-400">
                <Sparkles className="w-4 h-4 animate-spin text-cobalt-300" />
              </div>
              <div className="bg-obsidian-900 border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 text-slate-400 italic flex items-center gap-2 shadow-sm">
                <span>AI is analyzing ML context & executing tools...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick ML & Developer Suggestion Chips */}
        <div className="p-3 border-t border-white/[0.06] bg-obsidian-950/60">
          <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cobalt-400" />
            <span>Developer & ML Prompts</span>
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {ML_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug.prompt)}
                disabled={isExecuting}
                className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-obsidian-900 hover:bg-cobalt-950/70 border border-white/[0.06] hover:border-cobalt-600/50 text-slate-300 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 border-t border-white/[0.08] bg-obsidian-900/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ML Copilot (e.g. PyTorch loss, debug error, start sprint)..."
            disabled={isExecuting}
            className="flex-1 bg-obsidian-950 text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isExecuting}
            className="p-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 disabled:opacity-40 text-white shadow-glow-cobalt transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Message Parser for Markdown and Code Blocks
function MessageContent({ text, msgId, copiedIndex, onCopy, onSaveToNotes, onCreateTask }) {
  if (!text) return null;

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const language = match[1] || 'code';
    const code = match[2];
    const blockKey = `${msgId}-block-${blockCounter++}`;

    parts.push({
      type: 'code',
      language,
      code,
      key: blockKey,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return (
            <p key={idx} className="whitespace-pre-wrap leading-relaxed text-xs">
              {part.content}
            </p>
          );
        }

        // Render Code Block Container with Quick Actions
        const isCopied = copiedIndex === part.key;

        return (
          <div
            key={part.key}
            className="my-2 rounded-xl bg-obsidian-950 border border-white/[0.1] overflow-hidden shadow-lg select-text font-mono"
          >
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/[0.06] text-[10px]">
              <span className="font-bold text-cobalt-300 uppercase tracking-wider">
                {part.language}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSaveToNotes(part.code, part.language)}
                  title="Save snippet to Notes Workspace"
                  className="px-2 py-0.5 rounded hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  <span>Save Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCreateTask(part.code)}
                  title="Create to-do task from snippet"
                  className="px-2 py-0.5 rounded hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCopy(part.code, part.key)}
                  title="Copy code"
                  className="px-2 py-0.5 rounded hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-3 text-[11px] leading-relaxed overflow-x-auto text-emerald-300/90 font-mono bg-black/40">
              <pre>{part.code.trim()}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
