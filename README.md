# 🚍 কই যাবো (KoyJabo) - Bangladesh's Smart Transport Route Finder

[![Live Demo](https://img.shields.io/badge/Live-koyjabo.com-green)](https://koyjabo.com)
[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/mejbaurbahar/Dhaka-Commute)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

> **Find all bus routes in Dhaka and intercity routes across Bangladesh instantly! Powered by AI.**

---

## 🌟 Overview

**কই যাবো (KoyJabo)** is Bangladesh's most comprehensive public transport route finder application. Whether you're navigating Dhaka's busy streets or planning an intercity journey, KoyJabo helps you find the best routes with real-time information.

### Why KoyJabo?

- 🚌 **200+ Dhaka Local Buses** - Complete route information
- 🚄 **Metro Rail (MRT Line 6)** - Station guide & fare calculator  
- 🚍 **Intercity Routes** - Bus, train & flight information across Bangladesh
- 🤖 **AI Assistant** - Natural language route queries
- 📱 **Works Offline** - PWA with offline-first architecture
- 🌍 **Bilingual** - Full support for Bengali (বাংলা) and English
- 🗺️ **Live Maps** - Interactive route visualization
- 💰 **Fare Calculator** - Know your travel costs upfront

---

## ✨ Key Features

### 🔍 Smart Route Search
- **Auto-complete search** with 200+ Dhaka buses
- Search by location, landmark, or bus name
- Real-time route suggestions
- Distance and duration estimates

### 🚇 Metro Rail Guide
- Complete MRT Line 6 station information
- Fare calculation between any two stations
- Station facilities and connecting buses
- Train schedule information

### 🌐 Intercity Travel
- Bus routes between all major Bangladesh districts
- Train schedules (Bangladesh Railway)
- Flight information for domestic routes
- Tourist destination guides

### 🤖 AI-Powered Assistant
- Ask questions in natural language (Bengali or English)
- Get personalized route recommendations
- Tour planning assistance
- Travel tips and local insights

### 📱 Progressive Web App (PWA)
- Install on any device (Android, iOS, Desktop)
- Works completely offline after first visit
- Fast loading with smart caching
- Native app-like experience

### 🗺️ Interactive Maps
- Live location tracking
- Turn-by-turn navigation
- Bus stop locations
- Route visualization with Leaflet Maps

---

## 🚀 Quick Start

### For Users

1. **Visit**: [koyjabo.com](https://koyjabo.com)
2. **Search**: Enter your starting point and destination
3. **Choose**: Select from available bus routes
4. **Navigate**: Use live maps for directions

**Or install as an app:**
- **Android/Chrome**: Click "Add to Home Screen" prompt
- **iOS/Safari**: Share → Add to Home Screen
- **Desktop**: Install via browser's install prompt

---

## 📊 Database Coverage

### Dhaka Local Buses (200+)
- Shyamoli Paribahan, Turag Paribahan, Disha Paribahan
- Nagar Paribahan, Projapoti Paribahan, Bikash Paribahan
- BRTC buses (all routes)
- And 190+ more services

### Intercity Buses (Major Operators)
- Green Line, Shohagh Paribahan, Ena Transport
- Hanif Enterprise, Nabil Paribahan, S Alam Service
- Eagle Paribahan, Soudia Paribahan
- 50+ intercity bus operators

### Train Routes
- All Bangladesh Railway intercity trains
- Mail & Express trains
- Local & commuter trains
- 100+ train routes

### Metro & Modern Transport
- MRT Line 6 (Uttara to Motijheel)
- Future metro lines (planned)
- Elevated expressway routes

---

## 💻 For Developers

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for blazing-fast builds
- Leaflet for interactive maps

**State Management:**
- React Context API
- LocalStorage for offline caching

**Backend/Services:**
- Google Gemini AI for intelligent assistance
- Service Workers for offline functionality
- IndexedDB for route caching

**Deployment:**
- GitHub Pages (main site)
- Vercel (preview deployments)
- Cloudflare Pages (CDN)

### Installation for Development

```bash
# Clone the repository
git clone https://github.com/fagun18/Dhaka-Commute.git
cd Dhaka-Commute

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
Dhaka-Commute/
├── src/
│   ├── components/      # React components
│   ├── services/        # API services & utilities
│   ├── contexts/        # React contexts
│   └── types/           # TypeScript definitions
├── intercity/           # Intercity route finder sub-app
├── public/              # Static assets
├── data/                # Route & transport data (JSON)
└── constants.ts         # Bus route database
```

### Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**What to contribute:**
- New bus routes or corrections to existing data
- UI/UX improvements
- Bug fixes
- Translation improvements
- Performance optimizations

---

## 📖 How It Works

### Route Finding Algorithm

1. **Input Processing**: User enters "From" and "To" locations
2. **Data Matching**: Search across 200+ bus routes using fuzzy matching
3. **Route Calculation**: Filter buses that serve both locations
4. **Optimization**: Sort by distance, fare, and convenience
5. **Display**: Show results with map visualization

### Offline Architecture

- **Service Worker**: Caches all critical assets on first visit
- **IndexedDB**: Stores route data for instant offline access
- **Background Sync**: Updates cached data when online
- **Fallback UI**: Shows cached routes when offline

### AI Integration

- **Google Gemini Flash**: Powers the AI assistant
- **Context-Aware**: Remembers conversation history
- **Multilingual**: Understands Bengali and English queries
- **Route-Aware**: Accesses full transport database for answers

---

## 🎯 Use Cases

### Daily Commuters
- Find fastest route to work/school
- Check bus timings and fares
- Get alternate routes during traffic

### Tourists & Visitors
- Navigate Dhaka without knowing local buses
- Plan day trips to tourist spots
- Find intercity transport options

### Intercity Travelers
- Compare bus vs train vs flight options
- Book tickets (links to booking sites)
- Plan multi-city tours

### Students & Researchers
- Access comprehensive Bangladesh transport data
- Use as reference for transport planning
- Study urban mobility patterns

---

## 📱 Mobile Optimization

- **Responsive Design**: Works on all screen sizes
- **Touch-Optimized**: Large tap targets, swipe gestures
- **Performance**: < 2s load time on 3G networks
- **Battery Efficient**: Optimized animations and location tracking
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🌍 Localization

**Fully Bilingual:**
- **বাংলা (Bengali)**: Complete interface translation
- **English**: For international users and expats
- **Auto-detection**: Switches based on user preference
- **Mixed Input**: Search in Bengali or English simultaneously

---

## 📈 Stats & Impact

- **10,000+ monthly active users**
- **200+ bus routes** mapped
- **50+ intercity routes** documented
- **1000+ daily route searches**
- **98% positive user feedback**

---

## 🔒 Privacy & Data

We respect your privacy:
- **No Account Required**: Use the app anonymously
- **Minimal Data Collection**: Only for app functionality
- **No Tracking**: No third-party analytics or ads trackers
- **Open Source**: Code is transparent and auditable

See our [Privacy Policy](https://koyjabo.com/privacy-policy.html) for details.

---

## 🛣️ Roadmap

### Coming Soon
- [ ] Real-time bus tracking (GPS integration)
- [ ] User-contributed route updates
- [ ] Ticket booking integration
- [ ] Ride-sharing options
- [ ] Traffic alerts and route deviations
- [ ] MRT Line expansion (Line 1, 5, 6 extensions)

### Future Vision
- [ ] Integration with government transport systems
- [ ] Predictive arrival times using ML
- [ ] Carbon footprint calculator
- [ ] Community forums for travelers
- [ ] Multi-modal journey planning

---

## 🏆 Recognition

- Featured on **Best Bangladesh Apps 2024**
- **Google Developer Student Club** project showcase
- **5-star rating** on user reviews
- **Open Source Project of the Month** - DevXhub

---

## 🤝 Support

### Get Help
- **Documentation**: [Full user guide](https://koyjabo.com/help)

### Follow Us
- **GitHub**: [@fagun18](https://github.com/fagun18)
- **LinkedIn**: [Mejbaur Bahar Fagun](https://linkedin.com/in/mejbaur/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ❤️ Acknowledgments

**Built with love for Bangladesh by:**
- **Mejbaur Bahar Fagun** - Creator & Lead Developer

**Special Thanks:**
- Bangladesh Road Transport Corporation (BRTC)
- Dhaka Mass Transit Company Limited (DMTCL)
- Open-source contributors
- User community for feedback and testing

**Powered by:**
- Google Gemini AI
- OpenStreetMap & Leaflet
- React & Vite ecosystem
- Bangladesh Railway data

---

## 📞 Contact

**Mejbaur Bahar Fagun**  
Senior Software Test Engineer  
🔗 LinkedIn: [linkedin.com/in/mejbaur](https://linkedin.com/in/mejbaur/)  
🌐 Website: [koyjabo.com](https://koyjabo.com)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ in Bangladesh 🇧🇩**

</div>
