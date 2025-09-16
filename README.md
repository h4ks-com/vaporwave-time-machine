# 🌈 90s Vaporwave Time Service ⏰

A retro-futuristic time service with a rad 90s vaporwave aesthetic! This web application brings you back to the golden age of the internet with neon colors, cyber styling, and all the features you'd expect from a time service.

## ✨ Features

### 🕐 Time Display
- **Server-synced time** with millisecond precision
- **Multiple timezone support** with automatic geo-detection
- **12/24 hour format toggle**
- **Show/hide seconds** option
- **Copy time to clipboard** functionality
- **Automatic geo-location** detection (when GeoIP database is available)

### ⏱️ Stopwatch & Timer
- **High-precision stopwatch** with millisecond accuracy
- **Lap time recording** with split times
- **Countdown timer** with preset options (5min, 10min, 15min, 25min, 1hour)
- **Visual and audio alerts** when timer completes
- **Keyboard shortcuts** for power users
- **Retro sound effects** using Web Audio API

### 📖 Guestbook
- **Powered by Giscus** for modern commenting
- **GitHub authentication** required
- **Markdown support** for rich text formatting
- **Real-time updates** and reactions

### 📊 Retro Features
- **90s-style guest counter** that increments on every visit
- **Animated starfield background** with twinkling effects
- **Neon glow effects** and CSS animations
- **Retro keyboard shortcuts** and easter eggs
- **Console logging** with vaporwave styling

## 🚀 Getting Started

### Prerequisites
- Go 1.25.1 or higher
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jadedragon942/time.git
   cd time
   ```

2. **Download dependencies:**
   ```bash
   go mod tidy
   ```

3. **Run the server:**
   ```bash
   go run main.go
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8000`

### Optional: GeoIP Database

For location detection, download the free MaxMind GeoLite2 database:

1. Sign up at [MaxMind](https://www.maxmind.com/en/geolite2/signup)
2. Download the GeoLite2-City.mmdb file
3. Place it in the project root directory

Without this database, the app will show "Unknown" for location but all other features work perfectly.

## 🎮 Controls & Shortcuts

### Main Time Page
- **Ctrl+S** - Sync with server time
- **Ctrl+T** - Toggle 12/24 hour format
- **Ctrl+C** - Copy current time
- **Space** - Toggle seconds display
- **Enter** - Apply timezone

### Stopwatch & Timer Page
- **Space** - Start/Stop Stopwatch
- **R** - Reset Stopwatch
- **L** - Record Lap Time
- **Enter** - Start/Stop Timer
- **Esc** - Reset Timer
- **1-5** - Set timer presets

## 🌐 API Endpoints

The service exposes several JSON APIs:

- `GET /time` - Current server time in UTC
- `GET /api/geoip` - Client's geographic location
- `GET /api/counter` - Current visitor count
- `POST /api/counter` - Increment visitor count

## 🎨 Tech Stack

- **Backend:** Go with standard library
- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Fonts:** Google Fonts (Orbitron)
- **Comments:** Giscus integration
- **GeoIP:** MaxMind GeoLite2 database
- **Styling:** Pure CSS with custom vaporwave theme

## 🌟 Features Breakdown

### Time Synchronization
The app performs a one-time sync with the server to calculate the time offset, then runs locally for smooth updates without constant API calls.

### Responsive Design
Fully responsive design that works on desktop, tablet, and mobile devices while maintaining the retro aesthetic.

### Audio Effects
Retro beep sounds for stopwatch and timer events using the Web Audio API. Sounds are generated programmatically for that authentic 90s feel.

### Visual Effects
- Animated starfield background
- Neon glow and pulse animations
- Color-coded timer states
- Glitch effects and transitions
- Rainbow celebration effects

## 🔧 Configuration

### Giscus Guestbook Setup
To set up your own guestbook:

1. Enable GitHub Discussions on your repository
2. Visit [giscus.app](https://giscus.app)
3. Configure your repository settings
4. Update the Giscus configuration in `templates/guestbook.html`

### Customization
- Modify CSS variables in `static/style.css` to change the color scheme
- Update the neon colors and effects to match your preference
- Add more timer presets in `static/stopwatch.js`
- Customize the background animations and effects

## 📱 Browser Compatibility

- **Chrome/Edge:** Full support including Web Audio API
- **Firefox:** Full support including Web Audio API
- **Safari:** Full support including Web Audio API
- **Mobile browsers:** Full support with responsive design

## 🚀 Deployment

### Cloud Deployment
The app is ready for deployment on:
- Heroku
- Google Cloud Run
- AWS App Runner
- Any platform supporting Go applications

## 🎭 Easter Eggs

This app includes several hidden features and easter eggs:
- Console messages with vaporwave styling
- Rare glitch effects on the time display
- Special animations at certain time intervals
- Keyboard shortcuts for power users
- Retro loading animations and transitions

## 🤝 Contributing

Feel free to contribute to this retro masterpiece! Some ideas:
- Add more timer presets
- Implement different themes
- Add more sound effects
- Create additional visual effects
- Improve mobile experience

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by 90s web design and vaporwave aesthetics
- MaxMind for GeoLite2 database
- Giscus for modern commenting system
- Google Fonts for the Orbitron typeface
- The retro computing and vaporwave communities

---

**Made with 💜 in the spirit of the 90s web**

*Welcome to the digital chronosphere! 🌈⏰*
