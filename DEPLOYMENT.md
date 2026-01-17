# QuickMenu - Vercel Deployment Guide

## 📋 Prerequisites
- Node.js installed
- npm package manager
- Vercel account (free tier)

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
This will open your browser to authenticate with your Vercel account.

### 3. Deploy to Vercel
Navigate to your project directory and run:

```bash
# For production deployment
vercel --prod
```

Or for preview deployment:
```bash
vercel
```

### 4. Follow the CLI Prompts
The CLI will ask you:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time)
- **Project name?** → quickmenu (or press Enter for default)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

The deployment will start automatically!

## ⚙️ Build Configuration

Your `vercel.json` is already configured with:

✅ **Build Command**: `npm run build`  
✅ **Output Directory**: `dist`  
✅ **Framework**: Vite (auto-detected)

## 🔧 SPA Routing Configuration

The `vercel.json` includes:
- **Rewrites**: All routes redirect to `/index.html` (fixes 404 on refresh)
- **PWA Headers**: 
  - Service Worker (`sw.js`) with no-cache for instant updates
  - Manifest with correct MIME type
  - Static assets cached for 1 year (performance)

## 📱 PWA-Specific Headers

### Service Worker Headers
```json
{
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Service-Worker-Allowed": "/"
}
```
- Ensures service worker updates immediately on new deployments
- Allows SW to control the entire origin

### Manifest Headers
```json
{
  "Content-Type": "application/manifest+json",
  "Cache-Control": "public, max-age=0, must-revalidate"
}
```
- Correct MIME type for PWA manifest
- No caching for instant updates

### Static Assets
```json
{
  "Cache-Control": "public, max-age=31536000, immutable"
}
```
- Aggressive caching for hashed assets (performance)

## 🌐 Post-Deployment

After deployment, you'll receive:
- **Production URL**: `https://quickmenu.vercel.app` (or custom domain)
- **Preview URLs**: For each deployment

### Test Your PWA
1. Visit the production URL
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Check Manifest under Application → Manifest
5. Use Lighthouse to verify PWA score

### Install as App
On mobile/desktop:
- Chrome: Look for "Install QuickMenu" prompt
- Safari: Share → Add to Home Screen

## 🔄 Continuous Deployment

### Option 1: Git Integration (Recommended)
```bash
# Connect to GitHub
vercel git connect

# Push to main branch
git push origin main
```
Vercel auto-deploys on every push!

### Option 2: Manual CLI Deployment
```bash
# From project root
vercel --prod
```

## 📊 Environment Variables (If Needed)
```bash
# Add via CLI
vercel env add VARIABLE_NAME production

# Or via Vercel Dashboard
# Project Settings → Environment Variables
```

## 🛠️ Troubleshooting

### Service Worker Not Updating
- Clear browser cache (Ctrl+Shift+Delete)
- Check DevTools → Application → Service Workers → "Update on reload"

### 404 Errors on Refresh
- Verify `vercel.json` rewrites are correct
- Check build output in `dist/` folder

### Build Failures
```bash
# Test build locally first
npm run build

# Check build logs on Vercel dashboard
vercel logs
```

## 🎯 Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployment logs
vercel logs

# View project info
vercel inspect

# Remove deployment
vercel remove [deployment-url]

# Link local project to Vercel
vercel link
```

## 📈 Performance Tips

1. **Enable Vercel Analytics** (Free)
   - Go to Project Settings → Analytics
   - Add `@vercel/analytics` package

2. **Monitor with Vercel Speed Insights**
   ```bash
   npm install @vercel/speed-insights
   ```

3. **Custom Domain** (Optional)
   - Project Settings → Domains
   - Add your domain and update DNS

## ✅ Verification Checklist

- [ ] Service Worker registered and active
- [ ] Manifest loaded correctly
- [ ] App works offline (disconnect network)
- [ ] PWA installable on mobile/desktop
- [ ] No 404 errors on page refresh
- [ ] Lighthouse PWA score > 90

---

**Your QuickMenu PWA is now deployed! 🎉**

Share the QR code generated from your menu editor, and customers can access it offline!
