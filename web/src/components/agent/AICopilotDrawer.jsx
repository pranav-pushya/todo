import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wrench,
  Bot,
  User,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

const SUGGESTIONS = [
  "Add high priority task 'Review security patch' due tomorrow",
  "Reschedule overdue tasks to Friday",
  "Create project 'Mobile Redesign' with color #3b82f6",
  "Mark task 'Setup database' as completed",
];

export default function AICopilotDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    messages,
    sendCommand,
    isExecuting,
  } = useAgent();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isDrawerOpen) return null;

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isExecuting) return;
    setInput('');
    try {
      await sendCommand(prompt);
    } catch (err) {
      // Error handled inside context
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-obsidian-950 border-l border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-16 px-5 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cobalt-800/80 border border-cobalt-600/50 flex items-center justify-center shadow-glow-cobalt">
            <Sparkles className="w-4 h-4 text-cobalt-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              AI Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h3>
            <span className="text-[10px] text-slate-400">Groq Llama 3.3 Engine</span>
          </div>
        </div>

        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-cobalt-950 border border-cobalt-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-cobalt-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-cobalt-700 text-white rounded-tr-sm'
                    : 'bg-obsidian-850 border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Actions Taken Callout */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/[0.08] space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-cobalt-300 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>Actions Executed ({msg.actions.length})</span>
                    </div>
                    {msg.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-2 font-mono text-[10px] text-slate-300 border border-white/[0.04]"
                      >
                        <div className="text-emerald-400 font-semibold mb-0.5">
                          ✔ {act.tool}
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
              <div className="bg-obsidian-850 border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 text-slate-400 italic flex items-center gap-2">
                <span>AI is planning and executing tools...</span>
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

        {/* Suggestion Chips */}
        <div className="p-3 border-t border-white/[0.04] bg-obsidian-950/40">
          <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Quick Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                disabled={isExecuting}
                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-obsidian-850 hover:bg-cobalt-950/60 border border-white/[0.06] hover:border-cobalt-600/40 text-slate-300 hover:text-cobalt-200 transition-all disabled:opacity-40"
              >
                {sug}
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
          className="p-4 border-t border-white/[0.08] bg-obsidian-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI (e.g. create task, change priority)..."
            disabled={isExecuting}
            className="flex-1 bg-obsidian-800 text-xs text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 border border-white/[0.08] focus:border-cobalt-500 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isExecuting}
            className="p-2.5 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 disabled:opacity-40 text-white shadow-glow-cobalt transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
