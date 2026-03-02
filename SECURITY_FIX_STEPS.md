# 🔒 Security Fix - Firebase Key Exposure

## ⚠️ ISSUE
Firebase credentials were exposed in `public/firebase-messaging-sw.js` and committed to GitHub.

## 🚨 IMMEDIATE ACTIONS (Do in order)

### 1. Revoke Exposed API Keys
1. Go to: https://console.firebase.google.com/
2. Select project: **quickmenu-a3**
3. Click ⚙️ Settings → Project settings
4. Under "Your apps" → Web apps → Find your app
5. Click "Regenerate API Key" or delete the old key
6. Create a new Web API key
7. Update firewall rules (see step 3)

**OR delete the entire project if no longer needed:**
- Go to: https://console.firebase.google.com/project/quickmenu-a3/settings/general
- Scroll down → "Delete Project"

### 2. Add Firebase Security Rules
For project **quickmenu-mad** (your current project):

```
Go to Firebase Console → Firestore Database → Rules
Add domain restrictions:
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Restrict API Key Usage
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select **quickmenu-mad** project
3. Find your API keys
4. Click on the API key
5. Under "Application restrictions" → Select "HTTP referrers"
6. Add your domains:
   - `https://mad-eosin.vercel.app/*`
   - `http://localhost:5173/*` (for development)
7. Save

### 4. Enable Firebase App Check (Recommended)
1. Go to: https://console.firebase.google.com/project/quickmenu-mad/appcheck
2. Click "Get Started"
3. Register your web app
4. Follow setup instructions

## 📝 WHAT I'LL FIX IN YOUR CODE

1. ✅ Remove hardcoded credentials from `firebase-messaging-sw.js`
2. ✅ Use environment variables properly
3. ✅ Add `.env` to commit (it's already in .gitignore - good!)
4. ✅ Update service worker to fetch config dynamically

## 🔍 WHY THIS HAPPENED

Service workers (SW) run in a separate context and can't access `import.meta.env`.
The old solution was to hardcode keys, but this is insecure for public repos.

## ✅ FIXED SOLUTION

Instead of hardcoding, we'll:
1. Generate the SW file dynamically during build
2. Or use a secure config endpoint
3. Or use Firebase App Check for additional security

Ready to fix? Type 'yes' and I'll update your code.
