/* ==========================================================================
   DASHBOARD MODULE (ROUTINES, STREAK, TELEMETRY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  DashboardModule.init();
});

const DashboardModule = {
  morningItems: [
    { id: 'm1', text: '06:00 AM — Hydrate (500ml Water + Electrolytes)' },
    { id: 'm2', text: '06:15 AM — Cold Shower & 10m Meditation' },
    { id: 'm3', text: '06:45 AM — Read Top ArXiv AI/ML Papers & CVEs' },
    { id: 'm4', text: '07:15 AM — 45m PyTorch / CUDA Shader Coding' }
  ],

  nightItems: [
    { id: 'n1', text: '09:30 PM — Git Push & AI Work Log Reflection' },
    { id: 'n2', text: '10:00 PM — HackTheBox / Security Vulnerability Audit' },
    { id: 'n3', text: '10:30 PM — Night Filter & Plan Tomorrow\'s Focus' },
    { id: 'n4', text: '11:00 PM — Sleep Protocol (8 Hrs Target)' }
  ],

  init() {
    this.renderChecklists();
    this.initStreakAndStats();
    this.initResetButton();
    this.initTickerQuotes();
  },

  getStorageKey() {
    const today = new Date().toISOString().split('T')[0];
    return `routine_state_${today}`;
  },

  getRoutineState() {
    const saved = localStorage.getItem(this.getStorageKey());
    return saved ? JSON.parse(saved) : {};
  },

  saveRoutineState(state) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(state));
    this.updateProgress();
  },

  renderChecklists() {
    const morningList = document.getElementById('morning-routine-list');
    const nightList = document.getElementById('night-routine-list');
    const state = this.getRoutineState();

    if (morningList) {
      morningList.innerHTML = this.morningItems.map(item => `
        <div class="routine-item ${state[item.id] ? 'completed' : ''}">
          <label class="checkbox-clay">
            <input type="checkbox" data-id="${item.id}" ${state[item.id] ? 'checked' : ''}>
            <span class="checkmark"></span>
            <span>${item.text}</span>
          </label>
        </div>
      `).join('');
    }

    if (nightList) {
      nightList.innerHTML = this.nightItems.map(item => `
        <div class="routine-item ${state[item.id] ? 'completed' : ''}">
          <label class="checkbox-clay">
            <input type="checkbox" data-id="${item.id}" ${state[item.id] ? 'checked' : ''}>
            <span class="checkmark"></span>
            <span>${item.text}</span>
          </label>
        </div>
      `).join('');
    }

    // Attach Checkbox Listeners
    document.querySelectorAll('.routine-list input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const currentState = this.getRoutineState();
        currentState[id] = e.target.checked;
        this.saveRoutineState(currentState);

        const parentItem = e.target.closest('.routine-item');
        if (parentItem) {
          parentItem.classList.toggle('completed', e.target.checked);
        }
      });
    });

    this.updateProgress();
  },

  updateProgress() {
    const state = this.getRoutineState();
    const totalItems = this.morningItems.length + this.nightItems.length;
    const completedItems = Object.values(state).filter(Boolean).length;
    const percentage = Math.round((completedItems / totalItems) * 100);

    // Update Percentage Text Displays
    const ringText = document.getElementById('ring-pct-text');
    const compVal = document.getElementById('routine-comp-val');
    if (ringText) ringText.textContent = `${percentage}%`;
    if (compVal) compVal.textContent = `${percentage}%`;

    // Update SVG Progress Ring Circle
    const circle = document.getElementById('routine-progress-circle');
    if (circle) {
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius; // ~408.4
      const offset = circumference - (percentage / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }

    // Update Streak logic
    if (percentage === 100) {
      this.incrementStreak();
    }
  },

  initStreakAndStats() {
    let streak = parseInt(localStorage.getItem('user_habit_streak') || '14', 10);
    const streakEl = document.getElementById('streak-counter-val');
    if (streakEl) streakEl.textContent = `${streak} Days`;
  },

  incrementStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastCompletedDate = localStorage.getItem('last_routine_complete_date');

    if (lastCompletedDate !== today) {
      let streak = parseInt(localStorage.getItem('user_habit_streak') || '14', 10) + 1;
      localStorage.setItem('user_habit_streak', streak.toString());
      localStorage.setItem('last_routine_complete_date', today);
      
      const streakEl = document.getElementById('streak-counter-val');
      if (streakEl) streakEl.textContent = `${streak} Days`;
      
      if (window.AppController) {
        AppController.showToast('🎉 100% Daily Protocols Completed! Streak +1!');
      }
    }
  },

  initResetButton() {
    const resetBtn = document.getElementById('reset-checklist-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem(this.getStorageKey());
        this.renderChecklists();
        if (window.AppController) {
          AppController.showToast('Checklist protocol reset for today.');
        }
      });
    }
  },

  initTickerQuotes() {
    const tickerEl = document.getElementById('threat-ticker-text');
    const tickers = [
      "🔴 CVE-2026-8819: Zero-day memory corruption in Linux Kernel v6.14 • 🚀 PyTorch 3.0 released with native CUDA graph compilation • 🛡️ Threat Actor 'NullPoint' targeting AI model weights via unauthenticated pickle deserialization",
      "⚡ OpenAI introduces Grok-v3 Reasoning API with 2M token context • 🔒 NIST issues revised Post-Quantum Cryptography standards for RSA deprecation • 🤖 DeepSeek releases v3 open weights with 671B parameters",
      "⚠️ Critical vulnerability found in Docker runtime container escape • 📊 Transformer Attention optimization reduces LLM latency by 40% • 🔐 Zero-Knowledge Proofs implemented in decentralized auth frameworks"
    ];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % tickers.length;
      if (tickerEl) tickerEl.textContent = tickers[idx];
    }, 25000);
  }
};
