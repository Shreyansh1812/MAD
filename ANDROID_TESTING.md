# Android System Integration Testing Guide

## Features Implemented

### 1. **Wake Lock API** (QRGenerator Component)
Prevents screen from dimming while QR code is displayed

### 2. **Web Share API** (QRGenerator Component)
Native Android Share Sheet for sharing menu links

---

## Testing Instructions

### Prerequisites
- Android device (physical device recommended)
- Chrome/Edge browser on Android
- Same WiFi network for local testing

---

## Test 1: Wake Lock API

### What It Does
- Automatically activates when QR code is displayed
- Prevents screen from auto-dimming/sleeping
- Displays "Screen locked on - won't dim" indicator
- Auto-releases when you navigate away

### How to Test
1. Deploy or run preview server:
   ```bash
   npm run build
   npx vite preview --host
   ```

2. On Android device, open: `http://YOUR_IP:4173`

3. Add menu items and generate QR code

4. **Verify:**
   - ✅ Green badge appears: "Screen locked on - won't dim"
   - ✅ Screen stays bright even after 30+ seconds
   - ✅ No auto-lock timeout occurs

5. Navigate to another page
   - ✅ Wake lock releases automatically
   - ✅ Screen can dim normally again

### Browser Console Check (Optional)
Open DevTools and check console logs:
```
Wake Lock activated - screen will stay on
```

---

## Test 2: Web Share API

### What It Does
- Shows native Android Share Sheet when "Share Menu" is clicked
- Allows sharing via WhatsApp, SMS, Email, etc.
- Falls back to "Copy Link" on unsupported devices

### How to Test on Android

1. Make sure QR code is generated

2. Look for button at bottom:
   - **Android (Chrome/Edge):** "Share Menu" button (with Share icon)
   - **Desktop/Unsupported:** "Copy Link" button (with Copy icon)

3. Click **"Share Menu"** button

4. **Verify:**
   - ✅ Native Android Share Sheet appears
   - ✅ Shows apps: WhatsApp, Messages, Gmail, etc.
   - ✅ Can select any app to share the menu URL

5. Try sharing via WhatsApp:
   - ✅ URL appears in message: `https://mad-eosin.vercel.app/#/view?m=...`
   - ✅ Message includes: "Check out [Stall Name]'s menu! 🍽️"

6. Cancel the share dialog:
   - ✅ No error toast appears (user cancelled is handled gracefully)

### Test Fallback (Desktop/Unsupported)

1. On desktop browser, same steps
2. Button should show **"Copy Link"** instead of "Share Menu"
3. Click it:
   - ✅ Toast: "URL copied to clipboard! 📋"
   - ✅ Can paste the URL

---

## Test 3: Combined Experience

### Scenario: Vendor showing menu to customer

1. Vendor generates QR code
   - ✅ Wake lock activates → screen stays on
   - ✅ Green indicator badge appears

2. Vendor holds phone for customer to scan
   - ✅ Screen doesn't dim after 30 seconds
   - ✅ Customer can scan without rushing

3. Customer asks vendor to send link via WhatsApp
   - ✅ Vendor clicks "Share Menu"
   - ✅ Native Android share sheet opens
   - ✅ Vendor selects WhatsApp
   - ✅ Sends menu link to customer

4. Vendor navigates away
   - ✅ Wake lock releases
   - ✅ Phone returns to normal sleep behavior

---

## Browser Compatibility

| Feature | Chrome Android | Edge Android | Safari iOS | Desktop |
|---------|----------------|--------------|------------|---------|
| Wake Lock | ✅ | ✅ | ❌ | ✅ (Chrome/Edge) |
| Web Share | ✅ | ✅ | ✅ | ❌ (Fallback: Copy) |
| Haptic Feedback | ✅ | ✅ | ❌ | ❌ |

---

## API Detection in Console

Open browser console on Android:

```javascript
// Check Wake Lock support
console.log('Wake Lock:', 'wakeLock' in navigator);

// Check Web Share support
console.log('Web Share:', 'share' in navigator);

// Test share manually
navigator.share({
  title: 'Test',
  text: 'Testing share',
  url: 'https://example.com'
});
```

---

## Common Issues & Solutions

### Wake Lock Not Working
- **Issue:** Screen still dims
- **Fix:** Check if HTTPS is enabled (required for Wake Lock API)
- **Fix:** Ensure you're using Chrome/Edge on Android

### Share Button Shows "Copy Link" on Android
- **Issue:** Web Share API not detected
- **Fix:** Update Chrome to latest version
- **Fix:** Check if site is served over HTTPS

### Wake Lock Indicator Not Showing
- **Issue:** Green badge missing
- **Fix:** Check browser console for errors
- **Fix:** Ensure QR code is fully generated (not loading)

---

## Deployment Note

For production testing on real Android devices:

```bash
vercel --prod
```

Then test on actual Android phone with the deployed URL. PWA features work best in production HTTPS environment.

---

## Quick Test Checklist

- [ ] Wake lock activates when QR appears
- [ ] Green "Screen locked on" badge shows
- [ ] Screen doesn't auto-dim after 1+ minute
- [ ] "Share Menu" button appears (Android Chrome/Edge)
- [ ] Native share sheet opens on click
- [ ] Can share via WhatsApp/SMS/Email
- [ ] Cancel share doesn't show error
- [ ] Wake lock releases when navigating away
- [ ] Fallback "Copy Link" works on desktop
