/*
File: js/script.js
Project: Plank Time
Description: Complete JavaScript functionality for the ultimate time management app
Author: Dennis Smaltz
Acknowledgment: Claude Sonnet 4
Created: August 2025
Features: Clock, Stopwatch, Timer, World Clock, Alarms, Pomodoro, Settings
Dependencies: Web APIs (Notification, Audio, Storage)
*/

// ===== GLOBAL STATE & CONFIGURATION =====
const PlankTime = {
    // Current tab
    currentTab: 'clock',
    
    // Clock settings
    clock: {
        mode: 'digital', // 'digital' or 'analog'
        format24: false,
        intervalId: null
    },
    
    // Stopwatch state
    stopwatch: {
        startTime: 0,
        elapsedTime: 0,
        isRunning: false,
        intervalId: null,
        lapTimes: []
    },
    
    // Timer state
    timer: {
        duration: 300, // 5 minutes default
        remaining: 300,
        isRunning: false,
        intervalId: null
    },
    
    // World clocks
    worldClocks: [
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'London', timezone: 'Europe/London' },
        { city: 'Tokyo', timezone: 'Asia/Tokyo' }
    ],
    
    // Alarms
    alarms: [],
    
    // Pomodoro state
    pomodoro: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        currentSession: 1,
        totalSessions: 4,
        isWorking: true,
        remaining: 25 * 60,
        isRunning: false,
        intervalId: null
    },
    
    // Settings
    settings: {
        theme: 'dark',
        accentColor: '#4CAF50',
        soundEnabled: true,
        notificationsEnabled: true
    }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Format time for display
    formatTime: (seconds, includeMs = false) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        if (hours > 0) {
            return includeMs 
                ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
                : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return includeMs 
            ? `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
            : `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format time for timer display
    formatTimerTime: (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Play notification sound
    playSound: () => {
        if (!PlankTime.settings.soundEnabled) return;
        
        // Create audio context and play beep
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    },
    
    // Show notification
    showNotification: (title, body, icon = null) => {
        if (!PlankTime.settings.notificationsEnabled) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon || '/favicon.ico',
                tag: 'planktime'
            });
        }
    },
    
    // Request notification permission
    requestNotificationPermission: async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            PlankTime.settings.notificationsEnabled = permission === 'granted';
        }
    },
    
    // Save settings to localStorage
    saveSettings: () => {
        localStorage.setItem('planktime-settings', JSON.stringify(PlankTime.settings));
        localStorage.setItem('planktime-alarms', JSON.stringify(PlankTime.alarms));
        localStorage.setItem('planktime-worldclocks', JSON.stringify(PlankTime.worldClocks));
    },
    
    // Load settings from localStorage
    loadSettings: () => {
        const settings = localStorage.getItem('planktime-settings');
        const alarms = localStorage.getItem('planktime-alarms');
        const worldClocks = localStorage.getItem('planktime-worldclocks');
        
        if (settings) {
            PlankTime.settings = { ...PlankTime.settings, ...JSON.parse(settings) };
        }
        
        if (alarms) {
            PlankTime.alarms = JSON.parse(alarms);
        }
        
        if (worldClocks) {
            PlankTime.worldClocks = JSON.parse(worldClocks);
        }
    }
};

