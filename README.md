# QuickMenu - Offline PWA for Android Vendors

![QuickMenu Banner](https://img.shields.io/badge/Offline-Ready-success)
![PWA](https://img.shields.io/badge/PWA-Android-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-ff69b4.svg)

**QuickMenu** is a production-ready, **Progressive Web App (PWA)** designed specifically for **Android vendors**, campus food stalls, and small businesses. Create and share digital menus via QR codes with **zero cost**, **no internet required**, and **native Android app experience**.

---

## 🎯 Core Features

### ✅ For Vendors
- **Simple Menu Management**: Add, edit, and delete menu items with validation
- **Category Organization**: Organize items by categories (Drinks, Main Course, Desserts)
- **Real-time Preview**: See customer view with category tabs as you edit
- **QR Code Generation**: Instantly create scannable QR codes
- **100% Offline**: Works without internet after initial load
- **Data Persistence**: Menu saved automatically to browser storage
- **Mobile-First**: Fully responsive design optimized for Android

### ✅ For Customers
- **Instant Access**: Scan QR to view menu immediately
- **Category Navigation**: Browse menu by categories with smooth animations
- **Clean Interface**: Easy-to-read menu layout with veg/non-veg indicators
- **Offline Viewing**: Menu embedded in QR code
- **Fast Loading**: Optimized for low-end devices

### 🚀 **Android-Specific Features (MAD Project)**

#### **Native Android Integration**
- ✅ **PWA Install Flow**: Custom install banner with native Android dialog
- ✅ **Standalone Mode**: Runs as a full-screen app (no browser UI)
- ✅ **Portrait Lock**: App locked to portrait orientation
- ✅ **Theme Integration**: Status bar matches app theme (#0ea5e9)
- ✅ **Splash Screen**: Seamless branded splash with theme colors

#### **System-Level APIs**
- ✅ **Wake Lock API**: Screen stays on while displaying QR code
- ✅ **Web Share API**: Native Android share sheet integration
- ✅ **Haptic Feedback**: Vibration API for tactile button responses
- ✅ **Pull-to-Refresh Disabled**: Prevents accidental browser refreshes

#### **Material Design Motion**
- ✅ **Tab Transitions**: Slide & fade animations (400ms emphasized easing)
- ✅ **Direction-Aware**: Forward slides from right, backward from left
- ✅ **Heavy Motion**: High mass spring physics for premium feel
- ✅ **Stagger Animations**: Menu items animate in sequence
- ✅ **Category Tabs**: Smooth horizontal scrolling with haptics

---

## 🏗️ Architecture

### Clean Architecture Principles

```
src/
├── components/          # UI Components (Single Responsibility)
│   ├── MenuEditor/      # Menu CRUD interface
│   ├── MenuPreview/     # Customer-facing preview with categories
│   ├── QRGenerator/     # QR code generation & download
│   └── Shared/          # Reusable components
│       ├── Button.jsx           # Haptic-enabled button
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Alert.jsx
│       ├── Toast.jsx
│       ├── EmptyState.jsx
│       └── InstallBanner.jsx    # PWA install UI
├── hooks/               # Custom React Hooks
│   ├── useMenu.js       # Menu state management
│   ├── useQRCode.js     # QR generation logic
│   ├── useLocalMenu.js  # Menu viewing from QR
│   ├── useHaptics.js    # Vibration API wrapper
│   ├── usePWAInstall.js # PWA install prompt management
│   ├── useWakeLock.js   # Screen wake lock
│   ├── useWebShare.js   # Native share API
│   └── usePullToRefresh.js # Disable pull-to-refresh
├── services/            # Business Logic Layer
│   ├── storageService.js   # LocalStorage abstraction
│   └── qrService.js        # QR code operations
├── utils/               # Helper Functions
│   ├── validation.js    # Input validation & formatting
│   └── motionConfig.js  # Material Design motion specs
├── pages/               # Page Components
│   ├── EditorPage.jsx   # Vendor interface (tab navigation)
│   └── MenuViewPage.jsx # Customer view
├── styles/              # Global Styles
│   └── index.css        # Tailwind + Custom CSS
└── main.jsx             # Application Entry Point
```

### Key Design Patterns

- **Service Layer**: Abstraction for storage and QR operations
- **Custom Hooks**: Encapsulated state management
- **Component Composition**: Reusable, single-purpose components
- **Separation of Concerns**: Clear boundaries between UI and logic
- **Android System Integration**: Native API wrappers (Wake Lock, Share, Haptics)
- **Material Design Motion**: Centralized animation configurations

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16+ (recommended: v18+)
- **npm** or **yarn**

### Installation

1. **Clone or download** this repository:
   ```bash
   cd MAD
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder. Deploy to any static hosting service.

---

## 📱 How to Use

### For Vendors

1. **Add Menu Items**:
   - Enter item name (max 50 chars)
   - Enter price (numeric, positive)
   - Click "Add Item"

2. **Edit Items**:
   - Click edit icon on any item
   - Modify name or price
   - Click checkmark to save

3. **Generate QR Code**:
   - QR auto-generates when items are added
   - Click "Download QR Code" to save
   - Print or display on device

4. **Share with Customers**:
   - Customers scan QR code
   - Menu appears instantly
   - Works offline!

### For Customers

1. Scan QR code with phone camera
2. Menu opens in browser
3. View items and prices
4. No app installation needed

---

## 🔧 Technical Stack

| Technology | Purpose |
|------------|---------|
| **React 18.2** | UI framework |
| **Vite 5.0** | Build tool & dev server |
| **Tailwind CSS 3.3** | Styling framework |
| **Framer Motion 11.x** | Android Material Design animations |
| **qrcode** | QR code generation |
| **lucide-react** | Icon library |
| **LocalStorage API** | Offline data persistence |
| **Service Worker** | PWA caching & offline support |
| **Wake Lock API** | Screen stay-awake feature |
| **Web Share API** | Native Android share integration |
| **Vibration API** | Haptic feedback |

### PWA Manifest Configuration

```json
{
  "name": "QuickMenu",
  "short_name": "QuickMenu",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0ea5e9",
  "background_color": "#0ea5e9"
}
```

---

## 📱 Android Features in Detail

### 1. **PWA Installation**
- Custom install banner appears on first visit
- Triggers native Android "Add to Home screen" dialog
- Only shows when app is installable and not already installed
- See: [PWA_INSTALL_GUIDE.md](PWA_INSTALL_GUIDE.md)

### 2. **Haptic Feedback**
- Light tap (20ms) on button clicks
- Success pulse (30-50-30ms) when adding items
- Error pulse (triple tap) on validation failures
- Category tab taps provide tactile feedback

### 3. **Wake Lock**
- Automatically activates when QR code is displayed
- Prevents screen from dimming while customers scan
- Releases when navigating away
- See: [ANDROID_TESTING.md](ANDROID_TESTING.md)

### 4. **Native Share**
- "Share Menu" button triggers Android share sheet
- Share via WhatsApp, SMS, Email, etc.
- Falls back to "Copy Link" on unsupported devices
- Custom share message with stall name

### 5. **Material Design Motion**
- Tab transitions: 400ms emphasized easing
- Slide from right (forward), slide from left (backward)
- Stagger animations on category switch
- Spring physics for tab indicator (stiffness: 300, damping: 30, mass: 1.2)
- See: [MATERIAL_MOTION.md](MATERIAL_MOTION.md)

### 6. **Category Navigation**
- Horizontal scrollable pill-shaped tabs
- Active tab: gradient primary with shadow
- Item count badges on each category
- Smooth transitions with haptic feedback
- Auto-syncs when new categories are added

---

## 🛡️ Data Persistence

### Storage Strategy

- **Technology**: Browser LocalStorage API
- **Capacity**: ~5-10MB (sufficient for thousands of items)
- **Versioning**: Built-in data migration support
- **Fallback**: Graceful degradation if storage unavailable

### Data Structure

```javascript
{
  "version": "1.0",
  "timestamp": "2026-01-17T10:30:00.000Z",
  "items": [
    {
      "id": "1737111000000-abc123",
      "name": "Margherita Pizza",
      "price": 12.99,
      "createdAt": "2026-01-17T10:30:00.000Z"
    }
  ]
}
```

---

## 📊 QR Code Implementation

### How It Works

1. **Menu Encoding**:
   - Menu data compressed to JSON
   - Base64 encoded for URL safety
   - Embedded in URL hash fragment

2. **QR Generation**:
   - Error correction: Medium (15%)
   - Size: 512x512 pixels
   - Format: PNG with transparent margin

3. **Decoding**:
   - URL hash extracted on scan
   - Base64 decoded
   - JSON parsed to display menu

### Example QR Data

```
https://yoursite.com/#menu=eyJ2IjoiMS4wIiwidCI6MTczNzExMTAwMDAwMCwiaXRlbXMiOlt7Im4iOiJQaXp6YSIsInAiOjEyLjk5fV19
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| **Item Name** | Required, max 50 characters, trimmed |
| **Price** | Required, numeric, positive, max 2 decimals |

### Error Handling

- **Real-time validation** on user input
- **User-friendly error messages**
- **Prevents invalid data submission**
- **Graceful storage failure handling**

---

## 🎨 UI/UX Features

### Mobile-First Design

- Responsive breakpoints (sm, md, lg)
- Touch-friendly buttons (min 44px tap targets)
- Optimized for 320px-wide screens
- Prevents iOS zoom on input focus

### Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus visible indicators
- Color contrast compliance

### Performance

- Code splitting for vendor chunks
- Lazy loading where applicable
- Optimized bundle size
- Fast initial load (~50KB gzipped)

---

## 🔒 Security & Privacy

- **No Backend**: All data stays on user's device
- **No Tracking**: Zero analytics or data collection
- **No External APIs**: Fully self-contained
- **XSS Protection**: Input sanitization
- **Content Security**: No eval() or inline scripts

---

## 🧪 Testing Offline Functionality

### Method 1: Chrome DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh page
5. App should work normally

### Method 2: Service Worker (PWA)

✅ **Now Implemented!** Service Worker caches all assets for true offline support.

To test:
1. Visit the app online once
2. Install as PWA (click install banner)
3. Turn off internet/WiFi
4. Open app from home screen
5. App works completely offline!

---

## 🚧 MAD Project Features (Implemented)

- [x] **Service Worker**: True PWA with offline caching
- [x] **PWA Install Flow**: Custom banner with native dialog
- [x] **Haptic Feedback**: Vibration API integration
- [x] **Wake Lock**: Screen stays on during QR display
- [x] **Web Share API**: Native Android share sheet
- [x] **Material Design Motion**: Tab transitions & animations
- [x] **Categories**: Menu organized by categories
- [x] **Category Navigation**: Horizontal scrollable tabs
- [x] **Pull-to-Refresh Disabled**: Native app experience
- [x] **Standalone Mode**: Full-screen app without browser UI
- [x] **Portrait Lock**: Orientation locked for consistency
- [x] **Theme Integration**: Status bar matches app colors

### Future Enhancements

- [ ] **Export/Import**: JSON backup/restore
- [ ] **Images**: Add item photos
- [ ] **Multiple Currencies**: Support various symbols
- [ ] **Themes**: Dark mode, custom colors
- [ ] **Multi-language**: i18n support
- [ ] **Print Menu**: PDF generation

---

## 📂 Project Structure Explained

### Components

- **Shared Components**: Reusable UI primitives (Button, Input, Card)
- **Feature Components**: Domain-specific (MenuEditor, QRGenerator)
- **Layout Components**: Page-level composition

### Services

- **storageService**: Handles all browser storage operations
- **qrService**: QR code generation and decoding logic

### Hooks

- **useMenu**: Menu CRUD operations + auto-save
- **useQRCode**: QR generation state management
- **useLocalMenu**: Menu viewing from URL hash

### Utils

- **validation**: Input validation and formatting helpers

---

## 🐛 Troubleshooting

### Menu not saving?

- **Check**: Browser localStorage enabled
- **Fix**: Enable storage in browser settings

### QR code not generating?

- **Check**: Menu has at least one item
- **Fix**: Add items before generating QR

### Menu view not loading?

- **Check**: QR URL contains `#menu=` parameter
- **Fix**: Regenerate QR code from editor

---

## 📄 License

This project is **open source** and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Write meaningful commit messages
5. Test thoroughly
6. Submit pull request

---

## 💡 Credits

Built with ❤️ for small vendors and entrepreneurs.

**Technologies Used:**
- React Team - UI framework
- Vite Team - Build tooling
- Tailwind Labs - CSS framework
- Framer Motion - Animation library
- QR Code Library - soldair/node-qrcode

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review code comments

---

## 🎓 Learning Resources

This **MAD (Modern Application Development)** project demonstrates:
- ✅ Clean Architecture in React
- ✅ Custom Hooks patterns
- ✅ Service Layer abstraction
- ✅ Offline-first design
- ✅ Browser Storage APIs
- ✅ QR Code generation
- ✅ Responsive design with Tailwind
- ✅ **Progressive Web App (PWA) development**
- ✅ **Android System API integration**
- ✅ **Material Design motion patterns**
- ✅ **Haptic feedback & native features**
- ✅ **Framer Motion animations**
- ✅ Production-ready code structure

Perfect for learning modern Android-focused web development! 🚀

---

## 📚 Additional Documentation

- **[PWA_INSTALL_GUIDE.md](PWA_INSTALL_GUIDE.md)** - Complete PWA installation testing guide
- **[ANDROID_TESTING.md](ANDROID_TESTING.md)** - Android-specific features testing
- **[MATERIAL_MOTION.md](MATERIAL_MOTION.md)** - Material Design motion specifications
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions

---

## 🎯 MAD Project Highlights

This project showcases **Modern Application Development** principles:

### 1. **Native Android Experience**
- PWA with custom install flow
- System API integration (Wake Lock, Share, Vibration)
- Standalone mode with theme integration
- Portrait orientation lock
- Pull-to-refresh disabled

### 2. **Material Design 3**
- Emphasized easing curves ([0.2, 0.0, 0, 1])
- 400ms large area transitions
- Direction-aware slide animations
- Heavy spring physics (mass: 1.2)
- Stagger animations on category switch

### 3. **Progressive Enhancement**
- Works in any browser
- Enhanced experience on Android Chrome/Edge
- Graceful fallbacks for unsupported APIs
- Responsive across all screen sizes

### 4. **Mobile-First Architecture**
- Tab-based navigation
- Touch-optimized UI (44px+ tap targets)
- Haptic feedback on interactions
- Category-based menu organization
- Horizontal scrolling tabs

---
- ✅ Browser Storage APIs
- ✅ QR Code generation
- ✅ Responsive design with Tailwind
- ✅ Production-ready code structure

Perfect for learning modern React development! 🚀
