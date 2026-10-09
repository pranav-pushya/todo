import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  Sparkles,
  ListTodo,
  Radio,
  ChevronDown,
  Maximize2,
  Minimize2,
  Coffee,
  Brain,
  Timer as TimerIcon,
  Flame,
  ArrowRight,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

// Native Web Audio Synthesizer for chimes and ambient sound (No external assets required!)
class FocusSoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Dual resonant bell sine waves (harmonic frequencies: 528Hz & 1056Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // Solfeggio 528Hz love/clarity frequency
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1056, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  startAmbient(type = 'brown_noise', volume = 0.15) {
    this.stopAmbient();
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      if (type === 'brown_noise' || type === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown noise integration filter
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain compensation
        }
      } else if (type === 'binaural') {
        for (let i = 0; i < bufferSize; i++) {
          // Gentle 432Hz ambient wave
          output[i] = Math.sin((2 * Math.PI * 432 * i) / this.ctx.sampleRate) * 0.1;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.7;
      } else if (type === 'brown_noise') {
        filter.type = 'lowpass';
        filter.frequency.value = 450;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
      }

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.ambientSource = whiteNoise;
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  }

  setAmbientVolume(vol) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
  }
}

const soundEngine = new FocusSoundEngine();

export default function ZenFocusChamber({ isOpen, onClose, initialTaskId = null }) {
  const { tasks, toggleTask, addTask, toggleSubtask, addSubtask } = useTasks();
  const { toast } = useUIFeedback();

  // Active task selection
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Timer modes: 'pomodoro' (25m), 'deepwork' (50m), 'shortbreak' (5m), 'longbreak' (15m), 'stopwatch'
  const TIMER_PRESETS = {
    pomodoro: { label: 'Pomodoro', duration: 25 * 60, icon: Flame, color: 'cobalt' },
    deepwork: { label: 'Deep Work', duration: 50 * 60, icon: Brain, color: 'indigo' },
    shortbreak: { label: 'Short Break', duration: 5 * 60, icon: Coffee, color: 'emerald' },
    longbreak: { label: 'Long Break', duration: 15 * 60, icon: Coffee, color: 'cyan' },
    stopwatch: { label: 'Stopwatch', duration: 0, icon: TimerIcon, color: 'purple' },
  };

  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientType, setAmbientType] = useState('none'); // 'none' | 'brown_noise' | 'rain' | 'binaural'
  const [volume, setVolume] = useState(0.2);

  // Distraction Jot-pad
  const [distractionInput, setDistractionInput] = useState('');
  const [distractionList, setDistractionList] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Sync initialTaskId when prop changes
  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
    }
  }, [initialTaskId]);

  // Current active task object
  const activeTask = useMemo(() => {
    if (!selectedTaskId) {
      // Pick first uncompleted task if none specified
      return tasks.find((t) => !t.completed) || null;
    }
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Timer tick interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (mode === 'stopwatch') {
            return prev + 1;
          }
          if (prev <= 1) {
            // Timer Finished!
            setIsRunning(false);
            soundEngine.playChime();
            toast.success(`🎉 Focus session finished! Great job maintaining flow.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, toast]);

  // Ambient sound handling
  useEffect(() => {
    if (!isOpen || ambientType === 'none' || !isRunning) {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient(ambientType, volume);
    }
    return () => soundEngine.stopAmbient();
  }, [isOpen, ambientType, isRunning, volume]);

  // Switch preset mode
  const handleSelectMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode].duration);
  };

  const handleToggleTimer = () => {
    soundEngine.init();
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_PRESETS[mode].duration);
  };

  const handleAddFiveMinutes = () => {
    setTimeLeft((prev) => prev + 5 * 60);
    toast.info('+5 minutes added to focus session');
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Radial progress calculations
  const totalDuration = TIMER_PRESETS[mode].duration || 1;
  const progressPercent =
    mode === 'stopwatch'
      ? 100
      : Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  // Brain dump submission
  const handleDumpDistraction = async (e) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;

    const title = distractionInput.trim();
    try {
      await addTask({
        title,
        description: 'Captured in Zen Focus Chamber Brain Dump',
        priority: 'P4',
        tags: 'brain-dump, zen',
      });
      setDistractionList((prev) => [title, ...prev]);
      setDistractionInput('');
      toast.success('Distraction stored in Inbox! Back to focus 🎯');
    } catch (err) {
      toast.error('Failed to capture distraction');
    }
  };

  // Add subtask inline
  const handleAddSubtaskInline = async (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim() || !activeTask) return;
    try {
      await addSubtask(activeTask.id, {
        title: newSubtaskInput.trim(),
        estimated_minutes: 15,
      });
      setNewSubtaskInput('');
      toast.success('Subtask added');
    } catch (err) {
      toast.error('Failed to add subtask');
    }
  };

  // Complete current task
  const handleCompleteActiveTask = async () => {
    if (!activeTask) return;
    try {
      await toggleTask(activeTask.id);
      soundEngine.playChime();
      toast.success(`✨ Task completed! Excellent work.`);
    } catch (err) {
      toast.error('Failed to toggle task');
    }
  };

  // Hotkeys inside Zen Mode: Space = toggle, R = reset, Escape = close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const isInput =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, mode, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/98 backdrop-blur-2xl flex flex-col text-white animate-fade-in select-none overflow-hidden">
      {/* Subtle background ambient pulse glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cobalt-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" />

      {/* Top Bar Navigation */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-white/[0.05] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cobalt-900 border border-cobalt-600/50 flex items-center justify-center shadow-glow-subtle">
            <Sparkles className="w-4 h-4 text-cobalt-300" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-slate-200 flex items-center gap-2">
              <span>Zen Flow Chamber</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cobalt-500/20 text-cobalt-300 border border-cobalt-500/30">
                Focus Mode
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Zero distractions • Pure flow state</p>
          </div>
        </div>

        {/* Preset Modes */}
        <div className="flex items-center bg-obsidian-900 border border-white/[0.08] p-1 rounded-xl gap-1">
          {Object.entries(TIMER_PRESETS).map(([key, item]) => {
            const Icon = item.icon;
            const isSelected = mode === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectMode(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cobalt-700 text-white shadow-glow-subtle font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ambient Noise & Close Controls */}
        <div className="flex items-center gap-3">
          {/* Ambient Sound Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/[0.08] text-xs">
            {ambientType === 'none' ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cobalt-400 animate-pulse" />
            )}
            <select
              value={ambientType}
              onChange={(e) => {
                soundEngine.init();
                setAmbientType(e.target.value);
              }}
              className="bg-transparent text-slate-300 focus:outline-none text-xs cursor-pointer font-medium"
            >
              <option value="none" className="bg-obsidian-900">Silence</option>
              <option value="brown_noise" className="bg-obsidian-900">Brown Noise (ADHD)</option>
              <option value="rain" className="bg-obsidian-900">Rain & Stream</option>
              <option value="binaural" className="bg-obsidian-900">432Hz Calm Wave</option>
            </select>
          </div>

          {/* Close Zen Mode */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
            title="Exit Zen Mode (Esc or F)"
          >
            <span>Exit Zen</span>
            <span className="text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.2 rounded text-slate-400">Esc</span>
          </button>
        </div>
      </header>

      {/* Main Focus Chamber Canvas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        {/* Left Column: Focused Task & Subtasks (5 columns) */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between border-r border-white/[0.04] overflow-y-auto">
          <div>
            {/* Task Selector Switcher */}
            <div className="relative mb-6">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Active Target</span>
                <button
                  onClick={() => setShowTaskSelector(!showTaskSelector)}
                  className="text-cobalt-400 hover:text-cobalt-300 flex items-center gap-1 text-[11px] lowercase"
                >
                  <span>switch task</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Task Switcher Dropdown */}
              {showTaskSelector && (
                <div className="absolute top-10 left-0 right-0 max-h-60 overflow-y-auto bg-obsidian-900 border border-white/[0.1] rounded-xl shadow-2xl p-2 z-30">
                  <div className="text-[10px] text-slate-500 uppercase px-2 py-1 font-semibold">Select Task to Focus</div>
                  {tasks.filter((t) => !t.completed).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setShowTaskSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate flex items-center justify-between transition-colors ${
                        selectedTaskId === t.id ? 'bg-cobalt-900/60 text-white font-medium' : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-500 ml-2 uppercase font-mono">{t.priority}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Pinned Active Task Card */}
              {activeTask ? (
                <div className="p-5 rounded-2xl bg-obsidian-900/90 border border-cobalt-600/30 shadow-glow-subtle relative overflow-hidden group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cobalt-500/20 text-cobalt-300 border border-cobalt-500/30">
                        {activeTask.priority || 'P3'}
                      </span>
                      {(Array.isArray(activeTask.tags)
                        ? activeTask.tags
                        : typeof activeTask.tags === 'string' && activeTask.tags.trim()
                        ? activeTask.tags.split(',').map((t) => t.trim()).filter(Boolean)
                        : []
                      ).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                          #{tag}
                        </span>
                      ))}

                    </div>

                    <button
                      onClick={handleCompleteActiveTask}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        activeTask.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/[0.06] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.08]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeTask.completed ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                    {activeTask.title}
                  </h2>

                  {activeTask.description && (
                    <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">
                      {activeTask.description}
                    </p>
                  )}

                  {/* Interactive Subtasks in Zen Mode */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-cobalt-400" />
                        <span>Flow Steps ({activeTask.subtasks ? activeTask.subtasks.filter((s) => s.completed).length : 0}/{activeTask.subtasks ? activeTask.subtasks.length : 0})</span>
                      </span>
                    </div>

                    {/* Subtask Checkbox List */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeTask.subtasks && activeTask.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubtask(activeTask.id, sub.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                            sub.completed
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500 line-through'
                              : 'bg-obsidian-850/80 hover:bg-obsidian-800 border-white/[0.04] text-slate-200'
                          }`}
                        >
                          {sub.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0 hover:text-cobalt-400" />
                          )}
                          <span className="text-xs flex-1 truncate">{sub.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">⏱️ {sub.estimated_minutes}m</span>
                        </div>
                      ))}
                    </div>

                    {/* Inline Add Step */}
                    <form onSubmit={handleAddSubtaskInline} className="mt-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={newSubtaskInput}
                        onChange={(e) => setNewSubtaskInput(e.target.value)}
                        placeholder="+ Add focus step..."
                        className="flex-1 bg-obsidian-850/70 border border-white/[0.06] rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cobalt-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded-lg bg-cobalt-700 hover:bg-cobalt-600 text-white text-xs font-semibold"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-obsidian-900/50 border border-dashed border-white/[0.08] text-center">
                  <ListTodo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No task pinned</p>
                  <p className="text-xs text-slate-500 mt-1">Select an active task to guide your focus session</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Distraction Dump (Brain Dump) */}
          <div className="mt-6 pt-5 border-t border-white/[0.05]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span>Distraction Jot-Pad</span>
              </span>
              <span className="text-[10px] text-slate-500">Dump random thoughts safely</span>
            </div>
            <form onSubmit={handleDumpDistraction} className="relative">
              <input
                type="text"
                value={distractionInput}
                onChange={(e) => setDistractionInput(e.target.value)}
                placeholder="Got a random thought? Type & Enter to save to Inbox..."
                className="w-full bg-obsidian-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition-colors"
                title="Save thought to Inbox"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {distractionList.length > 0 && (
              <div className="mt-2 space-y-1">
                {distractionList.slice(0, 2).map((d, i) => (
                  <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 rounded-full bg-amber-400/60" />
                    <span className="truncate">{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Radial Timer & Controls (7 columns) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 relative">
          {/* Circular Countdown Progress Ring */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-obsidian-850"
                strokeWidth="5"
                fill="transparent"
              />
              {/* Progress active glow stroke */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-cobalt-500 transition-all duration-700"
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))',
                }}
              />
            </svg>

            {/* Inner Clock Face Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-cobalt-400 mb-1">
                {TIMER_PRESETS[mode].label}
              </span>
              <div className="text-6xl font-black tracking-tighter text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {formatTime(timeLeft)}
              </div>
              <span className="text-xs text-slate-400 mt-2 font-mono">
                {isRunning ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    In Deep Flow
                  </span>
                ) : (
                  <span>Paused</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons: Play/Pause, Reset, +5m */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetTimer}
              className="p-3.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 border border-white/[0.08] text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Reset Timer (R)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleTimer}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-glow-cobalt ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cobalt-600 hover:bg-cobalt-500 text-white'
              }`}
              title="Play / Pause (Space)"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Focus</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>Enter Flow</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddFiveMinutes}
              className="px-4 py-3.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Add 5 Minutes"
            >
              +5m
            </button>
          </div>

          {/* Shortcut Hints */}
          <div className="mt-8 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>[Space] Toggle</span>
            <span>•</span>
            <span>[R] Reset</span>
            <span>•</span>
            <span>[Esc] Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
