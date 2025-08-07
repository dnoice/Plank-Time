// ===== PLANK TIME - COMPLETE FUNCTIONALITY WITH ADVANCED FEATURES & POLISH ===== //

class PlankTime {
  constructor() {
    // Application state
    this.currentView = 'clock';
    this.settings = {
      is24Hour: false,
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'default',
      volume: 70,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      fullscreenMode: false,
      breakReminders: true,
      progressSounds: false
    };

    // Timer states
    this.stopwatch = {
      time: 0,
      running: false,
      laps: [],
      interval: null
    };

    this.timer = {
      time: 0,
      total: 0,
      running: false,
      interval: null
    };

    this.pomodoro = {
      time: 25 * 60,
      mode: 'work',
      running: false,
      sessions: 0,
      interval: null
    };

    // Focus mode state
    this.focus = {
      active: false,
      time: 0,
      total: 0,
      interval: null,
      paused: false
    };

    // Statistics and tracking
    this.statistics = {
      sessionsToday: [],
      totalTimeToday: 0,
      currentStreak: 0,
      lastStreakDate: null,
      weeklyData: [],
      sessionHistory: []
    };

    this.alarms = [];

    // World clock timezones
    this.worldTimezones = [
      { timezone: 'America/New_York', label: 'New York' },
      { timezone: 'Europe/London', label: 'London' },
      { timezone: 'Asia/Tokyo', label: 'Tokyo' },
      { timezone: 'Australia/Sydney', label: 'Sydney' }
    ];

    // Focus tips
    this.focusTips = [
      "Stay focused and avoid distractions. You've got this! 💪",
      "Take deep breaths and concentrate on your current task 🧘",
      "Remember your goals and why this work matters to you 🎯",
      "Break complex tasks into smaller, manageable steps 📝",
      "Eliminate notifications and digital distractions 📱",
      "Keep a water bottle nearby and stay hydrated 💧",
      "Maintain good posture and take care of your body 🏃",
      "Focus on progress, not perfection 🌟",
      "Use the 2-minute rule: if it takes less than 2 minutes, do it now ⚡",
      "Practice single-tasking for better concentration 🎪"
    ];

    // Performance monitoring
    this.performanceMetrics = {
      startTime: performance.now(),
      loadTime: 0,
      errors: 0
    };

    // Initialize the application
    this.init();
  }

