# 🏆 PLANK TIME ULTIMATE 🏆
## The Most Over-Engineered Stopwatch Ever Created

```
╔═╗┬  ┌─┐┌┐┌┬┌─  ╔╦╗┬┌┬┐┌─┐ ╦ ╦┬ ┌┬┐┬┌┬┐┌─┐┌┬┐┌─┐
╠═╝│  ├─┤│││├┴┐   ║ ││││├┤   ║ ║│  │ ││││├─┤ │ ├┤ 
╩  ┴─┘┴ ┴┘└┘┴ ┴   ╩ ┴┴ ┴└─┘  ╚═╝┴─┘┴ ┴┴ ┴┴ ┴ ┴ └─┘

        ︻デ═—··· 🎯 = Aim Twice, Shoot Once!
```

[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)](https://github.com/dnoice/plank-time)
[![Python](https://img.shields.io/badge/python-3.8+-blue)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)
[![Awesome](https://img.shields.io/badge/awesome-yes-ff69b4)](https://github.com/dnoice/plank-time)

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [💻 Installation](#-installation)
- [🎮 Usage](#-usage)
- [⚙️ Configuration](#️-configuration)
- [🏆 Achievements](#-achievements)
- [🌐 Network Competition](#-network-competition)
- [📊 Analytics](#-analytics)
- [🎨 Themes](#-themes)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [📁 Export Formats](#-export-formats)
- [🔧 Advanced Features](#-advanced-features)
- [💡 Tips & Tricks](#-tips--tricks)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 🌟 Features

### Web Version (HTML5)
- **🎨 Stunning Visuals**: Particle effects, gradient animations, glassmorphism UI
- **⏱️ Multiple Modes**: Stopwatch, Countdown, Interval, Tabata, Pomodoro
- **📈 Real-time Charts**: Performance analytics with Chart.js
- **🏅 Achievement System**: 20+ unlockable badges with points
- **🎵 Sound Themes**: Multiple audio feedback options
- **🗣️ Voice Announcements**: Text-to-speech support
- **🌓 Theme Variants**: Dark, Light, Cyber, Matrix themes
- **📱 Responsive Design**: Works on all devices
- **💾 Local Storage**: Auto-save and session recovery
- **📊 Export Options**: JSON, CSV, HTML reports

### Python CLI Version
- **🖥️ Beautiful Terminal UI**: ASCII art, colored output, graphs
- **⚡ High Performance**: Millisecond precision timing
- **📊 ASCII Graphs**: Real-time performance visualization
- **🗄️ SQLite Database**: Persistent session history
- **🌐 Network Mode**: Compete with others over network
- **🎯 20+ Achievements**: Gamification system
- **🔊 Cross-platform Audio**: Sound and voice support
- **📁 Multiple Export Formats**: JSON, CSV, HTML
- **⚙️ Configuration Profiles**: Save and load settings
- **🎨 5 Color Schemes**: Default, Neon, Matrix, Ocean, Fire

---

## 🚀 Quick Start

### Web Version
```bash
# Simply open the HTML file in any modern browser
open plank_time_ultimate.html
# Or
firefox plank_time_ultimate.html
# Or
chrome plank_time_ultimate.html
```

### Python Version
```bash
# Basic usage
python plank_time_ultimate.py

# HIIT workout with voice
python plank_time_ultimate.py --mode interval --preset hiit --voice

# Competitive mode
python plank_time_ultimate.py --compete --port 8080

# Full experience
python plank_time_ultimate.py --sound --voice --color-scheme neon
```

---

## 💻 Installation

### System Requirements
- **Web Version**: Any modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Python Version**: Python 3.8+ with pip

### Python Dependencies
```bash
# Core functionality (no external dependencies required!)
python plank_time_ultimate.py

# Optional: Voice announcements
pip install pyttsx3

# Optional: Enhanced terminal colors (Windows)
pip install colorama

# Full installation with all features
pip install pyttsx3 colorama
```

### Download Options
```bash
# Clone the repository
git clone https://github.com/dendogg/plank-time.git
cd plank-time

# Or download directly
wget https://raw.githubusercontent.com/dendogg/plank-time/main/plank_time_ultimate.py
wget https://raw.githubusercontent.com/dendogg/plank-time/main/plank_time_ultimate.html
```

---

## 🎮 Usage

### Basic Commands

#### Web Version Controls
| Key | Action | Description |
|-----|--------|-------------|
| `SPACE` | Start/Stop | Toggle timer state |
| `L` | Lap | Record split time |
| `R` | Reset | Clear all data |
| `M` | Mode | Cycle through modes |
| `F` | Fullscreen | Toggle fullscreen |
| `V` | Voice | Toggle announcements |
| `T` | Theme | Cycle themes |
| `E` | Export | Export session data |

#### Python CLI Controls
| Key | Action | Description |
|-----|--------|-------------|
| `SPACE` | Start/Stop | Toggle timer |
| `L` | Lap | Record lap time |
| `R` | Reset | Reset timer |
| `E` | Export | Export data |
| `D` | Display | Toggle display mode |
| `G` | Graph | Show performance graph |
| `A` | Achievements | View all achievements |
| `S` | Statistics | Detailed statistics |
| `Q` | Quit | Exit application |

### Timer Modes

#### 1. Stopwatch Mode
Classic stopwatch with lap recording
```bash
python plank_time_ultimate.py --mode stopwatch
```

#### 2. Countdown Mode
Count down from specified time
```bash
python plank_time_ultimate.py --mode countdown --time 300  # 5 minutes
```

#### 3. Interval Training
Customizable work/rest intervals
```bash
python plank_time_ultimate.py --mode interval --work 45 --rest 15 --rounds 10
```

#### 4. Tabata Mode
High-intensity interval training
```bash
python plank_time_ultimate.py --mode tabata  # 20s work, 10s rest, 8 rounds
```

#### 5. Pomodoro Mode
Productivity timer
```bash
python plank_time_ultimate.py --mode pomodoro  # 25min work, 5min break
```

---

## ⚙️ Configuration

### Configuration File (plank_time_config.json)
```json
{
  "default_mode": "stopwatch",
  "color_scheme": "neon",
  "sound_enabled": true,
  "voice_enabled": true,
  "auto_export": true,
  "auto_save": true,
  "display_precision": 1,
  "database_file": "plank_time.db",
  "network": {
    "enabled": false,
    "port": 8080,
    "broadcast_interval": 100
  },
  "intervals": {
    "work_time": 30,
    "rest_time": 10,
    "rounds": 8,
    "warmup": 10,
    "cooldown": 10
  },
  "presets": {
    "custom_hiit": {
      "work": 40,
      "rest": 20,
      "rounds": 15
    }
  },
  "achievements": {
    "notify_unlock": true,
    "sound_on_unlock": true
  }
}
```

### Environment Variables
```bash
export PLANK_TIME_CONFIG=/path/to/config.json
export PLANK_TIME_DB=/path/to/database.db
export PLANK_TIME_THEME=matrix
export PLANK_TIME_VOICE=enabled
```

---

## 🏆 Achievements

### Complete Achievement List

| Achievement | Icon | Points | Requirement |
|-------------|------|--------|-------------|
| **First Step** | 🎯 | 10 | Record your first lap |
| **Decathlon** | 🏃 | 20 | Complete 10 laps |
| **Speed Demon** | ⚡ | 30 | Lap under 5 seconds |
| **Marathon Runner** | 🏅 | 50 | Run for over 1 hour |
| **Consistency King** | 📊 | 40 | Maintain steady pace (5 laps, <10% variation) |
| **Always Improving** | 📈 | 40 | Progressive improvement (5 consecutive faster laps) |
| **Century Club** | 💯 | 100 | 100 laps in one session |
| **Perfect Timing** | ⏱️ | 25 | Exact second lap (X.000) |
| **Night Owl** | 🦉 | 15 | Train after 10 PM |
| **Early Bird** | 🐦 | 15 | Train between 5-7 AM |
| **Week Warrior** | 🔥 | 60 | 7-day consecutive streak |
| **Negative Split** | ➖ | 35 | Second half faster than first |
| **Interval Master** | 🔄 | 45 | Complete 10+ interval rounds |
| **Data Scientist** | 📊 | 30 | Export 10+ sessions |
| **Social Butterfly** | 🌐 | 25 | Use network competition |
| **Endurance Legend** | 🏔️ | 75 | 3+ hour session |
| **Precision Expert** | 🎪 | 50 | 10 laps within 1% variance |
| **Speed Progression** | 🚀 | 60 | 20% improvement over session |
| **Grand Master** | 👑 | 200 | Unlock all other achievements |
| **Secret Achievement** | 🎁 | ??? | ??? |

### Unlocking Tips
- **Consistency is key**: Regular sessions unlock streak achievements
- **Push your limits**: Speed achievements require focused effort
- **Explore all modes**: Some achievements are mode-specific
- **Time of day matters**: Schedule sessions for time-based achievements
- **Export regularly**: Build up your data scientist credentials

---

## 🌐 Network Competition

### Setting Up Competition Mode

#### Host a Session
```bash
# Start as host
python plank_time_ultimate.py --compete --port 8080

# Your session ID will be displayed
# Share this with competitors
```

#### Join a Session
```bash
# Connect to host
python plank_time_ultimate.py --compete --host 192.168.1.100 --port 8080
```

### Features
- Real-time lap sharing
- Leaderboard updates
- Achievement notifications
- Chat messages (coming soon)
- Ghost mode (race against recordings)

---

## 📊 Analytics

### Performance Metrics
- **Lap Time Analysis**: Min, max, average, median, std deviation
- **Trend Detection**: Improving, declining, or stable performance
- **Pace Calculation**: Current vs target pace
- **Split Comparison**: Negative/positive splits
- **Distribution Analysis**: Percentile rankings
- **Session Comparison**: Historical performance tracking

### Visualization
- **ASCII Graphs** (Python): Real-time terminal graphs
- **Chart.js** (Web): Interactive performance charts
- **Heat Maps**: Performance over time
- **Progress Bars**: Achievement completion
- **Sparklines**: Mini trend indicators

---

## 🎨 Themes

### Web Version Themes

#### Dark Mode (Default)
- Background: `#0a0a0a`
- Primary: `#00ff88`
- Secondary: `#ff00ff`
- Accent: `#00d4ff`

#### Light Mode
- Background: `#f0f0f0`
- Primary: `#00cc66`
- Secondary: `#cc00cc`
- Accent: `#0099cc`

#### Cyber Mode
- Background: `#000033`
- Primary: `#ff00ff`
- Secondary: `#00ffff`
- Neon glow effects

#### Matrix Mode
- Background: `#000000`
- Primary: `#00ff00`
- Monochrome green
- Digital rain effect

### Python CLI Themes

```bash
# Available themes
python plank_time_ultimate.py --color-scheme default
python plank_time_ultimate.py --color-scheme neon
python plank_time_ultimate.py --color-scheme matrix
python plank_time_ultimate.py --color-scheme ocean
python plank_time_ultimate.py --color-scheme fire
```

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+S` | Quick Save | Save current session |
| `Ctrl+E` | Quick Export | Export with default settings |
| `Ctrl+R` | Quick Reset | Reset with confirmation |
| `Ctrl+F` | Find | Search in lap history |
| `Ctrl+Z` | Undo | Undo last action |
| `Ctrl+/` | Help | Show help overlay |

### Mode-Specific Shortcuts
| Mode | Key | Action |
|------|-----|--------|
| Stopwatch | `L` | Record lap |
| Countdown | `+/-` | Add/subtract time |
| Interval | `S` | Skip to next phase |
| Tabata | `P` | Pause between rounds |
| Pomodoro | `B` | Start break early |

---

## 📁 Export Formats

### JSON Export
```json
{
  "session": {
    "id": "a3f2c891",
    "mode": "stopwatch",
    "start_time": "2025-08-05T10:30:00Z",
    "total_elapsed": 125340,
    "total_elapsed_formatted": "02:05.340"
  },
  "laps": [...],
  "statistics": {...},
  "achievements": [...]
}
```

### CSV Export
```csv
Lap Number,Total Time (ms),Lap Time (ms),Formatted,Timestamp
1,15234,15234,00:15.234,2025-08-05T10:30:15Z
2,31567,16333,00:31.567,2025-08-05T10:30:31Z
...
```

### HTML Report
- Professional styled report
- Charts and graphs
- Achievement badges
- Print-friendly format
- Shareable via email/web

---

## 🔧 Advanced Features

### Custom Workout Builder
```python
# Create custom interval workout
{
  "name": "Custom HIIT",
  "phases": [
    {"type": "warmup", "duration": 300},
    {"type": "work", "duration": 45, "repeat": 10},
    {"type": "rest", "duration": 15, "repeat": 10},
    {"type": "cooldown", "duration": 300}
  ]
}
```

### API Integration (Coming Soon)
```python
# Connect to fitness APIs
- Strava integration
- Fitbit sync
- Apple Health export
- Google Fit compatibility
```

### Voice Commands (Experimental)
```python
# Voice control commands
"Start timer"
"Record lap"
"What's my average?"
"Show statistics"
"Export session"
```

### Ghost Mode
Race against your previous best sessions or compete with recorded sessions from other users.

### Heart Rate Integration
Connect Bluetooth heart rate monitors for enhanced training metrics.

---

## 💡 Tips & Tricks

### Performance Tips
1. **Warm up properly**: Use warmup time in interval mode
2. **Set realistic goals**: Start with achievable targets
3. **Track consistency**: Regular sessions > occasional marathons
4. **Use voice feedback**: Keeps you focused without looking
5. **Export regularly**: Build your performance database

### Power User Features
1. **Batch Export**: Export multiple sessions at once
2. **Session Templates**: Save and reuse configurations
3. **Macro Recording**: Record action sequences
4. **Custom Themes**: Create your own color schemes
5. **Plugin System**: Extend functionality with plugins

### Hidden Features
- **Easter Egg**: Type "konami" for a surprise
- **Boss Mode**: Press `B` to instantly minimize
- **Zen Mode**: `Z` for distraction-free timing
- **Developer Mode**: `F12` for debug information
- **Screenshot Mode**: `P` for perfect screenshots

---

## 🐛 Troubleshooting

### Common Issues

#### Web Version
| Issue | Solution |
|-------|----------|
| No sound | Check browser audio permissions |
| Voice not working | Enable Web Speech API in browser |
| Charts not loading | Ensure CDN access (no blocking) |
| Storage not saving | Check localStorage quota |
| Fullscreen issues | Update browser to latest version |

#### Python Version
| Issue | Solution |
|-------|----------|
| No key detection | Run with proper terminal (not IDE) |
| Colors not showing | Install colorama (Windows) |
| Voice errors | Install pyttsx3, check audio drivers |
| Database errors | Check write permissions |
| Network issues | Check firewall settings |

### Debug Mode
```bash
# Enable debug output
python plank_time_ultimate.py --debug

# Verbose logging
python plank_time_ultimate.py --verbose

# Test mode (simulated data)
python plank_time_ultimate.py --test
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Setup
```bash
# Clone repo
git clone https://github.com/dendogg/plank-time.git
cd plank-time

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/

# Run linting
python -m flake8 plank_time_ultimate.py

# Format code
python -m black plank_time_ultimate.py
```

### Contribution Guidelines
- Follow PEP 8 for Python code
- Use semantic commit messages
- Add tests for new features
- Update documentation
- Maintain backwards compatibility

---

## 📜 License

This project is licensed under the MIT License:

```
MIT License

Copyright (c) 2025 Dennis 'dnoice' Smaltz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Special Thanks
- **Dennis 'dnoice' Smaltz** - Project Creator & Vision
- **Claude Opus 4.1 (Anthropic)** - AI Development Partner
- **The Open Source Community** - For amazing libraries and tools
- **Beta Testers** - For invaluable feedback
- **You** - For using Plank Time Ultimate!

### Technologies Used
- **Python** - Core language for CLI version
- **HTML5/CSS3/JavaScript** - Web technologies
- **Chart.js** - Data visualization
- **SQLite** - Database management
- **pyttsx3** - Text-to-speech
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Inspiration
> "In the pursuit of excellence, even time itself must be mastered with precision and style."
> 
> ︻デ═—··· 🎯 = **Aim Twice, Shoot Once!**

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/dnoice/plank-time/issues)
- **Discussions**: [Join the community](https://github.com/dnoice/plank-time/discussions)
- **Email**: densmaltz4@gmail.com
- **Twitter**: [@PlankTimeApp](https://twitter.com/planktimeapp)
- **Discord**: [Plank Time Community](https://discord.gg/planktime)

---

## 🚀 Future Roadmap

### Version 2.1 (Q1 2025)
- [ ] Mobile app (React Native)
- [ ] Cloud sync
- [ ] Social features
- [ ] AI coaching

### Version 3.0 (Q2 2025)
- [ ] VR support
- [ ] Biometric integration
- [ ] Team competitions
- [ ] Advanced analytics

### Long-term Vision
- Olympic training integration
- Professional sports adoption
- Educational partnerships
- Global leaderboards

---

<div align="center">

## ⭐ Star this repo if you find it useful! ⭐

### Made with ❤️ and excessive engineering

**Plank Time Ultimate** - Because ordinary stopwatches are for ordinary people

`Version 2.0.0 | Build 20250805 | ︻デ═—··· 🎯`

</div>
