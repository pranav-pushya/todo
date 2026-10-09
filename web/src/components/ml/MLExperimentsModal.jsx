import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Activity,
  Code2,
  Copy,
  Check,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ExternalLink,
  Cpu,
  Trash2,
} from 'lucide-react';
import { MLAPI } from '../../services/api';
import { useTasks } from '../../context/TaskContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function MLExperimentsModal({ isOpen, onClose }) {
  const { fetchTasks } = useTasks();
  const { toast } = useUIFeedback();

  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'code' | 'test'
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Test Webhook Form State
  const [testModel, setTestModel] = useState('YOLOv8x-DefectDetector');
  const [testFramework, setTestFramework] = useState('PyTorch');
  const [testStatus, setTestStatus] = useState('success');
  const [testTaskTitle, setTestTaskTitle] = useState('Train YOLOv8 on custom defect dataset');
  const [testEpochs, setTestEpochs] = useState('50');
  const [testValLoss, setTestValLoss] = useState('0.0384');
  const [testAccuracy, setTestAccuracy] = useState('0.9821');
  const [isSending, setIsSending] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const data = await MLAPI.getExperiments(30);
      setExperiments(data);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRuns();
    }
  }, [isOpen]);

  const handleCopyCode = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendTestWebhook = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const payload = {
        model_name: testModel,
        framework: testFramework,
        status: testStatus,
        task_title: testTaskTitle,
        current_epoch: Number(testEpochs),
        total_epochs: Number(testEpochs),
        metrics: {
          val_loss: Number(testValLoss) || 0.038,
          accuracy: Number(testAccuracy) || 0.982,
          mAP50: 0.924,
        },
        training_time_seconds: 1420.5,
        dataset_name: 'custom_v2_augmented',
      };

      const res = await MLAPI.sendWebhook(payload);
      toast.success(
        res.auto_completed
          ? `🎉 Webhook processed! Task "${testTaskTitle}" auto-completed.`
          : `Webhook processed for ${testModel}`
      );
      await Promise.all([fetchRuns(), fetchTasks()]);
      setActiveTab('runs');
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch webhook');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRun = async (id) => {
    try {
      await MLAPI.deleteExperiment(id);
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      toast.success('Experiment run removed');
    } catch (err) {
      toast.error('Failed to delete experiment');
    }
  };

  if (!isOpen) return null;

  const pythonSnippet = `# 1-Line Python Webhook Callback
import requests

requests.post("http://localhost:8001/api/v1/ml/webhook", json={
    "model_name": "YOLOv8-Detect",
    "framework": "PyTorch",
    "status": "success",
    "task_title": "Train YOLOv8 on custom defect dataset",
    "current_epoch": 50,
    "total_epochs": 50,
    "metrics": {
        "val_loss": 0.0384,
        "accuracy": 0.9821,
        "mAP50": 0.9240
    },
    "training_time_seconds": 1820.5,
    "dataset_name": "defect_v2_augmented"
})`;

  const pytorchHookSnippet = `# PyTorch Training Loop Hook
import requests

def notify_todo_on_epoch_end(epoch, total_epochs, val_loss, accuracy, model_name="ResNet50"):
    is_final = epoch == total_epochs
    payload = {
        "model_name": model_name,
        "framework": "PyTorch",
        "status": "success" if is_final else "running",
        "task_title": f"Train {model_name}",
        "current_epoch": epoch,
        "total_epochs": total_epochs,
        "metrics": {"val_loss": float(val_loss), "accuracy": float(accuracy)}
    }
    try:
        requests.post("http://localhost:8001/api/v1/ml/webhook", json=payload, timeout=2)
    except Exception as e:
        print(f"To-Do notification skipped: {e}")`;

  const hfCallbackSnippet = `# HuggingFace Trainer Callback
from transformers import TrainerCallback
import requests

class TodoCompletionCallback(TrainerCallback):
    def on_train_end(self, args, state, control, **kwargs):
        payload = {
            "model_name": "Llama-3-FineTuned",
            "framework": "HuggingFace",
            "status": "success",
            "task_title": "Fine-tune Llama 3 on instruction pairs",
            "metrics": {
                "eval_loss": getattr(state, "best_metric", 0.0),
                "total_flos": state.total_flos
            }
        }
        requests.post("http://localhost:8001/api/v1/ml/webhook", json=payload)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-obsidian-900 border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-obsidian-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI/ML Experiment Lab & Webhooks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  PyTorch / Colab / HF
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Trigger task auto-completion and attach model metrics directly from training scripts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/[0.06] bg-obsidian-950/30">
          <button
            onClick={() => setActiveTab('runs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'runs'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Experiment Runs ({experiments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Integration Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'test'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Webhook Dispatcher</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: RUNS LIST */}
          {activeTab === 'runs' && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-slate-500 text-xs">Loading experiment runs...</div>
              ) : experiments.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <FlaskConical className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">No ML experiment callbacks logged yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Send a training webhook from your Jupyter notebook or test it with our dispatcher.
                  </p>
                  <button
                    onClick={() => setActiveTab('test')}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-glow-subtle cursor-pointer"
                  >
                    Simulate Test Webhook
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {experiments.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl bg-obsidian-850/90 border border-white/[0.06] hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm truncate">{exp.model_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {exp.framework}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              exp.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {exp.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{exp.status.toUpperCase()}</span>
                          </span>
                          {exp.current_epoch && exp.total_epochs && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Epoch {exp.current_epoch}/{exp.total_epochs}
                            </span>
                          )}
                        </div>

                        {exp.task_title && (
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="text-slate-500">Linked Task:</span>
                            <span className="text-cobalt-300 font-medium truncate">{exp.task_title}</span>
                          </div>
                        )}

                        {/* Metrics Pills */}
                        {exp.metrics && Object.keys(exp.metrics).length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {Object.entries(exp.metrics).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-[10px] font-mono text-slate-300"
                              >
                                <span className="text-slate-500">{k}:</span>{' '}
                                <span className="text-emerald-400 font-semibold">{typeof v === 'number' ? v.toFixed(4) : String(v)}</span>
                              </span>
                            ))}
                            {exp.training_time_seconds && (
                              <span className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-[10px] font-mono text-slate-400">
                                ⏱️ {Math.round(exp.training_time_seconds)}s
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {new Date(exp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => handleDeleteRun(exp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Run"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE SNIPPETS */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p>
                  Copy any snippet below into your training scripts or Colab notebooks. When your model finishes training, it will automatically notify this platform, mark your task done, and store the metrics!
                </p>
              </div>

              {/* Snippet 1: Quick Python */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>1. Minimal Python Request</span>
                  <button
                    onClick={() => handleCopyCode('python', pythonSnippet)}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {copiedKey === 'python' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'python' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-obsidian-950 border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {pythonSnippet}
                </pre>
              </div>

              {/* Snippet 2: PyTorch Loop */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>2. PyTorch Training Loop Hook</span>
                  <button
                    onClick={() => handleCopyCode('pytorch', pytorchHookSnippet)}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {copiedKey === 'pytorch' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pytorch' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-obsidian-950 border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {pytorchHookSnippet}
                </pre>
              </div>

              {/* Snippet 3: HuggingFace Callback */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>3. HuggingFace Trainer Callback</span>
                  <button
                    onClick={() => handleCopyCode('hf', hfCallbackSnippet)}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {copiedKey === 'hf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'hf' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-obsidian-950 border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {hfCallbackSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: TEST DISPATCHER */}
          {activeTab === 'test' && (
            <form onSubmit={handleSendTestWebhook} className="space-y-4 max-w-xl">
              <div className="p-4 rounded-xl bg-obsidian-950 border border-white/[0.06] space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Simulate Webhook Payload</h4>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Model Name</label>
                  <input
                    type="text"
                    value={testModel}
                    onChange={(e) => setTestModel(e.target.value)}
                    className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Framework</label>
                    <select
                      value={testFramework}
                      onChange={(e) => setTestFramework(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="PyTorch">PyTorch</option>
                      <option value="TensorFlow">TensorFlow</option>
                      <option value="HuggingFace">HuggingFace</option>
                      <option value="YOLO">Ultralytics YOLO</option>
                      <option value="Scikit-learn">Scikit-learn</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Status</label>
                    <select
                      value={testStatus}
                      onChange={(e) => setTestStatus(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="success">Success (Auto-Complete)</option>
                      <option value="failed">Failed (Mark Urgent P1)</option>
                      <option value="running">Checkpoint (Running)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Task Title</label>
                  <input
                    type="text"
                    value={testTaskTitle}
                    onChange={(e) => setTestTaskTitle(e.target.value)}
                    className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">If a task with this title exists, it will be completed; otherwise a new one is created.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Epochs</label>
                    <input
                      type="number"
                      value={testEpochs}
                      onChange={(e) => setTestEpochs(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Validation Loss</label>
                    <input
                      type="text"
                      value={testValLoss}
                      onChange={(e) => setTestValLoss(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Accuracy / Score</label>
                    <input
                      type="text"
                      value={testAccuracy}
                      onChange={(e) => setTestAccuracy(e.target.value)}
                      className="w-full bg-obsidian-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow-subtle flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Dispatching Webhook...' : 'Dispatch Training Webhook'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
