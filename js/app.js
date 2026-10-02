/* ==========================================================================
   APP CONTROLLER & CORE SYSTEM STATE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});

const AppController = {
  theme: 'dark',
  activeTab: 'tab-dashboard',

  tabTitles: {
    'tab-dashboard': { title: 'Dashboard Overview', subtitle: 'Morning & Night Routine • Streak & Threat Telemetry' },
    'tab-dailybytes': { title: 'Daily Bytes Intel', subtitle: 'Grok API Powered AI/ML Papers & Zero-Day Threat Stream' },
    'tab-deepwork': { title: 'Deep Work Telemetry', subtitle: 'Pomodoro Focus Timer & Web Audio Soundscapes' },
    'tab-worklog': { title: 'AI Work Log', subtitle: 'Automated Daily Reflection & Knowledge Generator' },
    'tab-oracle': { title: 'AI Oracle Assistant', subtitle: 'Cyber & AI Intelligence Conversational Copilot' }
  },

  init() {
    this.initTheme();
    this.initNavigation();
    this.initLiveClock();
    this.initSettingsModal();
    this.initMobileSidebar();
  },

  /* Theme System */
  initTheme() {
    const savedTheme = localStorage.getItem('cyber_app_theme') || 'dark';
    this.setTheme(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showToast(`Switched to ${newTheme.toUpperCase()} mode`);
      });
    }
  },

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cyber_app_theme', theme);

    const sunIcon = document.getElementById('theme-sun-icon');
    const moonIcon = document.getElementById('theme-moon-icon');

    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
  },

  /* Navigation & Tab Router */
  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav Active State
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    // Update Tab View Visibility
    document.querySelectorAll('.tab-view').forEach(view => {
      if (view.id === tabId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Header Title
    const titleInfo = this.tabTitles[tabId] || { title: 'CyberAI Hub', subtitle: 'Student OS' };
    const titleEl = document.getElementById('current-tab-title');
    const subTitleEl = document.getElementById('current-tab-subtitle');
    if (titleEl) titleEl.textContent = titleInfo.title;
    if (subTitleEl) subTitleEl.textContent = titleInfo.subtitle;

    // Close Mobile Sidebar if Open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  },

  /* Live Clock */
  initLiveClock() {
    const clockEl = document.getElementById('live-clock');
    const updateClock = () => {
      if (!clockEl) return;
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    updateClock();
    setInterval(updateClock, 1000);
  },

  /* Settings Modal */
  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const apiKeyInput = document.getElementById('grok-api-key');
    const nameInput = document.getElementById('student-name-input');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        const savedKey = localStorage.getItem('grok_api_key') || '';
        const savedName = localStorage.getItem('student_profile_name') || 'Alex Vance';
        if (apiKeyInput) apiKeyInput.value = savedKey;
        if (nameInput) nameInput.value = savedName;
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (saveBtn && modal) {
      saveBtn.addEventListener('click', () => {
        const key = apiKeyInput ? apiKeyInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : 'Alex Vance';
        
        localStorage.setItem('grok_api_key', key);
        localStorage.setItem('student_profile_name', name);
        
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) userNameEl.textContent = name;

        modal.classList.remove('active');
        this.showToast('Settings saved successfully!');
      });
    }
  },

  /* Mobile Sidebar Toggle */
  initMobileSidebar() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  /* Global Toast System */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};