// ===== CLOCK MODULE =====
const Clock = {
    init: () => {
        Clock.update();
        PlankTime.clock.intervalId = setInterval(Clock.update, 1000);
        
        // Event listeners
        document.getElementById('toggleClockMode').addEventListener('click', Clock.toggleMode);
        document.getElementById('toggle24Hour').addEventListener('click', Clock.toggle24Hour);
    },
    
    update: () => {
        const now = new Date();
        
        // Update digital clock
        const timeElement = document.getElementById('currentTime');
        const periodElement = document.getElementById('timePeriod');
        const dateElement = document.getElementById('currentDate');
        
        if (PlankTime.clock.format24) {
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            periodElement.style.display = 'none';
        } else {
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).slice(0, -3);
            periodElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: true 
            }).slice(-2);
            periodElement.style.display = 'inline';
        }
        
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update analog clock
        if (PlankTime.clock.mode === 'analog') {
            Clock.updateAnalogClock(now);
        }
    },
    
    updateAnalogClock: (now) => {
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        const hourAngle = (hours * 30) + (minutes * 0.5);
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;
        
        const hourHand = document.getElementById('hourHand');
        const minuteHand = document.getElementById('minuteHand');
        const secondHand = document.getElementById('secondHand');
        
        if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
    },
    
    toggleMode: () => {
        const digitalClock = document.querySelector('.digital-clock');
        const analogClock = document.getElementById('analogClock');
        
        if (PlankTime.clock.mode === 'digital') {
            PlankTime.clock.mode = 'analog';
            digitalClock.style.display = 'none';
            analogClock.style.display = 'block';
            analogClock.classList.add('active');
        } else {
            PlankTime.clock.mode = 'digital';
            digitalClock.style.display = 'block';
            analogClock.style.display = 'none';
            analogClock.classList.remove('active');
        }
    },
    
    toggle24Hour: () => {
        PlankTime.clock.format24 = !PlankTime.clock.format24;
        const button = document.getElementById('toggle24Hour');
        button.innerHTML = PlankTime.clock.format24 
            ? '<i class="fas fa-clock"></i> 12H Format'
            : '<i class="fas fa-clock"></i> 24H Format';
    }
};

// ===== STOPWATCH MODULE =====
const Stopwatch = {
    init: () => {
        document.getElementById('stopwatchStart').addEventListener('click', Stopwatch.toggle);
        document.getElementById('stopwatchLap').addEventListener('click', Stopwatch.lap);
        document.getElementById('stopwatchReset').addEventListener('click', Stopwatch.reset);
    },
    
    toggle: () => {
        if (PlankTime.stopwatch.isRunning) {
            Stopwatch.stop();
        } else {
            Stopwatch.start();
        }
    },
    
    start: () => {
        PlankTime.stopwatch.startTime = Date.now() - PlankTime.stopwatch.elapsedTime;
        PlankTime.stopwatch.isRunning = true;
        PlankTime.stopwatch.intervalId = setInterval(Stopwatch.update, 10);
        
        const startBtn = document.getElementById('stopwatchStart');
        const lapBtn = document.getElementById('stopwatchLap');
        const resetBtn = document.getElementById('stopwatchReset');
        
        startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        startBtn.className = 'btn-secondary';
        lapBtn.disabled = false;
        resetBtn.disabled = false;
    },
    
    stop: () => {
        PlankTime.stopwatch.isRunning = false;
        clearInterval(PlankTime.stopwatch.intervalId);
        
        const startBtn = document.getElementById('stopwatchStart');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        startBtn.className = 'btn-primary';
    },
    
    reset: () => {
        PlankTime.stopwatch.isRunning = false;
        PlankTime.stopwatch.elapsedTime = 0;
        PlankTime.stopwatch.lapTimes = [];
        clearInterval(PlankTime.stopwatch.intervalId);
        
        Stopwatch.update();
        Stopwatch.updateLapTimes();
        
        const startBtn = document.getElementById('stopwatchStart');
        const lapBtn = document.getElementById('stopwatchLap');
        const resetBtn = document.getElementById('stopwatchReset');
        
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        startBtn.className = 'btn-primary';
        lapBtn.disabled = true;
        resetBtn.disabled = true;
    },
    
    lap: () => {
        const currentTime = PlankTime.stopwatch.elapsedTime / 1000;
        const lastLapTime = PlankTime.stopwatch.lapTimes.length > 0 
            ? PlankTime.stopwatch.lapTimes[PlankTime.stopwatch.lapTimes.length - 1].total
            : 0;
        const lapDuration = currentTime - lastLapTime;
        
        PlankTime.stopwatch.lapTimes.push({
            lap: PlankTime.stopwatch.lapTimes.length + 1,
            duration: lapDuration,
            total: currentTime
        });
        
        Stopwatch.updateLapTimes();
    },
    
    update: () => {
        if (PlankTime.stopwatch.isRunning) {
            PlankTime.stopwatch.elapsedTime = Date.now() - PlankTime.stopwatch.startTime;
        }
        
        const totalSeconds = PlankTime.stopwatch.elapsedTime / 1000;
        const timeElement = document.getElementById('stopwatchTime');
        const msElement = document.getElementById('stopwatchMs');
        
        timeElement.textContent = Utils.formatTime(totalSeconds);
        msElement.textContent = `.${Math.floor((totalSeconds % 1) * 1000).toString().padStart(3, '0')}`;
    },
    
    updateLapTimes: () => {
        const lapTimesElement = document.getElementById('lapTimes');
        lapTimesElement.innerHTML = '';
        
        PlankTime.stopwatch.lapTimes.reverse().forEach(lap => {
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.innerHTML = `
                <span class="lap-number">Lap ${lap.lap}</span>
                <span class="lap-time">${Utils.formatTime(lap.duration, true)}</span>
            `;
            lapTimesElement.appendChild(lapItem);
        });
        
        PlankTime.stopwatch.lapTimes.reverse();
    }
};