  // ===== INITIALIZATION ===== //
  init() {
    try {
      // Show loading indicator
      this.showLoading();
      
      // Load saved data
      this.loadSettings();
      this.loadAlarms();
      this.loadStatistics();
      
      // Setup application
      this.setupEventListeners();
      this.startMainClock();
      this.updateAnalogClock();
      this.updateWorldClocks();
      this.requestNotificationPermission();
      this.applyTheme();
      
      // Initialize the view system
      this.initializeViews();
      
      // Setup intervals
      this.setupIntervals();
      
      // Performance tracking
      this.performanceMetrics.loadTime = performance.now() - this.performanceMetrics.startTime;
      console.log(`🚀 Plank Time loaded in ${Math.round(this.performanceMetrics.loadTime)}ms`);
      
      // Hide loading indicator
      setTimeout(() => this.hideLoading(), 500);
      
      // Welcome message for new users
      if (!localStorage.getItem('plankTimeWelcomed')) {
        setTimeout(() => {
          this.showToast('Welcome to Plank Time!', 'Your ultimate productivity companion is ready. Press ? for keyboard shortcuts.', 'info', 5000);
          localStorage.setItem('plankTimeWelcomed', 'true');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Initialization error:', error);
      this.handleError('Failed to initialize Plank Time', error);
    }
  }

  setupIntervals() {
    // Main clock update
    setInterval(() => {
      try {
        this.updateMainClock();
        this.updateAnalogClock();
        this.updateWorldClocks();
        this.checkAlarms();
        this.updateStatistics();
      } catch (error) {
        console.error('Clock update error:', error);
      }
    }, 1000);
    
    // Statistics save
    setInterval(() => {
      try {
        this.saveStatistics();
      } catch (error) {
        console.error('Statistics save error:', error);
      }
    }, 60000);

    // Focus tip rotation
    setInterval(() => {
      if (this.focus.active) {
        this.updateFocusTip();
      }
    }, 30000);
  }

  showLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }
  }

  hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
      }, 500);
    }
  }

  handleError(message, error = null) {
    this.performanceMetrics.errors++;
    console.error(message, error);
    this.showToast('Error', message, 'error');
  }

  // ===== VIEW INITIALIZATION ===== //
  initializeViews() {
    // Hide all views first
    document.querySelectorAll('.view-container').forEach(container => {
      container.classList.remove('active');
      container.classList.add('hidden');
    });
    
    // Show the clock view by default
    const clockView = document.getElementById('clockView');
    if (clockView) {
      clockView.classList.remove('hidden');
      clockView.classList.add('active');
    }
    
    // Set the active navigation
    const clockTab = document.querySelector('[data-view="clock"]');
    if (clockTab) {
      clockTab.classList.add('active');
      clockTab.setAttribute('aria-selected', 'true');
    }
    
    // Initialize all other nav pills
    document.querySelectorAll('.nav-pill').forEach(pill => {
      if (pill !== clockTab) {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });
    
    this.currentView = 'clock';
    
    // Initialize control states
    this.updateStopwatchControls();
    this.updateTimerControls();
    this.updatePomodoroControls();
    this.updateSettingsDisplay();
    this.updateAdvancedSettings();
  }

  // ===== EVENT LISTENERS ===== //
  setupEventListeners() {
    try {
      // Navigation
      document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          const view = e.currentTarget.dataset.view;
          if (view) {
            this.switchView(view);
          }
        });
      });

      // Stopwatch controls
      const stopwatchToggle = document.getElementById('stopwatchToggle');
      const stopwatchLap = document.getElementById('stopwatchLap');
      const stopwatchReset = document.getElementById('stopwatchReset');
      
      if (stopwatchToggle) stopwatchToggle.addEventListener('click', () => this.toggleStopwatch());
      if (stopwatchLap) stopwatchLap.addEventListener('click', () => this.addLap());
      if (stopwatchReset) stopwatchReset.addEventListener('click', () => this.resetStopwatch());

      // Timer controls
      const timerToggle = document.getElementById('timerToggle');
      const timerReset = document.getElementById('timerReset');
      
      if (timerToggle) timerToggle.addEventListener('click', () => this.toggleTimer());
      if (timerReset) timerReset.addEventListener('click', () => this.resetTimer());

      // Pomodoro controls
      const pomodoroToggle = document.getElementById('pomodoroToggle');
      const pomodoroReset = document.getElementById('pomodoroReset');
      
      if (pomodoroToggle) pomodoroToggle.addEventListener('click', () => this.togglePomodoro());
      if (pomodoroReset) pomodoroReset.addEventListener('click', () => this.resetPomodoro());

      // Pomodoro mode buttons
      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mode = e.currentTarget.dataset.mode;
          if (mode) {
            this.setPomodoroMode(mode);
          }
        });
      });

      // Alarm form - prevent default form submission
      const alarmForm = document.querySelector('.alarm-form');
      if (alarmForm) {
        alarmForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.addAlarm();
        });
      }

      // Basic settings toggles
      const toggle24Hour = document.getElementById('toggle24Hour');
      const toggleSound = document.getElementById('toggleSound');
      const toggleNotifications = document.getElementById('toggleNotifications');
      
      if (toggle24Hour) toggle24Hour.addEventListener('click', () => this.toggle24Hour());
      if (toggleSound) toggleSound.addEventListener('click', () => this.toggleSound());
      if (toggleNotifications) toggleNotifications.addEventListener('click', () => this.toggleNotifications());

      // Volume control
      const volumeSlider = document.getElementById('volumeSlider');
      const volumeIndicator = document.getElementById('volumeIndicator');
      
      if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
          const volume = parseInt(e.target.value);
          this.settings.volume = volume;
          if (volumeIndicator) volumeIndicator.textContent = `${volume}%`;
          this.saveSettings();
        });
      }

      // Theme selector
      const themeSelector = document.getElementById('themeSelector');
      if (themeSelector) {
        themeSelector.addEventListener('change', (e) => this.changeTheme(e.target.value));
      }

      // Advanced Pomodoro settings
      const workDuration = document.getElementById('workDuration');
      const shortBreakDuration = document.getElementById('shortBreakDuration');
      const longBreakDuration = document.getElementById('longBreakDuration');
      const sessionsUntilLongBreak = document.getElementById('sessionsUntilLongBreak');
      
      if (workDuration) workDuration.addEventListener('change', (e) => this.updatePomodoroSetting('workDuration', parseInt(e.target.value)));
      if (shortBreakDuration) shortBreakDuration.addEventListener('change', (e) => this.updatePomodoroSetting('shortBreakDuration', parseInt(e.target.value)));
      if (longBreakDuration) longBreakDuration.addEventListener('change', (e) => this.updatePomodoroSetting('longBreakDuration', parseInt(e.target.value)));
      if (sessionsUntilLongBreak) sessionsUntilLongBreak.addEventListener('change', (e) => this.updatePomodoroSetting('sessionsUntilLongBreak', parseInt(e.target.value)));

      // Focus mode controls
      document.querySelectorAll('.focus-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const duration = parseInt(e.currentTarget.dataset.duration);
          this.startFocusSession(duration);
        });
      });

      const startCustomFocus = document.getElementById('startCustomFocus');
      if (startCustomFocus) {
        startCustomFocus.addEventListener('click', () => {
          const duration = parseInt(document.getElementById('customFocusDuration')?.value || 60);
          this.startFocusSession(duration * 60);
        });
      }

      // Focus mode toggles
      const toggleFullscreen = document.getElementById('toggleFullscreen');
      const toggleBreakReminders = document.getElementById('toggleBreakReminders');
      const toggleProgressSounds = document.getElementById('toggleProgressSounds');
      
      if (toggleFullscreen) toggleFullscreen.addEventListener('click', () => this.toggleFullscreen());
      if (toggleBreakReminders) toggleBreakReminders.addEventListener('click', () => this.toggleBreakReminders());
      if (toggleProgressSounds) toggleProgressSounds.addEventListener('click', () => this.toggleProgressSounds());

      // Focus overlay controls
      const exitFocus = document.getElementById('exitFocus');
      const pauseFocusSession = document.getElementById('pauseFocusSession');
      const endFocusSession = document.getElementById('endFocusSession');
      
      if (exitFocus) exitFocus.addEventListener('click', () => this.exitFocusMode());
      if (pauseFocusSession) pauseFocusSession.addEventListener('click', () => this.toggleFocusPause());
      if (endFocusSession) endFocusSession.addEventListener('click', () => this.endFocusSession());

      // Data management
      const exportData = document.getElementById('exportData');
      const importData = document.getElementById('importData');
      const clearData = document.getElementById('clearData');
      const importFileInput = document.getElementById('importFileInput');
      
      if (exportData) exportData.addEventListener('click', () => this.exportData());
      if (importData) importData.addEventListener('click', () => this.importData());
      if (clearData) clearData.addEventListener('click', () => this.clearAllData());
      if (importFileInput) importFileInput.addEventListener('change', (e) => this.handleFileImport(e));

      // Settings actions
      const testSound = document.getElementById('testSound');
      const testNotification = document.getElementById('testNotification');
      
      if (testSound) testSound.addEventListener('click', () => this.playNotificationSound());
      if (testNotification) testNotification.addEventListener('click', () => this.showNotification('Test Notification', 'This is a test notification!'));

      // Keyboard shortcuts help
      const closeKeyboardHelp = document.getElementById('closeKeyboardHelp');
      if (closeKeyboardHelp) closeKeyboardHelp.addEventListener('click', () => this.hideKeyboardHelp());

      // Input validation for timer
      const timerMinutes = document.getElementById('timerMinutes');
      const timerSeconds = document.getElementById('timerSeconds');
      
      if (timerMinutes) {
        timerMinutes.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          if (value < 0) e.target.value = 0;
          if (value > 59) e.target.value = 59;
        });
      }
      
      if (timerSeconds) {
        timerSeconds.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          if (value < 0) e.target.value = 0;
          if (value > 59) e.target.value = 59;
        });
      }

      // Global keyboard shortcuts
      document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
      
      // Toast click to dismiss
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('toast-close')) {
          this.dismissToast(e.target.closest('.toast'));
        }
      });

      // Prevent context menu on timer displays for cleaner mobile experience
      document.querySelectorAll('.digital-time, .stopwatch-time, .timer-time, .pomodoro-time, .focus-time').forEach(el => {
        el.addEventListener('contextmenu', (e) => e.preventDefault());
      });

    } catch (error) {
      console.error('Event listener setup error:', error);
      this.handleError('Failed to setup event listeners', error);
    }
  }

  handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    
    try {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (this.focus.active) {
            this.toggleFocusPause();
          } else if (this.currentView === 'stopwatch') {
            this.toggleStopwatch();
          } else if (this.currentView === 'timer') {
            this.toggleTimer();
          } else if (this.currentView === 'pomodoro') {
            this.togglePomodoro();
          }
          break;
          
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with page refresh
          e.preventDefault();
          if (this.currentView === 'stopwatch') {
            this.resetStopwatch();
          } else if (this.currentView === 'timer') {
            this.resetTimer();
          } else if (this.currentView === 'pomodoro') {
            this.resetPomodoro();
          }
          break;
          
        case 'KeyL':
          if (this.currentView === 'stopwatch') {
            e.preventDefault();
            this.addLap();
          }
          break;
          
        case 'KeyF':
          e.preventDefault();
          this.startFocusSession(25 * 60); // Quick focus
          break;
          
        case 'Escape':
          e.preventDefault();
          if (this.focus.active) {
            this.exitFocusMode();
          } else if (!document.getElementById('keyboardHelp').classList.contains('hidden')) {
            this.hideKeyboardHelp();
          }
          break;
          
        case 'Slash':
          if (e.shiftKey) { // ? key
            e.preventDefault();
            this.showKeyboardHelp();
          }
          break;
          
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          if (e.ctrlKey || e.metaKey || e.altKey) return; // Don't interfere with browser shortcuts
          const views = ['clock', 'stopwatch', 'timer', 'pomodoro', 'world', 'alarms', 'settings', 'statistics', 'focus'];
          const index = parseInt(e.code.slice(-1)) - 1;
          if (views[index]) {
            e.preventDefault();
            this.switchView(views[index]);
          }
          break;
      }
    } catch (error) {
      console.error('Keyboard shortcut error:', error);
    }
  }

  // ===== NAVIGATION ===== //
  switchView(view) {
    // Update active navigation
    document.querySelectorAll('.nav-pill').forEach(pill => {
      pill.classList.remove('active');
      pill.setAttribute('aria-selected', 'false');
    });
    
    const activeTab = document.querySelector(`[data-view="${view}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
    }

    // Hide all views
    document.querySelectorAll('.view-container').forEach(container => {
      container.classList.remove('active');
      container.classList.add('hidden');
    });

    // Show selected view
    const targetView = document.getElementById(`${view}View`);
    if (targetView) {
      targetView.classList.remove('hidden');
      targetView.classList.add('active');
      this.currentView = view;

      // Initialize view-specific content
      if (view === 'world') {
        this.updateWorldClocks();
      } else if (view === 'alarms') {
        this.renderAlarms();
      } else if (view === 'statistics') {
        this.updateStatisticsDisplay();
        this.renderStatisticsCharts();
      } else if (view === 'focus') {
        this.updateFocusDisplay();
      }
    }
  }

  // ===== THEME SYSTEM ===== //
  changeTheme(theme) {
    this.settings.theme = theme;
    this.applyTheme();
    this.saveSettings();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
  }

  // ===== ADVANCED SETTINGS ===== //
  updateAdvancedSettings() {
    const themeSelector = document.getElementById('themeSelector');
    const workDuration = document.getElementById('workDuration');
    const shortBreakDuration = document.getElementById('shortBreakDuration');
    const longBreakDuration = document.getElementById('longBreakDuration');
    const sessionsUntilLongBreak = document.getElementById('sessionsUntilLongBreak');
    const toggleFullscreen = document.getElementById('toggleFullscreen');
    const toggleBreakReminders = document.getElementById('toggleBreakReminders');
    const toggleProgressSounds = document.getElementById('toggleProgressSounds');

    if (themeSelector) themeSelector.value = this.settings.theme;
    if (workDuration) workDuration.value = this.settings.workDuration;
    if (shortBreakDuration) shortBreakDuration.value = this.settings.shortBreakDuration;
    if (longBreakDuration) longBreakDuration.value = this.settings.longBreakDuration;
    if (sessionsUntilLongBreak) sessionsUntilLongBreak.value = this.settings.sessionsUntilLongBreak;
    
    if (toggleFullscreen) {
      toggleFullscreen.classList.toggle('active', this.settings.fullscreenMode);
      toggleFullscreen.setAttribute('aria-checked', this.settings.fullscreenMode.toString());
    }
    
    if (toggleBreakReminders) {
      toggleBreakReminders.classList.toggle('active', this.settings.breakReminders);
      toggleBreakReminders.setAttribute('aria-checked', this.settings.breakReminders.toString());
    }
    
    if (toggleProgressSounds) {
      toggleProgressSounds.classList.toggle('active', this.settings.progressSounds);
      toggleProgressSounds.setAttribute('aria-checked', this.settings.progressSounds.toString());
    }
  }

  updatePomodoroSetting(setting, value) {
    this.settings[setting] = value;
    this.saveSettings();
    
    // Update current pomodoro if not running
    if (!this.pomodoro.running) {
      this.resetPomodoro();
    }
  }

  toggleFullscreen() {
    this.settings.fullscreenMode = !this.settings.fullscreenMode;
    this.saveSettings();
    this.updateAdvancedSettings();
  }

  toggleBreakReminders() {
    this.settings.breakReminders = !this.settings.breakReminders;
    this.saveSettings();
    this.updateAdvancedSettings();
  }

  toggleProgressSounds() {
    this.settings.progressSounds = !this.settings.progressSounds;
    this.saveSettings();
    this.updateAdvancedSettings();
  }

  // ===== STATISTICS SYSTEM ===== //
  logSession(type, duration, completed = true) {
    const session = {
      id: Date.now(),
      type: type, // 'stopwatch', 'timer', 'pomodoro', 'focus'
      duration: duration, // in seconds
      completed: completed,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    this.statistics.sessionHistory.unshift(session);
    
    // Keep only last 100 sessions
    if (this.statistics.sessionHistory.length > 100) {
      this.statistics.sessionHistory = this.statistics.sessionHistory.slice(0, 100);
    }

    // Update today's sessions
    const today = new Date().toDateString();
    this.statistics.sessionsToday = this.statistics.sessionHistory.filter(s => s.date === today);
    
    // Calculate total time today
    this.statistics.totalTimeToday = this.statistics.sessionsToday
      .filter(s => s.completed)
      .reduce((total, session) => total + session.duration, 0);

    this.saveStatistics();
  }

  updateStatistics() {
    // Update daily streak
    const today = new Date().toDateString();
    const hasSessionToday = this.statistics.sessionHistory.some(s => 
      s.date === today && s.completed && s.duration >= 300 // At least 5 minutes
    );

    if (hasSessionToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const hasSessionYesterday = this.statistics.sessionHistory.some(s => 
        s.date === yesterdayStr && s.completed && s.duration >= 300
      );

      if (this.statistics.currentStreak === 0 || hasSessionYesterday) {
        // Continue or start streak
        if (this.statistics.lastStreakDate !== today) {
          this.statistics.currentStreak = hasSessionYesterday ? this.statistics.currentStreak + 1 : 1;
          this.statistics.lastStreakDate = today;
        }
      }
    }
  }

  updateStatisticsDisplay() {
    const totalTimeElement = document.getElementById('totalTimeToday');
    const streakElement = document.getElementById('currentStreak');
    const pomodoroCountElement = document.getElementById('pomodoroCount');
    const weeklyAverageElement = document.getElementById('weeklyAverage');

    if (totalTimeElement) {
      totalTimeElement.textContent = this.formatDuration(this.statistics.totalTimeToday);
    }

    if (streakElement) {
      streakElement.textContent = this.statistics.currentStreak.toString();
    }

    if (pomodoroCountElement) {
      const pomodoroToday = this.statistics.sessionsToday.filter(s => s.type === 'pomodoro' && s.completed).length;
      pomodoroCountElement.textContent = pomodoroToday.toString();
    }

    if (weeklyAverageElement) {
      const weeklyAverage = this.calculateWeeklyAverage();
      weeklyAverageElement.textContent = this.formatDuration(weeklyAverage);
    }

    this.renderSessionHistory();
  }

  calculateWeeklyAverage() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekSessions = this.statistics.sessionHistory.filter(s => 
      new Date(s.timestamp) >= oneWeekAgo && s.completed
    );

    const totalTime = weekSessions.reduce((total, session) => total + session.duration, 0);
    return Math.round(totalTime / 7);
  }

  renderSessionHistory() {
    const container = document.getElementById('sessionHistory');
    if (!container) return;

    const recentSessions = this.statistics.sessionHistory.slice(0, 10);
    
    if (recentSessions.length === 0) {
      container.innerHTML = '<div class="session-item">No sessions recorded yet. Start a timer to see your activity!</div>';
      return;
    }

    container.innerHTML = '';
    
    recentSessions.forEach(session => {
      const sessionElement = document.createElement('div');
      sessionElement.className = 'session-item';
      
      const typeIcons = {
        stopwatch: 'fa-stopwatch',
        timer: 'fa-hourglass-half',
        pomodoro: 'fa-coffee',
        focus: 'fa-eye'
      };

      const timeAgo = this.getTimeAgo(new Date(session.timestamp));
      
      sessionElement.innerHTML = `
        <div class="session-type">
          <i class="fas ${typeIcons[session.type] || 'fa-clock'}"></i>
          <span>${session.type.charAt(0).toUpperCase() + session.type.slice(1)}</span>
        </div>
        <div class="session-duration">${this.formatDuration(session.duration)}</div>
        <div class="session-time">${timeAgo}</div>
      `;
      
      container.appendChild(sessionElement);
    });
  }

  renderStatisticsCharts() {
    // This would integrate with Chart.js for beautiful visualizations
    // For now, we'll create simple visual representations
    this.createWeeklyChart();
    this.createDistributionChart();
  }

  createWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get last 7 days data
    const weekData = this.getWeeklyData();
    const maxTime = Math.max(...weekData.map(d => d.time), 1);

    // Draw bars
    const barWidth = width / 7 * 0.8;
    const spacing = width / 7 * 0.2;

    weekData.forEach((day, index) => {
      const barHeight = (day.time / maxTime) * (height - 40);
      const x = index * (barWidth + spacing) + spacing / 2;
      const y = height - barHeight - 20;

      // Draw bar
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, x + barWidth / 2, height - 5);
    });
  }

  createDistributionChart() {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const sessionTypes = ['timer', 'pomodoro', 'focus', 'stopwatch'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    
    const data = sessionTypes.map(type => {
      const sessions = this.statistics.sessionHistory.filter(s => s.type === type && s.completed);
      return sessions.reduce((total, session) => total + session.duration, 0);
    });

    const total = data.reduce((sum, value) => sum + value, 0);
    if (total === 0) return;

    // Draw pie chart
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    let currentAngle = -Math.PI / 2;

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      // Add label if slice is large enough
      if (sliceAngle > 0.1) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(sessionTypes[index], labelX, labelY);
      }

      currentAngle += sliceAngle;
    });
  }

  // ===== FOCUS MODE FUNCTIONS ===== //
  startFocusSession(duration) {
    this.focus.active = true;
    this.focus.time = duration;
    this.focus.total = duration;
    
    this.showFocusOverlay();
    this.updateFocusDisplay();
    
    this.focus.interval = setInterval(() => {
      this.focus.time--;
      this.updateFocusDisplay();
      
      if (this.focus.time <= 0) {
        this.completeFocusSession();
      }
    }, 1000);

    // Enter fullscreen if enabled
    if (this.settings.fullscreenMode) {
      this.requestFullscreen();
    }

    // Log session start
    this.logSession('focus', 0, false);
  }

  showFocusOverlay() {
    const overlay = document.getElementById('focusOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      this.updateFocusTip();
    }
  }

  updateFocusDisplay() {
    const timeElement = document.getElementById('focusTime');
    const progressBar = document.getElementById('focusProgressBar');
    const statusElement = document.getElementById('focusStatus');
    
    if (timeElement) {
      timeElement.textContent = this.formatTimerTime(this.focus.time);
    }
    
    if (progressBar && this.focus.total > 0) {
      const progress = ((this.focus.total - this.focus.time) / this.focus.total) * 100;
      progressBar.style.width = `${progress}%`;
    }
    
    if (statusElement) {
      const remainingTime = this.formatTimerTime(this.focus.time);
      statusElement.textContent = `Focus Session - ${remainingTime} remaining`;
    }
  }

  updateFocusTip() {
    const tipElement = document.getElementById('focusTip');
    if (tipElement) {
      const randomTip = this.focusTips[Math.floor(Math.random() * this.focusTips.length)];
      tipElement.textContent = randomTip;
    }
  }

  pauseFocusSession() {
    if (this.focus.interval) {
      clearInterval(this.focus.interval);
      this.focus.interval = null;
      
      const pauseBtn = document.getElementById('pauseFocusSession');
      if (pauseBtn) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
        pauseBtn.onclick = () => this.resumeFocusSession();
      }
    }
  }

  resumeFocusSession() {
    this.focus.interval = setInterval(() => {
      this.focus.time--;
      this.updateFocusDisplay();
      
      if (this.focus.time <= 0) {
        this.completeFocusSession();
      }
    }, 1000);

    const pauseBtn = document.getElementById('pauseFocusSession');
    if (pauseBtn) {
      pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
      pauseBtn.onclick = () => this.pauseFocusSession();
    }
  }

  completeFocusSession() {
    const completedDuration = this.focus.total;
    this.endFocusSession();
    
    // Log completed session
    this.logSession('focus', completedDuration, true);
    
    this.playNotificationSound();
    this.showNotification('Focus Session Complete!', `Great job! You focused for ${this.formatDuration(completedDuration)}.`);
    
    // Show break reminder if enabled
    if (this.settings.breakReminders) {
      const breakDuration = Math.min(Math.round(completedDuration / 5), 900); // 1/5 of focus time, max 15 min
      this.showNotification('Break Time!', `Take a ${Math.round(breakDuration / 60)} minute break to recharge.`);
    }
  }

  endFocusSession() {
    this.focus.active = false;
    
    if (this.focus.interval) {
      clearInterval(this.focus.interval);
      this.focus.interval = null;
    }
    
    this.exitFocusMode();
  }

  exitFocusMode() {
    const overlay = document.getElementById('focusOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    
    // Exit fullscreen if it was enabled
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    this.focus.active = false;
    
    if (this.focus.interval) {
      clearInterval(this.focus.interval);
      this.focus.interval = null;
    }
  }

  requestFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {});
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  // ===== DATA MANAGEMENT ===== //
  exportData() {
    const exportData = {
      settings: this.settings,
      alarms: this.alarms,
      statistics: this.statistics,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `plank-time-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showNotification('Data Exported', 'Your Plank Time data has been exported successfully.');
  }

  importData() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data
        if (!importData.version || !importData.settings) {
          throw new Error('Invalid backup file format');
        }

        // Confirm import
        if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
          // Import settings
          this.settings = { ...this.settings, ...importData.settings };
          
          // Import alarms
          if (importData.alarms) {
            this.alarms = importData.alarms;
          }
          
          // Import statistics
          if (importData.statistics) {
            this.statistics = { ...this.statistics, ...importData.statistics };
          }

          // Save all data
          this.saveSettings();
          this.saveAlarms();
          this.saveStatistics();
          
          // Update displays
          this.updateSettingsDisplay();
          this.updateAdvancedSettings();
          this.applyTheme();
          this.renderAlarms();
          
          this.showNotification('Data Imported', 'Your Plank Time data has been imported successfully.');
        }
      } catch (error) {
        console.error('Import error:', error);
        this.showNotification('Import Failed', 'There was an error importing your data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }

  clearAllData() {
    if (confirm('This will permanently delete all your data including settings, alarms, and statistics. This cannot be undone. Are you sure?')) {
      if (confirm('Are you absolutely sure? This action cannot be reversed.')) {
        // Clear all localStorage
        localStorage.removeItem('plankTimeSettings');
        localStorage.removeItem('plankTimeAlarms');
        localStorage.removeItem('plankTimeStatistics');
        
        this.showNotification('Data Cleared', 'All data has been cleared. The page will reload.');
        
        // Reload page after a delay
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    }
  }

  // ===== ENHANCED UTILITY FUNCTIONS ===== //
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // ===== FOCUS VIEW DISPLAY ===== //
  updateFocusDisplay() {
    // This method is used for both the focus view setup and the overlay
    // Update any focus-related UI elements
  }

  // ===== ENHANCED STORAGE FUNCTIONS ===== //
  saveStatistics() {
    localStorage.setItem('plankTimeStatistics', JSON.stringify(this.statistics));
  }

  loadStatistics() {
    const saved = localStorage.getItem('plankTimeStatistics');
    if (saved) {
      this.statistics = { ...this.statistics, ...JSON.parse(saved) };
    }
  }

  // ===== ENHANCED SETTINGS STORAGE ===== //
  saveSettings() {
    localStorage.setItem('plankTimeSettings', JSON.stringify(this.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('plankTimeSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
      this.updateSettingsDisplay();
      this.updateAdvancedSettings();
    }
  }

  saveAlarms() {
    localStorage.setItem('plankTimeAlarms', JSON.stringify(this.alarms));
  }

  loadAlarms() {
    const saved = localStorage.getItem('plankTimeAlarms');
    if (saved) {
      this.alarms = JSON.parse(saved);
    }
  }

  // ===== MAIN CLOCK FUNCTIONS ===== //
  startMainClock() {
    this.updateMainClock();
  }

  updateMainClock() {
    const now = new Date();
    
    // Update header time
    const headerTime = this.formatTime(now);
    document.getElementById('headerTime').textContent = headerTime;

    // Update digital clock
    document.getElementById('digitalTime').textContent = headerTime;
    
    // Update digital date
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    document.getElementById('digitalDate').textContent = now.toLocaleDateString('en-US', dateOptions);
  }

  updateAnalogClock() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Calculate angles
    const hourAngle = (hours * 30) + (minutes * 0.5) - 90;
    const minuteAngle = (minutes * 6) - 90;
    const secondAngle = (seconds * 6) - 90;

    // Update hour hand
    const hourHand = document.querySelector('.hour-hand');
    if (hourHand) {
      const hourX = 100 + 50 * Math.cos(hourAngle * Math.PI / 180);
      const hourY = 100 + 50 * Math.sin(hourAngle * Math.PI / 180);
      hourHand.setAttribute('x2', hourX);
      hourHand.setAttribute('y2', hourY);
    }

    // Update minute hand
    const minuteHand = document.querySelector('.minute-hand');
    if (minuteHand) {
      const minuteX = 100 + 70 * Math.cos(minuteAngle * Math.PI / 180);
      const minuteY = 100 + 70 * Math.sin(minuteAngle * Math.PI / 180);
      minuteHand.setAttribute('x2', minuteX);
      minuteHand.setAttribute('y2', minuteY);
    }

    // Update second hand
    const secondHand = document.querySelector('.second-hand');
    if (secondHand) {
      const secondX = 100 + 80 * Math.cos(secondAngle * Math.PI / 180);
      const secondY = 100 + 80 * Math.sin(secondAngle * Math.PI / 180);
      secondHand.setAttribute('x2', secondX);
      secondHand.setAttribute('y2', secondY);
    }

    // Create hour markers if they don't exist
    const markersContainer = document.querySelector('.hour-markers');
    if (markersContainer && markersContainer.children.length === 0) {
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 100 + 85 * Math.cos(angle);
        const y1 = 100 + 85 * Math.sin(angle);
        const x2 = 100 + 75 * Math.cos(angle);
        const y2 = 100 + 75 * Math.sin(angle);
        
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        marker.setAttribute('x1', x1);
        marker.setAttribute('y1', y1);
        marker.setAttribute('x2', x2);
        marker.setAttribute('y2', y2);
        marker.setAttribute('stroke', 'rgba(255,255,255,0.5)');
        marker.setAttribute('stroke-width', '2');
        
        markersContainer.appendChild(marker);
      }
    }
  }

  // ===== STOPWATCH FUNCTIONS ===== //
  toggleStopwatch() {
    if (this.stopwatch.running) {
      this.pauseStopwatch();
    } else {
      this.startStopwatch();
    }
  }

  startStopwatch() {
    this.stopwatch.running = true;
    const startTime = Date.now() - this.stopwatch.time;
    
    this.stopwatch.interval = setInterval(() => {
      this.stopwatch.time = Date.now() - startTime;
      this.updateStopwatchDisplay();
    }, 10);

    this.updateStopwatchControls();
  }

  pauseStopwatch() {
    this.stopwatch.running = false;
    clearInterval(this.stopwatch.interval);
    this.updateStopwatchControls();
  }

  resetStopwatch() {
    const wasRunning = this.stopwatch.running;
    const duration = Math.floor(this.stopwatch.time / 1000);
    
    this.stopwatch.running = false;
    this.stopwatch.time = 0;
    this.stopwatch.laps = [];
    clearInterval(this.stopwatch.interval);
    this.updateStopwatchDisplay();
    this.updateStopwatchControls();
    this.renderLaps();
    
    // Log session if it was meaningful (at least 30 seconds)
    if (wasRunning && duration >= 30) {
      this.logSession('stopwatch', duration, true);
    }
  }

  addLap() {
    if (this.stopwatch.running) {
      this.stopwatch.laps.push(this.stopwatch.time);
      this.renderLaps();
    }
  }

  updateStopwatchDisplay() {
    const time = this.formatStopwatchTime(this.stopwatch.time);
    document.getElementById('stopwatchTime').textContent = time;
    
    if (this.stopwatch.running) {
      document.getElementById('stopwatchTime').classList.add('running');
    } else {
      document.getElementById('stopwatchTime').classList.remove('running');
    }
  }

  updateStopwatchControls() {
    const toggleBtn = document.getElementById('stopwatchToggle');
    const lapBtn = document.getElementById('stopwatchLap');
    
    if (!toggleBtn || !lapBtn) return;
    
    if (this.stopwatch.running) {
      toggleBtn.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i><span>Pause</span>';
      toggleBtn.className = 'control-btn pause-btn';
      lapBtn.disabled = false;
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i><span>Start</span>';
      toggleBtn.className = 'control-btn start-btn';
      lapBtn.disabled = true;
    }
  }

  renderLaps() {
    const lapContainer = document.getElementById('lapTimes');
    const lapList = document.getElementById('lapList');
    
    if (this.stopwatch.laps.length > 0) {
      lapContainer.classList.remove('hidden');
      lapList.innerHTML = '';
      
      this.stopwatch.laps.forEach((lap, index) => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.setAttribute('role', 'listitem');
        lapItem.innerHTML = `
          <span class="lap-number">Lap ${index + 1}</span>
          <span class="lap-time">${this.formatStopwatchTime(lap)}</span>
        `;
        lapList.appendChild(lapItem);
      });
    } else {
      lapContainer.classList.add('hidden');
    }
  }

  // ===== TIMER FUNCTIONS ===== //
  toggleTimer() {
    if (this.timer.running) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timer.time === 0) {
      const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
      const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
      this.timer.time = minutes * 60 + seconds;
      this.timer.total = this.timer.time;
    }

    if (this.timer.time > 0) {
      this.timer.running = true;
      
      this.timer.interval = setInterval(() => {
        this.timer.time--;
        this.updateTimerDisplay();
        
        if (this.timer.time <= 0) {
          this.timerComplete();
        }
      }, 1000);

      this.updateTimerControls();
      this.showTimerProgress();
    }
  }

  pauseTimer() {
    this.timer.running = false;
    clearInterval(this.timer.interval);
    this.updateTimerControls();
  }

  resetTimer() {
    this.timer.running = false;
    this.timer.time = 0;
    this.timer.total = 0;
    clearInterval(this.timer.interval);
    this.updateTimerDisplay();
    this.updateTimerControls();
    this.hideTimerProgress();
  }

  timerComplete() {
    const completedDuration = this.timer.total;
    this.timer.running = false;
    this.timer.time = 0;
    clearInterval(this.timer.interval);
    this.updateTimerDisplay();
    this.updateTimerControls();
    this.playNotificationSound();
    this.showNotification('Timer Complete!', 'Your timer has finished.');
    
    // Log completed session
    this.logSession('timer', completedDuration, true);
  }

  updateTimerDisplay() {
    const time = this.formatTimerTime(this.timer.time);
    const timerTimeElement = document.getElementById('timerTime');
    if (timerTimeElement) {
      timerTimeElement.textContent = time;
    }
    
    // Update progress circle and ARIA attributes
    if (this.timer.total > 0) {
      const progress = (this.timer.total - this.timer.time) / this.timer.total;
      const progressPercent = Math.round(progress * 100);
      const circumference = 2 * Math.PI * 54;
      const offset = circumference * (1 - progress);
      
      const circle = document.getElementById('progressCircle');
      const progressRing = document.getElementById('timerProgress');
      
      if (circle) {
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
      }
      
      if (progressRing) {
        progressRing.setAttribute('aria-valuenow', progressPercent.toString());
        progressRing.setAttribute('aria-valuetext', `${progressPercent}% complete`);
      }
    }
  }

  updateTimerControls() {
    const toggleBtn = document.getElementById('timerToggle');
    const setupDiv = document.getElementById('timerSetup');
    
    if (this.timer.running) {
      toggleBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
      toggleBtn.className = 'control-btn pause-btn';
      setupDiv.style.display = 'none';
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
      toggleBtn.className = 'control-btn start-btn';
      
      if (this.timer.time === 0) {
        setupDiv.style.display = 'block';
      }
    }
  }

  showTimerProgress() {
    document.getElementById('timerProgress').classList.remove('hidden');
  }

  hideTimerProgress() {
    document.getElementById('timerProgress').classList.add('hidden');
  }

  // ===== POMODORO FUNCTIONS ===== //
  togglePomodoro() {
    if (this.pomodoro.running) {
      this.pausePomodoro();
    } else {
      this.startPomodoro();
    }
  }

  startPomodoro() {
    this.pomodoro.running = true;
    
    this.pomodoro.interval = setInterval(() => {
      this.pomodoro.time--;
      this.updatePomodoroDisplay();
      
      if (this.pomodoro.time <= 0) {
        this.pomodoroComplete();
      }
    }, 1000);

    this.updatePomodoroControls();
  }

  pausePomodoro() {
    this.pomodoro.running = false;
    clearInterval(this.pomodoro.interval);
    this.updatePomodoroControls();
  }

  resetPomodoro() {
    this.pomodoro.running = false;
    clearInterval(this.pomodoro.interval);
    
    const times = { 
      work: this.settings.workDuration * 60, 
      short: this.settings.shortBreakDuration * 60, 
      long: this.settings.longBreakDuration * 60 
    };
    this.pomodoro.time = times[this.pomodoro.mode];
    
    this.updatePomodoroDisplay();
    this.updatePomodoroControls();
  }

  pomodoroComplete() {
    const completedDuration = this.pomodoro.mode === 'work' ? this.settings.workDuration * 60 : 
                             this.pomodoro.mode === 'short' ? this.settings.shortBreakDuration * 60 : 
                             this.settings.longBreakDuration * 60;
    
    this.pomodoro.running = false;
    clearInterval(this.pomodoro.interval);
    
    this.playNotificationSound();
    
    if (this.pomodoro.mode === 'work') {
      this.pomodoro.sessions++;
      const nextMode = this.pomodoro.sessions % this.settings.sessionsUntilLongBreak === 0 ? 'long' : 'short';
      this.setPomodoroMode(nextMode);
      this.showNotification('Work Session Complete!', 'Time for a break.');
      
      // Log completed work session
      this.logSession('pomodoro', completedDuration, true);
    } else {
      this.setPomodoroMode('work');
      this.showNotification('Break Complete!', 'Time to get back to work.');
      
      // Log completed break (but don't count towards productivity stats)
      this.logSession('break', completedDuration, true);
    }
    
    this.updatePomodoroDisplay();
    this.updatePomodoroControls();
  }

  setPomodoroMode(mode) {
    this.pomodoro.mode = mode;
    const times = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    this.pomodoro.time = times[mode];
    this.pomodoro.running = false;
    clearInterval(this.pomodoro.interval);
    
    // Update mode buttons with proper ARIA attributes
    document.querySelectorAll('.mode-btn').forEach(btn => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive.toString());
    });
    
    this.updatePomodoroDisplay();
    this.updatePomodoroControls();
  }

  updatePomodoroDisplay() {
    const time = this.formatTimerTime(this.pomodoro.time);
    document.getElementById('pomodoroTime').textContent = time;
    
    const modeElement = document.getElementById('pomodoroMode');
    const modeText = {
      work: 'Work Session',
      short: 'Short Break',
      long: 'Long Break'
    };
    
    modeElement.textContent = modeText[this.pomodoro.mode];
    modeElement.className = `pomodoro-mode ${this.pomodoro.mode === 'work' ? '' : 'break'}`;
    
    document.getElementById('pomodoroSessions').textContent = this.pomodoro.sessions;
  }

  updatePomodoroControls() {
    const toggleBtn = document.getElementById('pomodoroToggle');
    
    if (this.pomodoro.running) {
      toggleBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
      toggleBtn.className = 'control-btn pause-btn';
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
      toggleBtn.className = 'control-btn start-btn';
    }
  }

  // ===== WORLD CLOCK FUNCTIONS ===== //
  updateWorldClocks() {
    const container = document.getElementById('worldClockGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.worldTimezones.forEach(clock => {
      const now = new Date();
      try {
        const timeInZone = now.toLocaleString('en-US', {
          timeZone: clock.timezone,
          hour12: !this.settings.is24Hour,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        });
        
        const clockCard = document.createElement('div');
        clockCard.className = 'world-clock-card';
        clockCard.setAttribute('role', 'listitem');
        clockCard.innerHTML = `
          <div class="world-clock-label">${clock.label}</div>
          <div class="world-clock-time" aria-label="Time in ${clock.label}: ${timeInZone}">${timeInZone}</div>
          <div class="world-clock-timezone">${clock.timezone.replace('_', ' ')}</div>
        `;
        
        container.appendChild(clockCard);
      } catch (error) {
        console.warn(`Failed to get time for timezone ${clock.timezone}:`, error);
      }
    });
  }

  // ===== ALARM FUNCTIONS ===== //
  addAlarm() {
    const timeInput = document.getElementById('newAlarmTime');
    const labelInput = document.getElementById('newAlarmLabel');
    
    if (!timeInput || !timeInput.value) {
      this.showNotification('Error', 'Please select a time for the alarm.');
      return;
    }
    
    // Check for duplicate alarms
    const isDuplicate = this.alarms.some(alarm => alarm.time === timeInput.value);
    if (isDuplicate) {
      this.showNotification('Error', 'An alarm already exists for this time.');
      return;
    }
    
    const alarm = {
      id: Date.now(),
      time: timeInput.value,
      label: labelInput?.value || 'Alarm',
      enabled: true
    };
    
    this.alarms.push(alarm);
    this.saveAlarms();
    this.renderAlarms();
    
    // Reset inputs
    timeInput.value = '09:00';
    if (labelInput) labelInput.value = '';
    
    // Announce to screen readers
    this.showNotification('Success', `Alarm set for ${alarm.time}`);
  }

  toggleAlarm(id) {
    const alarm = this.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
      this.saveAlarms();
      this.renderAlarms();
    }
  }

  deleteAlarm(id) {
    this.alarms = this.alarms.filter(a => a.id !== id);
    this.saveAlarms();
    this.renderAlarms();
  }

  renderAlarms() {
    const container = document.getElementById('alarmsList');
    if (!container) return;
    
    if (this.alarms.length === 0) {
      container.innerHTML = '<div class="alarm-empty" role="status">No alarms set. Add one above to get started!</div>';
      return;
    }
    
    container.innerHTML = '';
    
    this.alarms.forEach(alarm => {
      const alarmItem = document.createElement('div');
      alarmItem.className = 'alarm-item';
      alarmItem.setAttribute('role', 'listitem');
      alarmItem.innerHTML = `
        <div class="alarm-info">
          <div class="alarm-time" aria-label="Alarm time: ${alarm.time}">${alarm.time}</div>
          <div class="alarm-label">${alarm.label}</div>
        </div>
        <div class="alarm-controls">
          <button class="toggle-switch ${alarm.enabled ? 'active' : ''}" 
                  role="switch" 
                  aria-checked="${alarm.enabled}"
                  aria-label="Toggle alarm for ${alarm.time}"
                  onclick="app.toggleAlarm(${alarm.id})">
            <div class="toggle-slider"></div>
          </button>
          <button class="delete-btn" 
                  aria-label="Delete alarm for ${alarm.time}"
                  onclick="app.deleteAlarm(${alarm.id})">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      `;
      
      container.appendChild(alarmItem);
    });
  }

  checkAlarms() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    this.alarms.forEach(alarm => {
      if (alarm.enabled && alarm.time === currentTime) {
        this.playNotificationSound();
        this.showNotification('Alarm!', alarm.label);
      }
    });
  }

  // ===== SETTINGS FUNCTIONS ===== //
  toggle24Hour() {
    this.settings.is24Hour = !this.settings.is24Hour;
    this.saveSettings();
    this.updateSettingsDisplay();
    this.updateMainClock();
    this.updateWorldClocks();
  }

  toggleSound() {
    this.settings.soundEnabled = !this.settings.soundEnabled;
    this.saveSettings();
    this.updateSettingsDisplay();
  }

  toggleNotifications() {
    this.settings.notificationsEnabled = !this.settings.notificationsEnabled;
    this.saveSettings();
    this.updateSettingsDisplay();
    
    if (this.settings.notificationsEnabled) {
      this.requestNotificationPermission();
    }
  }

  updateSettingsDisplay() {
    const toggle24Hour = document.getElementById('toggle24Hour');
    const toggleSound = document.getElementById('toggleSound');
    const toggleNotifications = document.getElementById('toggleNotifications');
    
    if (toggle24Hour) {
      toggle24Hour.classList.toggle('active', this.settings.is24Hour);
      toggle24Hour.setAttribute('aria-checked', this.settings.is24Hour.toString());
    }
    
    if (toggleSound) {
      toggleSound.classList.toggle('active', this.settings.soundEnabled);
      toggleSound.setAttribute('aria-checked', this.settings.soundEnabled.toString());
    }
    
    if (toggleNotifications) {
      toggleNotifications.classList.toggle('active', this.settings.notificationsEnabled);
      toggleNotifications.setAttribute('aria-checked', this.settings.notificationsEnabled.toString());
    }
  }

  // ===== UTILITY FUNCTIONS ===== //
  formatTime(date) {
    if (this.settings.is24Hour) {
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  formatStopwatchTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  formatTimerTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  playNotificationSound() {
    if (this.settings.soundEnabled) {
      const audio = document.getElementById('notificationSound');
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Fallback to beep if audio fails
          if (typeof window !== 'undefined' && window.AudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          }
        });
      }
    }
  }

  showNotification(title, message) {
    if (this.settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { 
          body: message,
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDZDMTMuMTA1IDYgMTQgNi44OTUgMTQgOFYxMkMxNCA5My4xMDUgMTMuMTA1IDEyIDEyIDEySDhDNi44OTUgMTIgNiAxMS4xMDUgNiAxMFY4QzYgNi44OTUgNi44OTUgNiA4IDZIMTJaIiBmaWxsPSIjM0I4MkY2Ii8+Cjwvc3ZnPgo='
        });
      }
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ===== LOCAL STORAGE ===== //
  saveSettings() {
    localStorage.setItem('plankTimeSettings', JSON.stringify(this.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('plankTimeSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
      this.updateSettingsDisplay();
    }
  }

  saveAlarms() {
    localStorage.setItem('plankTimeAlarms', JSON.stringify(this.alarms));
  }

  loadAlarms() {
    const saved = localStorage.getItem('plankTimeAlarms');
    if (saved) {
      this.alarms = JSON.parse(saved);
    }
  }
}

// ===== INITIALIZE APPLICATION WITH ENHANCED ERROR HANDLING ===== //
let app;

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize app
    app = new PlankTime();
    
    // Make app globally available for inline event handlers
    window.app = app;
    
    // Enhanced style loading check
    const styleCheck = setTimeout(() => {
      const navPill = document.querySelector('.nav-pill');
      if (navPill && getComputedStyle(navPill).backdropFilter === 'none') {
        console.warn('🎨 Styles may not be fully loaded. Injecting critical CSS...');
        app.injectCriticalCSS();
      }
      clearTimeout(styleCheck);
    }, 1000);
    
    // Service Worker registration for PWA features
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    }
    
    // Install prompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install suggestion after 30 seconds
      setTimeout(() => {
        if (deferredPrompt && !localStorage.getItem('plankTimeInstallDismissed')) {
          app.showToast(
            'Install Plank Time', 
            'Add Plank Time to your home screen for the best experience!', 
            'info', 
            8000
          );
        }
      }, 30000);
    });
    
    console.log('🚀 Plank Time initialized successfully');
    
  } catch (error) {
    console.error('💥 Failed to initialize Plank Time:', error);
    
    // Enhanced fallback error handling
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      z-index: 9999;
      font-family: 'Inter', Arial, sans-serif;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      max-width: 400px;
      width: 90%;
    `;
    errorDiv.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
      <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">Application Error</h3>
      <p style="margin-bottom: 1.5rem; opacity: 0.9;">Plank Time failed to initialize properly. This might be due to browser compatibility or corrupted data.</p>
      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <button onclick="location.reload()" style="
          padding: 0.75rem 1.5rem; 
          border: none; 
          border-radius: 0.5rem; 
          cursor: pointer; 
          background: white; 
          color: #dc2626; 
          font-weight: 600;
          transition: all 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🔄 Reload Page
        </button>
        <button onclick="localStorage.clear(); location.reload();" style="
          padding: 0.75rem 1.5rem; 
          border: 1px solid white; 
          border-radius: 0.5rem; 
          cursor: pointer; 
          background: transparent; 
          color: white; 
          font-weight: 600;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
          🗑️ Reset Data
        </button>
      </div>
      <p style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.7;">
        Error: ${error.message || 'Unknown error occurred'}
      </p>
    `;
    document.body.appendChild(errorDiv);
    
    // Hide loading indicator if it exists
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
});

