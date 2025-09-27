# Smash & Flash Controller 🎵💡

A Raspberry Pi-based audio and light controller that combines physical button interaction with a modern web interface. Perfect for events, parties, or interactive installations where you want instant sound effects and lighting control with audio ducking support for background music.

![Logo](web-interface/frontend/public/logo.jpg)

## 🎯 Features

- **Physical Button Control** - Hardware button for instant audio playback with automatic light activation
- **Web Interface** - Beautiful React-based control panel accessible from any device
- **Audio Ducking** - Stream background music via Bluetooth that automatically ducks when button sounds play
- **Bluetooth Streaming** - Connect any device to stream music as "SmashAndFlash"
- **Audio Management** - Upload, manage, and play multiple sound files
- **Light Control** - Automatic light synchronization with audio or manual control
- **Interrupt Support** - Press the button again to stop playback instantly
- **Docker-Based** - Easy deployment using Balena Cloud
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Raspberry Pi (Zero 2 W, 3, or 4)
- DAC audio output (like HiFiBerry DAC Mini)
- Push button connected to GPIO 17
- LED/Light connected to GPIO 22
- Balena Cloud account (free tier available)

### Hardware Setup

1. **Button**: Connect between GPIO 17 and GND
2. **Light/LED**: Connect to GPIO 22 (with appropriate resistor if using LED)
3. **Audio**: Configure DAC according to manufacturer instructions

### Deployment

1. Clone this repository:
```bash
git clone https://github.com/yourusername/pr-pushbutton.git
cd pr-pushbutton
```

2. Add audio files to `audio-loader/` directory:
```bash
cp your-sounds/*.wav audio-loader/
```

3. Push to Balena:
```bash
balena push <your-app-name>
```

4. Access the web interface at `http://<device-ip>`

## 📁 Project Structure

```
pr-pushbutton/
├── hardware-button-listener/    # Physical button GPIO listener
│   ├── main.py                 # Button detection and API client
│   └── Dockerfile
├── web-interface/              # Web UI and master controller
│   ├── backend/               # FastAPI server (Python)
│   │   ├── main.py           # Core logic, GPIO control, audio playback
│   │   └── Dockerfile
│   └── frontend/             # React application
│       ├── src/             # React components
│       └── Dockerfile
├── audio-loader/             # Audio file initialization
│   ├── *.wav/mp3/ogg       # Your audio files
│   └── Dockerfile
├── ducking-audio/           # Custom audio service with ducking
│   └── Dockerfile          # PulseAudio configuration
└── docker-compose.yml       # Service orchestration
```

## 🎛️ Configuration

### Environment Variables

Configure via `docker-compose.yml` or Balena device variables:

- `BUTTON_PIN`: GPIO pin for button (default: 17)
- `LIGHT_PIN`: GPIO pin for light (default: 22)
- `AUDIO_OUTPUT`: Audio output device (default: DAC)
- `DEBOUNCE_TIME`: Button debounce in milliseconds (default: 1000)

### Supported Audio Formats

- WAV
- MP3
- OGG
- FLAC
- M4A

## 🎶 Audio Ducking System

The Smash & Flash Controller features an advanced audio ducking system that allows seamless integration of background music with button-triggered sound effects:

### How It Works

1. **Background Music**: Stream music from any Bluetooth device (phone, tablet, laptop)
2. **Button Press**: When the button is pressed or web interface triggered:
   - Background music automatically lowers in volume (ducks)
   - Sound effect plays at full volume with `media.role=phone` priority
   - Light activates in sync with the sound effect
3. **Auto-Recovery**: After the sound effect finishes:
   - Background music returns to normal volume
   - Light turns off
   - System ready for next trigger

### Bluetooth Setup

1. Enable Bluetooth on your device
2. Search for "SmashAndFlash" in available devices
3. Connect and start streaming music
4. Music will play through the Raspberry Pi's audio output
5. Button sounds will automatically interrupt/duck the music

### Use Cases

- **DJ Setup**: Play background music with instant sound effects
- **Game Shows**: Background theme music with buzzer/bell sounds
- **Parties**: Continuous playlist with fun interruption sounds
- **Presentations**: Background ambiance with attention-grabbing effects

### Technical Details

- Uses PulseAudio's role-based priority system
- Button sounds use `media.role=phone` for higher priority
- Background music streams use standard media role
- Automatic volume management handled by the audio service
- No manual mixing or volume adjustment needed

## 🎨 Web Interface

The web interface features:

- **Control Panel**: Play/stop controls, light toggle, quick sound selection
- **Sound Manager**: Upload new sounds, delete unwanted files, organize library
- **System Status**: Real-time display of audio and light states
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Optimized for all screen sizes

### API Endpoints

```
GET  /api/status           # System status
GET  /api/sounds           # List all sounds
POST /api/upload           # Upload new sound
POST /api/play/{name}      # Play specific sound
POST /api/trigger/button   # Physical button trigger
POST /api/trigger/random   # Play random sound
POST /api/stop            # Stop playback
POST /api/light/toggle    # Toggle light
```

## 🏗️ Architecture

The system uses a master-slave architecture with audio prioritization:

1. **Web Backend** (Master) - Controls all GPIO operations and audio playback
2. **Button Listener** (Slave) - Detects button presses and calls the API
3. **Web Frontend** - User interface for remote control
4. **Ducking Audio Service** - Custom PulseAudio configuration with role-based priority
5. **Bluetooth Service** - Handles device connections for music streaming

### Audio Flow
```
Bluetooth Device ─────► PulseAudio ─────► DAC/Speaker
                            │
                            ├── Background Music (normal priority)
                            │
Button Press ──► API ──► paplay with media.role=phone
                            │
                            └── Sound Effect (high priority, ducks music)
```

This design ensures:
- No GPIO conflicts
- Automatic audio ducking without manual intervention
- Consistent behavior across all triggers
- Easy debugging and maintenance
- Extensibility for additional inputs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Balena](https://balena.io)
- Audio handling via [Balena Audio Block](https://github.com/balenablocks/audio)
- UI powered by [React](https://reactjs.org) and [Material-UI](https://mui.com)
- Backend built with [FastAPI](https://fastapi.tiangolo.com)

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with 💜 and ⚡ for the Raspberry Pi community