// ===== TIMER MODULE =====
const Timer = {
    init: () => {
        Timer.updateDisplay();
        
        document.getElementById('timerStart').addEventListener('click', Timer.toggle);
        document.getElementById('timerPause').addEventListener('click', Timer.pause);
        document.getElementById('timerReset').addEventListener('click', Timer.reset);
        
        // Time input listeners
        document.getElementById('timerHours').addEventListener('change', Timer.updateDuration);
        document.getElementById('timerMinutes').addEventListener('change', Timer.updateDuration);
        document.getElementById('timerSeconds').addEventListener('change', Timer.updateDuration);
        
        // Quick timer buttons
        document.querySelectorAll('.quick-timer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seconds = parseInt(e.target.dataset.time);
                Timer.setDuration(seconds);
            });
        });
    },
    
    toggle: () => {
        if (PlankTime.timer.isRunning) {
            Timer.pause();
        } else {
            Timer.start();
        }
    },
    
    start: () => {
        if (PlankTime.timer.remaining <= 0) {
            Timer.updateDuration();
        }
        
        PlankTime.timer.isRunning = true;
        PlankTime.timer.intervalId = setInterval(Timer.update, 1000);
        
        const startBtn = document.getElementById('timerStart');
        const pauseBtn = document.getElementById('timerPause');
        const resetBtn = document.getElementById('timerReset');
        const setupDiv = document.getElementById('timerSetup');
        const displayDiv = document.getElementById('timerDisplay');
        
        startBtn.style.display = 'none';
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        setupDiv.style.display = 'none';
        displayDiv.style.display = 'block';
    },
    
    pause: () => {
        PlankTime.timer.isRunning = false;
        clearInterval(PlankTime.timer.intervalId);
        
        const startBtn = document.getElementById('timerStart');
        const pauseBtn = document.getElementById('timerPause');
        
        startBtn.style.display = 'flex';
        pauseBtn.disabled = true;
    },
    
    reset: () => {
        PlankTime.timer.isRunning = false;
        clearInterval(PlankTime.timer.intervalId);
        
        Timer.updateDuration();
        Timer.updateDisplay();
        
        const startBtn = document.getElementById('timerStart');
        const pauseBtn = document.getElementById('timerPause');
        const resetBtn = document.getElementById('timerReset');
        const setupDiv = document.getElementById('timerSetup');
        const displayDiv = document.getElementById('timerDisplay');
        
        startBtn.style.display = 'flex';
        pauseBtn.disabled = true;
        resetBtn.disabled = true;
        setupDiv.style.display = 'block';
        displayDiv.style.display = 'none';
    },
    
    update: () => {
        PlankTime.timer.remaining--;
        
        if (PlankTime.timer.remaining <= 0) {
            Timer.complete();
            return;
        }
        
        Timer.updateDisplay();
        Timer.updateProgress();
    },
    
    updateDisplay: () => {
        const timerTimeElement = document.getElementById('timerTime');
        timerTimeElement.textContent = Utils.formatTimerTime(PlankTime.timer.remaining);
    },
    
    updateProgress: () => {
        const circle = document.querySelector('#timerDisplay .progress-ring-fill');
        const circumference = 2 * Math.PI * 90;
        const progress = (PlankTime.timer.duration - PlankTime.timer.remaining) / PlankTime.timer.duration;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDashoffset = offset;
    },
    
    updateDuration: () => {
        const hours = parseInt(document.getElementById('timerHours').value) || 0;
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        
        PlankTime.timer.duration = (hours * 3600) + (minutes * 60) + seconds;
        PlankTime.timer.remaining = PlankTime.timer.duration;
        
        Timer.updateDisplay();
        Timer.updateProgress();
    },
    
    setDuration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        document.getElementById('timerHours').value = hours;
        document.getElementById('timerMinutes').value = minutes;
        document.getElementById('timerSeconds').value = secs;
        
        Timer.updateDuration();
    },
    
    complete: () => {
        PlankTime.timer.isRunning = false;
        PlankTime.timer.remaining = 0;
        clearInterval(PlankTime.timer.intervalId);
        
        Timer.updateDisplay();
        Utils.playSound();
        Utils.showNotification('Timer Complete!', 'Your timer has finished.');
        
        // Reset UI
        setTimeout(() => {
            Timer.reset();
        }, 3000);
    }
};