// ===== GLOBAL ERROR HANDLERS ===== //
window.addEventListener('error', (e) => {
  console.error('🚨 Global Error:', e.error);
  if (window.app) {
    window.app.handleError('Unexpected error occurred', e.error);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🚨 Unhandled Promise Rejection:', e.reason);
  if (window.app) {
    window.app.handleError('Promise rejection', e.reason);
  }
});

// ===== ENHANCED PERFORMANCE MONITORING ===== //
window.addEventListener('load', () => {
  if ('performance' in window) {
    const loadTime = performance.now();
    console.log(`⚡ Plank Time fully loaded in ${Math.round(loadTime)}ms`);
    
    // Log performance metrics
    setTimeout(() => {
      if (window.app) {
        console.log('📊 Performance Metrics:', {
          loadTime: Math.round(loadTime),
          memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A',
          errors: window.app.performanceMetrics?.errors || 0
        });
      }
    }, 2000);
  }
});

// ===== CRITICAL CSS INJECTION ===== //
PlankTime.prototype.injectCriticalCSS = function() {
  const criticalCSS = document.createElement('style');
  criticalCSS.innerHTML = `
    .view-container { display: none; }
    .view-container.active { display: block; }
    .glass-card { 
      background: rgba(255,255,255,0.1); 
      border: 1px solid rgba(255,255,255,0.2); 
      border-radius: 1rem; 
      padding: 2rem; 
      margin-bottom: 1rem;
      backdrop-filter: blur(10px);
    }
    .nav-pills { 
      background: rgba(255,255,255,0.1); 
      padding: 0.5rem; 
      border-radius: 1rem; 
      display: flex; 
      gap: 0.5rem; 
      flex-wrap: wrap;
    }
    .nav-pill.active { 
      background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
      color: white; 
    }
    .loading-indicator { display: none !important; }
  `;
  document.head.appendChild(criticalCSS);
  console.log('💉 Critical CSS injected');
};
