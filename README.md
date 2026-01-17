# QuickMenu - Offline QR Menu Generator

![QuickMenu Banner](https://img.shields.io/badge/Offline-Ready-success)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg)

**QuickMenu** is a production-ready, offline-first web application designed for small vendors, campus food stalls, and pop-up shops to create and share digital menus via QR codes—with **zero cost** and **no internet required**.

---

## 🎯 Core Features

### ✅ For Vendors
- **Simple Menu Management**: Add, edit, and delete menu items with validation
- **Real-time Preview**: See customer view as you edit
- **QR Code Generation**: Instantly create scannable QR codes
- **100% Offline**: Works without internet after initial load
- **Data Persistence**: Menu saved automatically to browser storage
- **Mobile-First**: Fully responsive design for all devices

### ✅ For Customers
- **Instant Access**: Scan QR to view menu immediately
- **Clean Interface**: Easy-to-read menu layout
- **Offline Viewing**: Menu embedded in QR code
- **Fast Loading**: Optimized for low-end devices

---

## 🏗️ Architecture

### Clean Architecture Principles

```
src/
├── components/          # UI Components (Single Responsibility)
│   ├── MenuEditor/      # Menu CRUD interface
│   ├── MenuPreview/     # Customer-facing preview
│   ├── QRGenerator/     # QR code generation & download
│   └── Shared/          # Reusable components
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Alert.jsx
│       └── EmptyState.jsx
├── hooks/               # Custom React Hooks
│   ├── useMenu.js       # Menu state management
│   ├── useQRCode.js     # QR generation logic
│   └── useLocalMenu.js  # Menu viewing from QR
├── services/            # Business Logic Layer
│   ├── storageService.js   # LocalStorage abstraction
│   └── qrService.js        # QR code operations
├── utils/               # Helper Functions
│   └── validation.js    # Input validation & formatting
├── pages/               # Page Components
│   ├── EditorPage.jsx   # Vendor interface
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
| **qrcode** | QR code generation |
| **lucide-react** | Icon library |
| **LocalStorage API** | Offline data persistence |

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

### Method 2: Service Worker (Future Enhancement)

Currently not implemented but can be added for true PWA support.

---

## 🚧 Future Enhancements

- [ ] **Service Worker**: True PWA with offline caching
- [ ] **Export/Import**: JSON backup/restore
- [ ] **Categories**: Group items by type
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
- QR Code Library - soldair/node-qrcode

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review code comments

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ Clean Architecture in React
- ✅ Custom Hooks patterns
- ✅ Service Layer abstraction
- ✅ Offline-first design
- ✅ Browser Storage APIs
- ✅ QR Code generation
- ✅ Responsive design with Tailwind
- ✅ Production-ready code structure

Perfect for learning modern React development! 🚀