// ===== WORLD CLOCK MODULE =====
const WorldClock = {
    init: () => {
        WorldClock.render();
        WorldClock.startUpdating();
        
        document.getElementById('addTimezone').addEventListener('click', () => {
            Modal.open('timezoneModal');
        });
        
        document.getElementById('addTimezoneConfirm').addEventListener('click', WorldClock.addTimezone);
    },
    
    render: () => {
        const container = document.getElementById('timezoneGrid');
        container.innerHTML = '';
        
        PlankTime.worldClocks.forEach((tz, index) => {
            const card = WorldClock.createTimezoneCard(tz, index);
            container.appendChild(card);
        });
    },
    
    createTimezoneCard: (timezone, index) => {
        const card = document.createElement('div');
        card.className = 'timezone-card';
        
        const now = new Date();
        const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone.timezone }));
        
        card.innerHTML = `
            <button class="remove-timezone" onclick="WorldClock.removeTimezone(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="timezone-city">${timezone.city}</div>
            <div class="timezone-time">${localTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: !PlankTime.clock.format24
            })}</div>
            <div class="timezone-date">${localTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })}</div>
        `;
        
        return card;
    },
    
    addTimezone: () => {
        const cityName = document.getElementById('cityName').value.trim();
        const timezone = document.getElementById('timezoneSelect').value;
        
        if (cityName && timezone) {
            PlankTime.worldClocks.push({ city: cityName, timezone: timezone });
            WorldClock.render();
            Utils.saveSettings();
            Modal.close('timezoneModal');
            
            // Reset form
            document.getElementById('cityName').value = '';
            document.getElementById('timezoneSelect').selectedIndex = 0;
        }
    },
    
    removeTimezone: (index) => {
        PlankTime.worldClocks.splice(index, 1);
        WorldClock.render();
        Utils.saveSettings();
    },
    
    startUpdating: () => {
        setInterval(WorldClock.updateTimes, 1000);
    },
    
    updateTimes: () => {
        const cards = document.querySelectorAll('.timezone-card');
        cards.forEach((card, index) => {
            if (PlankTime.worldClocks[index]) {
                const timezone = PlankTime.worldClocks[index];
                const now = new Date();
                const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone.timezone }));
                
                const timeElement = card.querySelector('.timezone-time');
                const dateElement = card.querySelector('.timezone-date');
                
                if (timeElement) {
                    timeElement.textContent = localTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: !PlankTime.clock.format24
                    });
                }
                
                if (dateElement) {
                    dateElement.textContent = localTime.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                }
            }
        });
    }
};

