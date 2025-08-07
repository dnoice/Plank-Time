// ===== PLANK TIME - COMPLETE FUNCTIONALITY ===== //

class PlankTime {
  constructor() {
    // Application state
    this.currentView = 'clock';
    this.settings = {
      is24Hour: false,
      soundEnabled: true,
      notificationsEnabled: true
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
      time: 25 * 60, // 25 minutes in seconds
      mode: 'work', // work, short, long
      running: false,
      sessions: 0,
      interval: null
    };

    this.alarms = [];

    // World clock timezones
    this.worldTimezones = [
      { timezone: 'America/New_York', label: 'New York' },
      { timezone: 'Europe/London', label: 'London' },
      { timezone: 'Asia/Tokyo', label: 'Tokyo' },
      { timezone: 'Australia/Sydney', label: 'Sydney' }
    ];

    // Initialize the application
    this.init();
  }

  // ===== INITIALIZATION ===== //
  init() {
    this.loadSettings();
    this.loadAlarms();
    this.setupEventListeners();
    this.startMainClock();
    this.updateAnalogClock();
    this.updateWorldClocks();
    this.requestNotificationPermission();
    
    // Update clocks every second
    setInterval(() => {
      this.updateMainClock();
      this.updateAnalogClock();
      this.updateWorldClocks();
      this.checkAlarms();
    }, 1000);
  }

  // ===== EVENT LISTENERS ===== //
  setupEventListeners() {
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

    // Settings toggles
    const toggle24Hour = document.getElementById('toggle24Hour');
    const toggleSound = document.getElementById('toggleSound');
    const toggleNotifications = document.getElementById('toggleNotifications');
    
    if (toggle24Hour) toggle24Hour.addEventListener('click', () => this.toggle24Hour());
    if (toggleSound) toggleSound.addEventListener('click', () => this.toggleSound());
    if (toggleNotifications) toggleNotifications.addEventListener('click', () => this.toggleNotifications());

    // Settings actions
    const testSound = document.getElementById('testSound');
    const testNotification = document.getElementById('testNotification');
    
    if (testSound) testSound.addEventListener('click', () => this.playNotificationSound());
    if (testNotification) testNotification.addEventListener('click', () => this.showNotification('Test Notification', 'This is a test notification!'));

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
      container.classList.add('hidden');
    });

    // Show selected view
    const targetView = document.getElementById(`${view}View`);
    if (targetView) {
      targetView.classList.remove('hidden');
      this.currentView = view;

      // Initialize view-specific content
      if (view === 'world') {
        this.updateWorldClocks();
      } else if (view === 'alarms') {
        this.renderAlarms();
      }
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
    this.stopwatch.running = false;
    this.stopwatch.time = 0;
    this.stopwatch.laps = [];
    clearInterval(this.stopwatch.interval);
    this.updateStopwatchDisplay();
    this.updateStopwatchControls();
    this.renderLaps();
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
    
    if (this.stopwatch.running) {
      toggleBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
      toggleBtn.className = 'control-btn pause-btn';
      lapBtn.disabled = false;
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
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
    this.timer.running = false;
    this.timer.time = 0;
    clearInterval(this.timer.interval);
    this.updateTimerDisplay();
    this.updateTimerControls();
    this.playNotificationSound();
    this.showNotification('Timer Complete!', 'Your timer has finished.');
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
    
    const times = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    this.pomodoro.time = times[this.pomodoro.mode];
    
    this.updatePomodoroDisplay();
    this.updatePomodoroControls();
  }

  pomodoroComplete() {
    this.pomodoro.running = false;
    clearInterval(this.pomodoro.interval);
    
    this.playNotificationSound();
    
    if (this.pomodoro.mode === 'work') {
      this.pomodoro.sessions++;
      const nextMode = this.pomodoro.sessions % 4 === 0 ? 'long' : 'short';
      this.setPomodoroMode(nextMode);
      this.showNotification('Work Session Complete!', 'Time for a break.');
    } else {
      this.setPomodoroMode('work');
      this.showNotification('Break Complete!', 'Time to get back to work.');
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

// ===== INITIALIZE APPLICATION ===== //
let app;

document.addEventListener('DOMContentLoaded', () => {
  try {
    app = new PlankTime();
    
    // Make app globally available for inline event handlers
    window.app = app;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (app.currentView === 'stopwatch') {
            app.toggleStopwatch();
          } else if (app.currentView === 'timer') {
            app.toggleTimer();
          } else if (app.currentView === 'pomodoro') {
            app.togglePomodoro();
          }
          break;
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with page refresh
          e.preventDefault();
          if (app.currentView === 'stopwatch') {
            app.resetStopwatch();
          } else if (app.currentView === 'timer') {
            app.resetTimer();
          } else if (app.currentView === 'pomodoro') {
            app.resetPomodoro();
          }
          break;
        case 'KeyL':
          if (app.currentView === 'stopwatch') {
            e.preventDefault();
            app.addLap();
          }
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
          if (e.ctrlKey || e.metaKey || e.altKey) return; // Don't interfere with browser shortcuts
          const views = ['clock', 'stopwatch', 'timer', 'pomodoro', 'world', 'alarms', 'settings'];
          const index = parseInt(e.code.slice(-1)) - 1;
          if (views[index]) {
            e.preventDefault();
            app.switchView(views[index]);
          }
          break;
      }
    });
    
    console.log('Plank Time initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Plank Time:', error);
    
    // Show fallback error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(239, 68, 68, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <h3>Application Error</h3>
      <p>Plank Time failed to initialize. Please refresh the page.</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; border: none; border-radius: 5px; cursor: pointer;">
        Refresh Page
      </button>
    `;
    document.body.appendChild(errorDiv);
  }
});
