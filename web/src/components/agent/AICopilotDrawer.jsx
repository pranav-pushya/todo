import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wrench,
  History,
  MessageSquare,
  Bot,
  User,
  CheckCircle2,
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
    logs,
    fetchLogs,
  } = useAgent();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'logs'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

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

      {/* Tabs */}
      <div className="flex items-center border-b border-white/[0.08] bg-obsidian-900/30 px-5 pt-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-cobalt-500 text-cobalt-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('logs');
            fetchLogs();
          }}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-cobalt-500 text-cobalt-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
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
                          <div className="text-slate-400 truncate">
                            {JSON.stringify(act.parameters)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isExecuting && (
              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-cobalt-950 border border-cobalt-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-cobalt-400">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-obsidian-850 border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cobalt-400 animate-ping"></span>
                  <span>AI Agent is analyzing and executing tools...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-white/[0.06] bg-obsidian-900/40">
            <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1.5 tracking-wider">
              Quick Prompts
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  disabled={isExecuting}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  {s}
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
      ) : (
        /* Audit Logs Area */
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No recent agent action logs found.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-obsidian-850/80 border border-white/[0.06] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-cobalt-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {log.action_type}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono bg-black/40 p-2 rounded border border-white/[0.04] overflow-x-auto">
                  {typeof log.parameters === 'object'
                    ? JSON.stringify(log.parameters)
                    : String(log.parameters)}
                </p>
                {log.result_summary && (
                  <p className="text-[11px] text-slate-400 italic">
                    {log.result_summary}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
