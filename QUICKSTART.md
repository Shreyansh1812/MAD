# QuickMenu - Quick Start Guide

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- QRCode library
- Lucide React icons

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

Static files will be generated in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

---

## 📱 User Guide

### Creating Your First Menu

1. **Open the app** - You'll see the Menu Editor interface
2. **Add an item**:
   - Enter item name (e.g., "Coffee")
   - Enter price (e.g., "3.50")
   - Click "Add Item"
3. **Preview updates** - See your menu in the preview panel
4. **Download QR** - Click "Download QR Code" button
5. **Share** - Print or display the QR code

### Editing Menu Items

- Click **Edit icon** (pencil) on any item
- Modify name or price
- Click **Check icon** to save
- Click **X icon** to cancel

### Deleting Items

- Click **Trash icon** on any item
- Confirm deletion in the dialog

---

## 🔧 Common Tasks

### Deploy to Static Hosting

**Netlify:**
```bash
# Build command
npm run build

# Publish directory
dist
```

**Vercel:**
```bash
vercel --prod
```

**GitHub Pages:**
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

### Test Offline Mode

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page
5. App should still work!

---

## 🐛 Troubleshooting

**Problem**: npm install fails
- **Solution**: Update Node.js to v16+ or v18+

**Problem**: Port 3000 already in use
- **Solution**: Change port in `vite.config.js` or kill process

**Problem**: QR code not downloading
- **Solution**: Check browser pop-up blocker settings

**Problem**: Menu not persisting
- **Solution**: Check if localStorage is enabled in browser

---

## 📊 File Structure Overview

```
MAD/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── pages/            # Page components
│   └── styles/           # CSS files
├── public/               # Static assets
├── index.html            # Entry HTML
├── package.json          # Dependencies
└── vite.config.js        # Build configuration
```

---

## 💡 Tips & Best Practices

1. **Keep menus focused** - Don't add too many items at once
2. **Use clear names** - Be specific about item names
3. **Test QR codes** - Always scan before distributing
4. **Update regularly** - Keep your menu current
5. **Print quality** - Use high-quality paper for QR codes

---

## 🎯 Next Steps

- Customize vendor name in `MenuPreview.jsx`
- Adjust styling in `tailwind.config.js`
- Add more validation rules in `utils/validation.js`
- Extend with categories or images

---

For detailed documentation, see [README.md](README.md)
