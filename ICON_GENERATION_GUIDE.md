# 🎨 Android App Icon Generation Guide

## Current Status
✅ PWA configuration updated in `vite.config.js`
⚠️ Placeholder icons created (need replacement with actual designs)

## Icon Requirements

### Required Icons
1. **icon-192.png** (192x192px) - Standard app icon
2. **icon-512.png** (512x512px) - High-res app icon
3. **icon-maskable-512.png** (512x512px) - Android adaptive icon with safe zone

### Design Guidelines

#### Standard Icons (192px & 512px)
- Use your full logo/branding
- Can extend to edges
- Transparent or solid background (brand color recommended)

#### Maskable Icon (512x512px)
- **Safe Zone**: Keep important content within central 80% circle
- **Padding**: 10% margin on all sides
- **Purpose**: Android crops this icon into various shapes (circle, square, rounded square)
- **Background**: Must be solid color (use #0ea5e9 - your brand color)

## How to Generate Icons

### Option 1: Use Figma/Canva
1. Create a 512x512px canvas
2. Design your logo with QuickMenu branding
3. For maskable icon:
   - Draw a circle that's 410px diameter (80% of 512px)
   - Keep all important elements inside this circle
   - Fill background with #0ea5e9

### Option 2: Use Online Tools

**PWA Asset Generator**
```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.svg public --icon-only --background "#0ea5e9"
```

**Favicon.io**
- Visit: https://favicon.io/favicon-converter/
- Upload your logo
- Download and rename files

**RealFaviconGenerator**
- Visit: https://realfavicongenerator.net/
- Upload your logo
- Configure Android settings with #0ea5e9 theme color
- Download and extract to `/public` folder

### Option 3: Manual Creation (Photoshop/GIMP)

**Standard Icons:**
1. Create 512x512px image
2. Add your QuickMenu logo
3. Export as PNG
4. Resize to 192x192px for smaller version

**Maskable Icon:**
1. Create 512x512px canvas
2. Fill background with #0ea5e9
3. Draw 410px diameter circle guide (centered)
4. Place logo/icon inside circle
5. Delete circle guide
6. Export as PNG

## Quick Design Template

```
512x512px Canvas
┌─────────────────────────────────┐
│  ←51px→                  ←51px→ │  10% margin
│    ┌─────────────────────┐      │
│    │                     │      │
│    │   Safe Zone (80%)   │      │
│    │   410px diameter    │      │
│    │                     │      │
│    │   📱 QuickMenu      │      │
│    │   Logo Here         │      │
│    │                     │      │
│    └─────────────────────┘      │
│                                 │
└─────────────────────────────────┘
```

## After Generating Icons

1. Replace placeholder files in `/public`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `icon-maskable-512.png` (512x512px - with safe zone)

2. Test your icons:
   - Run `npm run build`
   - Deploy to Vercel
   - Install PWA on Android device
   - Check app icon and splash screen

## Current Branding Configuration

**App Names:**
- **Full Name**: "QuickMenu - Offline Vendor Portal" (install prompt)
- **Short Name**: "QuickMenu" (home screen icon)

**Colors:**
- **Theme Color**: #0ea5e9 (Sky Blue)
- **Background Color**: #0ea5e9 (Splash screen)
- **Accent**: #8b5cf6 (Purple - from gradient)

**Display:**
- **Mode**: Standalone (no browser UI)
- **Orientation**: Portrait (locked)

## Testing Checklist

On Android device after deployment:
- [ ] Install PWA via "Add to Home Screen"
- [ ] Check home screen icon appears with correct name
- [ ] Launch app - verify splash screen with brand color
- [ ] Verify portrait orientation lock
- [ ] Check status bar color matches theme
- [ ] Verify standalone mode (no browser bar)

## Resources

- [Maskable.app Icon Editor](https://maskable.app/editor) - Test maskable icons
- [PWA Builder](https://www.pwabuilder.com/) - Generate all PWA assets
- [Figma Icon Template](https://www.figma.com/community/file/1020393971631469236)

---

**Note**: The placeholder icons are 1x1 pixel transparent PNGs. Replace them with actual 192x192 and 512x512 PNG icons before deploying to production!
