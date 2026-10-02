/* ==========================================================================
   DEEP WORK MODULE (POMODORO TIMER & WEB AUDIO AMBIENT SYNTH)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  DeepWorkModule.init();
});

const DeepWorkModule = {
  timerDuration: 1500, // Default 25 min (1500 sec)
  timeLeft: 1500,
  timerInterval: null,
  isRunning: false,

  // Web Audio System
  audioCtx: null,
  synths: {
    rain: null,
    binaural: null,
    cyber: null
  },

  init() {
    this.initTimerControls();
    this.initAudioSynthesizer();
    this.loadSessionLogs();
  },

  /* Pomodoro Timer Engine */
  initTimerControls() {
    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const modeBtns = document.querySelectorAll('.timer-modes .mode-btn');

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const duration = parseInt(btn.getAttribute('data-duration') || '1500', 10);
        this.setTimerDuration(duration);
      });
    });

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startTimer());
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseTimer());
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }

    this.updateTimerDisplay();
  },

  setTimerDuration(seconds) {
    this.pauseTimer();
    this.timerDuration = seconds;
    this.timeLeft = seconds;
    this.updateTimerDisplay();
  },

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);

    if (window.AppController) AppController.showToast('Focus session started!');
  },

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);

    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  },

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.timerDuration;
    this.updateTimerDisplay();
    if (window.AppController) AppController.showToast('Timer reset.');
  },

  completeSession() {
    this.pauseTimer();
    this.timeLeft = 0;
    this.updateTimerDisplay();

    // Play completion chime via Web Audio API
    this.playChime();

    // Log Session
    const mins = Math.round(this.timerDuration / 60);
    this.addSessionLog(`${mins}m Focus Session Completed`);

    if (window.AppController) {
      AppController.showToast('🔔 Deep Work Session Complete! Take a well-deserved break!');
    }
  },

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const digitsEl = document.getElementById('timer-digits');
    if (digitsEl) digitsEl.textContent = timeString;

    // SVG Ring Progress Update
    const ring = document.getElementById('timer-progress-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 105; // ~660
      const pct = this.timeLeft / this.timerDuration;
      const offset = circumference * (1 - pct);
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${offset}`;
    }
  },

  /* Web Audio Synthesizer Engine */
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  initAudioSynthesizer() {
    const sliders = document.querySelectorAll('.volume-slider');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const soundType = e.target.getAttribute('data-sound');
        const volume = parseFloat(e.target.value);
        this.updateSoundVolume(soundType, volume);
      });
    });
  },

  updateSoundVolume(type, volume) {
    const ctx = this.getAudioContext();

    if (type === 'rain') {
      if (!this.synths.rain) this.synths.rain = this.createRainSynth(ctx);
      this.synths.rain.gainNode.gain.setTargetAtTime(volume * 0.3, ctx.currentTime, 0.1);
    } else if (type === 'binaural') {
      if (!this.synths.binaural) this.synths.binaural = this.createBinauralSynth(ctx);
      this.synths.binaural.gainNode.gain.setTargetAtTime(volume * 0.25, ctx.currentTime, 0.1);
    } else if (type === 'cyber') {
      if (!this.synths.cyber) this.synths.cyber = this.createCyberDroneSynth(ctx);
      this.synths.cyber.gainNode.gain.setTargetAtTime(volume * 0.35, ctx.currentTime, 0.1);
    }
  },

  // 1. Procedural Cyber Rain Noise
  createRainSynth(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Pink/white noise
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start();

    return { gainNode, whiteNoise };
  },

  // 2. Alpha Binaural (10Hz Difference)
  createBinauralSynth(ctx) {
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();

    oscLeft.frequency.value = 200; // Left ear 200Hz
    oscRight.frequency.value = 210; // Right ear 210Hz (10Hz binaural delta)

    const merger = ctx.createChannelMerger(2);
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscLeft.start();
    oscRight.start();

    return { gainNode, oscLeft, oscRight };
  },

  // 3. Cyber Lo-Fi Ambient Drone
  createCyberDroneSynth(ctx) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.value = 65.41; // C2
    osc2.frequency.value = 98.00; // G2

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    return { gainNode, osc1, osc2 };
  },

  playChime() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.5); // C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime fallback', e);
    }
  },

  /* Session Log Storage */
  addSessionLog(taskName) {
    const logs = this.getSessionLogs();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    logs.unshift({ time: timeStr, task: taskName });

    localStorage.setItem('deepwork_session_logs', JSON.stringify(logs.slice(0, 10)));
    this.loadSessionLogs();
  },

  getSessionLogs() {
    const saved = localStorage.getItem('deepwork_session_logs');
    return saved ? JSON.parse(saved) : [
      { time: '09:30 AM', task: '25m Focus (PyTorch CUDA Optimization)' },
      { time: '11:15 AM', task: '25m Focus (CVE Payload Analysis)' }
    ];
  },

  loadSessionLogs() {
    const listEl = document.getElementById('session-log-list');
    if (!listEl) return;
    const logs = this.getSessionLogs();
    listEl.innerHTML = logs.map(l => `<li>• ${l.time} — ${l.task}</li>`).join('');
  }
};