// ===== ALARM MODULE =====
const Alarm = {
    init: () => {
        Alarm.render();
        Alarm.startChecking();
        
        document.getElementById('addAlarm').addEventListener('click', () => {
            Modal.open('alarmModal');
        });
        
        document.getElementById('addAlarmConfirm').addEventListener('click', Alarm.addAlarm);
        
        // Day selector buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
            });
        });
    },
    
    render: () => {
        const container = document.getElementById('alarmList');
        container.innerHTML = '';
        
        PlankTime.alarms.forEach((alarm, index) => {
            const alarmItem = Alarm.createAlarmItem(alarm, index);
            container.appendChild(alarmItem);
        });
    },
    
    createAlarmItem: (alarm, index) => {
        const item = document.createElement('div');
        item.className = 'alarm-item';
        
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const daysHtml = days.map((day, i) => 
            `<span class="alarm-day ${alarm.days.includes(i) ? 'active' : ''}">${day}</span>`
        ).join('');
        
        item.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${alarm.time}</div>
                <div class="alarm-label">${alarm.label}</div>
                <div class="alarm-days">${daysHtml}</div>
            </div>
            <div class="alarm-controls">
                <button class="alarm-toggle ${alarm.enabled ? 'active' : ''}" 
                        onclick="Alarm.toggleAlarm(${index})"></button>
                <button class="btn-icon" onclick="Alarm.removeAlarm(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return item;
    },
    
    addAlarm: () => {
        const time = document.getElementById('alarmTime').value;
        const label = document.getElementById('alarmLabel').value.trim() || 'Alarm';
        const selectedDays = Array.from(document.querySelectorAll('.day-btn.active'))
            .map(btn => parseInt(btn.dataset.day));
        
        if (time) {
            const alarm = {
                time: time,
                label: label,
                days: selectedDays,
                enabled: true
            };
            
            PlankTime.alarms.push(alarm);
            Alarm.render();
            Utils.saveSettings();
            Modal.close('alarmModal');
            
            // Reset form
            document.getElementById('alarmTime').value = '';
            document.getElementById('alarmLabel').value = '';
            document.querySelectorAll('.day-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    },
    
    removeAlarm: (index) => {
        PlankTime.alarms.splice(index, 1);
        Alarm.render();
        Utils.saveSettings();
    },
    
    toggleAlarm: (index) => {
        PlankTime.alarms[index].enabled = !PlankTime.alarms[index].enabled;
        Alarm.render();
        Utils.saveSettings();
    },
    
    startChecking: () => {
        setInterval(Alarm.checkAlarms, 1000);
    },
    
    checkAlarms: () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        const currentDay = now.getDay();
        
        PlankTime.alarms.forEach(alarm => {
            if (alarm.enabled && alarm.time === currentTime) {
                // Check if alarm should trigger today
                if (alarm.days.length === 0 || alarm.days.includes(currentDay)) {
                    Alarm.triggerAlarm(alarm);
                }
            }
        });
    },
    
    triggerAlarm: (alarm) => {
        Utils.playSound();
        Utils.showNotification('Alarm!', alarm.label);
        
        // You could add more sophisticated alarm handling here
        // like snooze functionality, different sounds, etc.
    }
};

// ===== POMODORO MODULE =====
const Pomodoro = {
    init: () => {
        Pomodoro.updateDisplay();
        
        document.getElementById('pomodoroStart').addEventListener('click', Pomodoro.toggle);
        document.getElementById('pomodoroPause').addEventListener('click', Pomodoro.pause);
        document.getElementById('pomodoroReset').addEventListener('click', Pomodoro.reset);
        
        // Settings listeners
        document.getElementById('workDuration').addEventListener('change', Pomodoro.updateSettings);
        document.getElementById('breakDuration').addEventListener('change', Pomodoro.updateSettings);
        document.getElementById('longBreakDuration').addEventListener('change', Pomodoro.updateSettings);
    },
    
    toggle: () => {
        if (PlankTime.pomodoro.isRunning) {
            Pomodoro.pause();
        } else {
            Pomodoro.start();
        }
    },
    
    start: () => {
        PlankTime.pomodoro.isRunning = true;
        PlankTime.pomodoro.intervalId = setInterval(Pomodoro.update, 1000);
        
        const startBtn = document.getElementById('pomodoroStart');
        const pauseBtn = document.getElementById('pomodoroPause');
        const resetBtn = document.getElementById('pomodoroReset');
        
        startBtn.style.display = 'none';
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
    },
    
    pause: () => {
        PlankTime.pomodoro.isRunning = false;
        clearInterval(PlankTime.pomodoro.intervalId);
        
        const startBtn = document.getElementById('pomodoroStart');
        const pauseBtn = document.getElementById('pomodoroPause');
        
        startBtn.style.display = 'flex';
        pauseBtn.disabled = true;
    },
    
    reset: () => {
        PlankTime.pomodoro.isRunning = false;
        clearInterval(PlankTime.pomodoro.intervalId);
        
        PlankTime.pomodoro.currentSession = 1;
        PlankTime.pomodoro.isWorking = true;
        PlankTime.pomodoro.remaining = PlankTime.pomodoro.workDuration * 60;
        
        Pomodoro.updateDisplay();
        
        const startBtn = document.getElementById('pomodoroStart');
        const pauseBtn = document.getElementById('pomodoroPause');
        const resetBtn = document.getElementById('pomodoroReset');
        
        startBtn.style.display = 'flex';
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Focus';
        pauseBtn.disabled = true;
        resetBtn.disabled = true;
    },
    
    update: () => {
        PlankTime.pomodoro.remaining--;
        
        if (PlankTime.pomodoro.remaining <= 0) {
            Pomodoro.completeSession();
            return;
        }
        
        Pomodoro.updateDisplay();
        Pomodoro.updateProgress();
    },
    
    updateDisplay: () => {
        const timeElement = document.getElementById('pomodoroTime');
        const sessionTypeElement = document.getElementById('sessionType');
        const sessionCountElement = document.getElementById('sessionCount');
        
        timeElement.textContent = Utils.formatTimerTime(PlankTime.pomodoro.remaining);
        
        if (PlankTime.pomodoro.isWorking) {
            sessionTypeElement.textContent = 'Work Session';
        } else if (PlankTime.pomodoro.currentSession === PlankTime.pomodoro.totalSessions) {
            sessionTypeElement.textContent = 'Long Break';
        } else {
            sessionTypeElement.textContent = 'Short Break';
        }
        
        sessionCountElement.textContent = `${PlankTime.pomodoro.currentSession} / ${PlankTime.pomodoro.totalSessions}`;
    },
    
    updateProgress: () => {
        const circle = document.querySelector('#pomodoro .progress-ring-fill');
        const circumference = 2 * Math.PI * 110;
        
        let totalDuration;
        if (PlankTime.pomodoro.isWorking) {
            totalDuration = PlankTime.pomodoro.workDuration * 60;
        } else if (PlankTime.pomodoro.currentSession === PlankTime.pomodoro.totalSessions) {
            totalDuration = PlankTime.pomodoro.longBreakDuration * 60;
        } else {
            totalDuration = PlankTime.pomodoro.breakDuration * 60;
        }
        
        const progress = (totalDuration - PlankTime.pomodoro.remaining) / totalDuration;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDashoffset = offset;
    },
    
    completeSession: () => {
        Utils.playSound();
        
        if (PlankTime.pomodoro.isWorking) {
            // Work session completed
            Utils.showNotification('Work Complete!', 'Time for a break!');
            
            PlankTime.pomodoro.isWorking = false;
            if (PlankTime.pomodoro.currentSession === PlankTime.pomodoro.totalSessions) {
                // Long break
                PlankTime.pomodoro.remaining = PlankTime.pomodoro.longBreakDuration * 60;
            } else {
                // Short break
                PlankTime.pomodoro.remaining = PlankTime.pomodoro.breakDuration * 60;
            }
        } else {
            // Break completed
            Utils.showNotification('Break Complete!', 'Back to work!');
            
            PlankTime.pomodoro.isWorking = true;
            PlankTime.pomodoro.currentSession++;
            
            if (PlankTime.pomodoro.currentSession > PlankTime.pomodoro.totalSessions) {
                // Pomodoro cycle complete
                Pomodoro.reset();
                Utils.showNotification('Pomodoro Complete!', 'Great job! Take a longer break.');
                return;
            }
            
            PlankTime.pomodoro.remaining = PlankTime.pomodoro.workDuration * 60;
        }
        
        Pomodoro.updateDisplay();
        Pomodoro.updateProgress();
        
        // Auto-start next session after a brief pause
        setTimeout(() => {
            if (!PlankTime.pomodoro.isRunning) {
                Pomodoro.start();
            }
        }, 2000);
    },
    
    updateSettings: () => {
        PlankTime.pomodoro.workDuration = parseInt(document.getElementById('workDuration').value);
        PlankTime.pomodoro.breakDuration = parseInt(document.getElementById('breakDuration').value);
        PlankTime.pomodoro.longBreakDuration = parseInt(document.getElementById('longBreakDuration').value);
        
        // Reset if not running
        if (!PlankTime.pomodoro.isRunning) {
            PlankTime.pomodoro.remaining = PlankTime.pomodoro.workDuration * 60;
            Pomodoro.updateDisplay();
        }
    }
};

// ===== MODAL MODULE =====
const Modal = {
    init: () => {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                Modal.close(modal.id);
            });
        });
        
        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Modal.close(modal.id);
                }
            });
        });
        
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            Modal.open('settingsModal');
        });
    },
    
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== NAVIGATION MODULE =====
const Navigation = {
    init: () => {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                Navigation.switchTab(tabName);
            });
        });
    },
    
    switchTab: (tabName) => {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        PlankTime.currentTab = tabName;
    }
};

