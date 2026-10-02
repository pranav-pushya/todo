/* ==========================================================================
   AI WORK LOG MODULE (AUTOMATED DAILY REFLECTION WITH API INTEGRATION)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  WorkLogModule.init();
});

const WorkLogModule = {
  currentGeneratedMarkdown: '',

  init() {
    const generateBtn = document.getElementById('generate-reflection-btn');
    const copyBtn = document.getElementById('copy-log-btn');
    const exportBtn = document.getElementById('export-log-btn');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateReflection());
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportMarkdownFile());
    }

    this.renderDefaultPreview();
  },

  renderDefaultPreview() {
    const defaultLog = `
# ⚡ CYBER/AI DAILY REFLECTION LOG
**Date**: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Student Profile**: Alex Vance (CSE AI/ML & CyberSec)
**Productivity Rating**: 9/10

---

### 🚀 Key Accomplishments
- Implemented FlashAttention-3 benchmark testing on CUDA PyTorch tensors.
- Patched local Linux kernel test VM against CVE-2026-8819 eBPF vulnerability.
- Completed 4 Pomodoro Deep Work sessions (100 mins total).

### 🚧 Blockers & Challenges
- Memory fragmentation during GPU tensor batch transfers. Resolving using PyTorch CUDACachingAllocator.

### 🧠 Concepts Mastered
- Multi-head Latent Attention (MLA) low-rank QKV projections.
- eBPF verifier bounds checking mechanics & kernel register safety.

---
*Generated automatically by CyberAI OS Automated Daily Reflection Engine*
    `.trim();

    this.currentGeneratedMarkdown = defaultLog;
    const previewEl = document.getElementById('log-markdown-preview');
    if (previewEl) previewEl.textContent = defaultLog;
  },

  async generateReflection() {
    const acc = document.getElementById('work-accomplished').value.trim() || 'Completed planned study goals and coding labs.';
    const block = document.getElementById('work-blockers').value.trim() || 'No major technical blockers encountered today.';
    const learn = document.getElementById('work-learnings').value.trim() || 'Explored AI architecture papers and threat vectors.';
    const rating = document.getElementById('work-rating').value || '9';
    const studentName = localStorage.getItem('student_profile_name') || 'Alex Vance';
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const previewEl = document.getElementById('log-markdown-preview');
    if (previewEl) previewEl.textContent = "⚡ Generating AI Reflection Log...";

    let markdown = null;

    // Check if API Key is available in CONFIG
    if (window.CONFIG && typeof CONFIG.fetchAICompletion === 'function') {
      const prompt = `
Generate a structured Markdown daily reflection log for a CSE AI/ML and Cybersecurity student named ${studentName}.
Date: ${todayStr}
Productivity Rating: ${rating}/10
Accomplishments: ${acc}
Blockers: ${block}
Concepts Mastered: ${learn}

Format in clean markdown with sections for Key Accomplishments, Blockers & Challenges, Concepts Mastered, and Actionable AI Recommendations.
      `;

      markdown = await CONFIG.fetchAICompletion(
        prompt,
        "You are an automated reflection generator for a computer science engineering student specializing in AI/ML and cybersecurity."
      );
    }

    // Fallback template if no API Key or request failed
    if (!markdown) {
      const formatBullets = (text) => {
        return text.split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => line.startsWith('-') ? line : `- ${line}`)
          .join('\n');
      };

      markdown = `
# ⚡ CYBER/AI DAILY REFLECTION LOG
**Date**: ${todayStr}
**Student Profile**: ${studentName} (CSE AI/ML & CyberSec)
**Productivity Rating**: ${rating}/10

---

### 🚀 Key Accomplishments
${formatBullets(acc)}

### 🚧 Blockers & Challenges
${formatBullets(block)}

### 🧠 AI & Cyber Concepts Mastered
${formatBullets(learn)}

### 🔮 Automated AI Insights & Next Steps
- **Performance Rating**: ${rating >= 8 ? '🔥 High Velocity Day! Maintain momentum.' : '⚡ Consistent effort. Focus on eliminating friction points tomorrow.'}
- **Action Item**: Review mastered concepts in tomorrow morning's protocol session.

---
*Generated automatically by CyberAI OS Automated Daily Reflection Engine*
      `.trim();
    }

    this.currentGeneratedMarkdown = markdown;

    if (previewEl) {
      previewEl.textContent = markdown;
    }

    this.saveLogToHistory(todayStr, markdown);

    if (window.AppController) {
      AppController.showToast('✨ Automated AI Reflection generated!');
    }
  },

  copyToClipboard() {
    if (!this.currentGeneratedMarkdown) return;
    navigator.clipboard.writeText(this.currentGeneratedMarkdown).then(() => {
      if (window.AppController) AppController.showToast('📋 Markdown log copied to clipboard!');
    }).catch(err => {
      console.error('Copy failed', err);
    });
  },

  exportMarkdownFile() {
    if (!this.currentGeneratedMarkdown) return;
    const blob = new Blob([this.currentGeneratedMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.download = `Work_Log_${dateStr}.md`;
    link.click();
    URL.revokeObjectURL(link.href);

    if (window.AppController) {
      AppController.showToast('📥 Downloaded Work_Log.md');
    }
  },

  saveLogToHistory(date, content) {
    const logs = JSON.parse(localStorage.getItem('ai_work_log_history') || '[]');
    logs.unshift({ date, content });
    localStorage.setItem('ai_work_log_history', JSON.stringify(logs.slice(0, 30)));
  }
};