// ===== SETTINGS MODULE =====
const Settings = {
    init: () => {
        Settings.loadSettingsUI();
        
        document.getElementById('themeToggle').addEventListener('click', Settings.toggleTheme);
        document.getElementById('themeSelect').addEventListener('change', Settings.changeTheme);
        document.getElementById('accentColor').addEventListener('change', Settings.changeAccentColor);
        document.getElementById('soundEnabled').addEventListener('change', Settings.toggleSound);
        document.getElementById('browserNotifications').addEventListener('change', Settings.toggleNotifications);
    },
    
    loadSettingsUI: () => {
        document.getElementById('themeSelect').value = PlankTime.settings.theme;
        document.getElementById('accentColor').value = PlankTime.settings.accentColor;
        document.getElementById('soundEnabled').checked = PlankTime.settings.soundEnabled;
        document.getElementById('browserNotifications').checked = PlankTime.settings.notificationsEnabled;
    },
    
    toggleTheme: () => {
        PlankTime.settings.theme = PlankTime.settings.theme === 'dark' ? 'light' : 'dark';
        Settings.applyTheme();
        Utils.saveSettings();
    },
    
    changeTheme: (e) => {
        PlankTime.settings.theme = e.target.value;
        Settings.applyTheme();
        Utils.saveSettings();
    },
    
    applyTheme: () => {
        if (PlankTime.settings.theme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('light-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    },
    
    changeAccentColor: (e) => {
        PlankTime.settings.accentColor = e.target.value;
        document.documentElement.style.setProperty('--primary-color', e.target.value);
        Utils.saveSettings();
    },
    
    toggleSound: (e) => {
        PlankTime.settings.soundEnabled = e.target.checked;
        Utils.saveSettings();
    },
    
    toggleNotifications: (e) => {
        PlankTime.settings.notificationsEnabled = e.target.checked;
        Utils.saveSettings();
        
        if (e.target.checked) {
            Utils.requestNotificationPermission();
        }
    }
};

// ===== MAIN APP INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🕐 Plank Time - Ultimate Time Management App');
    console.log('🚀 Initializing all modules...');
    
    // Load saved settings
    Utils.loadSettings();
    
    // Initialize all modules
    Navigation.init();
    Clock.init();
    Stopwatch.init();
    Timer.init();
    WorldClock.init();
    Alarm.init();
    Pomodoro.init();
    Modal.init();
    Settings.init();
    
    // Apply initial theme
    Settings.applyTheme();
    
    // Request notification permission
    Utils.requestNotificationPermission();
    
    console.log('✅ Plank Time initialized successfully!');
});

// ===== GLOBAL FUNCTIONS FOR INLINE EVENT HANDLERS =====
window.WorldClock = WorldClock;
window.Alarm = Alarm;
