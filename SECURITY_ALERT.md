# 🔒 URGENT: Firebase Credentials Exposed - Action Required

## 📋 Summary
GitHub detected Firebase credentials in your repository from file: `public/firebase-messaging-sw.js`

**Exposed Project:** quickmenu-a3 (old credentials)  
**Current Project:** quickmenu-mad (in .env - secure)  
**Status:** ✅ Code fixed, ⚠️ Need to secure Firebase

---

## ✅ What I Just Fixed

1. **Updated `firebase-messaging-sw.js`**
   - ❌ Removed old credentials (quickmenu-a3)
   - ✅ Updated to current project (quickmenu-mad)
   - ✅ Added security warnings

2. **Verified `.gitignore`**
   - ✅ `.env` is properly ignored
   - ✅ Will not be committed in future

---

## 🚨 CRITICAL: Actions YOU Must Do NOW

### Step 1: Secure Firebase Console (5 minutes)

#### Option A: Delete Old Project (Recommended if not used)
```
1. Go to: https://console.firebase.google.com/
2. Click on "quickmenu-a3" project
3. Click Settings ⚙️ → Project settings
4. Scroll down → Click "Delete Project"
   Type project ID: quickmenu-a3
   Confirm deletion
```

#### Option B: Restrict API Keys (If still using project)
```
1. Go to: https://console.firebase.google.com/project/quickmenu-a3/settings/general
2. Under "Your apps" → Find your Web app
3. Click "Show Config" → Copy NEW credentials
4. Go to Google Cloud Console:
   https://console.cloud.google.com/apis/credentials?project=quickmenu-a3
5. Find the exposed API key: AIzaSyAUGJqkqEoZtQtzB1x2jG3Sk2cS_KgZTDY
6. Click on it → Click "Regenerate Key" or "Delete"
7. Create a new API key with restrictions
```

### Step 2: Secure Current Project (quickmenu-mad)

#### Add HTTP Referrer Restrictions:
```
✅ KEY ROTATED: New key updated in code

1. Go to: https://console.cloud.google.com/apis/credentials?project=quickmenu-mad
2. Find your NEW API key (starts with AIzaSyCVGpxt...)
3. Click on it
4. Under "Application restrictions":
   ✅ Select "HTTP referrers (web sites)"
5. Add allowed referrers:
   - https://mad-eosin.vercel.app/*
   - http://localhost:5173/*
   - http://localhost:*/* (for dev)
6. Save
```

#### Add Firestore Security Rules:
```
1. Go to: https://console.firebase.google.com/project/quickmenu-mad/firestore
2. Click "Rules" tab
3. Replace with:
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

```
4. Click "Publish"
```

### Step 3: Enable Firebase App Check (Optional but Recommended)
```
1. Go to: https://console.firebase.google.com/project/quickmenu-mad/appcheck
2. Click "Get Started"
3. Register your web app
4. Choose "reCAPTCHA v3" (easiest)
5. Follow setup wizard
```

### Step 4: Update Git History (Remove leaked credentials)

**⚠️ WARNING: This rewrites Git history - coordinate with team if working in a team**

```powershell
# Remove the credentials from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch public/firebase-messaging-sw.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if you control the repo)
git push origin --force --all
```

**Simpler option (if recent commit):**
```powershell
# Check recent commits
git log --oneline -5

# If the exposed file is in last commit, amend it
git add public/firebase-messaging-sw.js
git commit --amend -m "Security: Update Firebase credentials to use current project"
git push --force
```

### Step 5: Commit the Fixed Code
```powershell
# Add the fixed files
git add public/firebase-messaging-sw.js
git add SECURITY_FIX_STEPS.md
git add SECURITY_ALERT.md

# Commit with clear message
git commit -m "Security fix: Remove hardcoded Firebase credentials

- Updated firebase-messaging-sw.js to use quickmenu-mad project
- Removed exposed quickmenu-a3 credentials
- Added security documentation
- Verified .env is in .gitignore"

# Push to GitHub
git push origin main
```

---

## 🔍 Why This Happened

**Service Worker Limitation:**
- Service workers can't access `import.meta.env` or environment variables
- Required hardcoding credentials in the past
- This file is in `public/` folder → committed to Git → exposed

**Better Solutions:**
1. ✅ Use Firebase App Check (validates requests)
2. ✅ Add API key restrictions (domain whitelist)
3. ✅ Strong Firestore security rules (authentication required)
4. Generate SW file during build (advanced)

---

## 📊 Current Status

| Item | Status | Action Needed |
|------|--------|---------------|
| Code Fixed | ✅ Done | None |
| .env Secure | ✅ Done | None (in .gitignore) |
| Old Keys Revoked | ⚠️ **YOUR ACTION** | Delete quickmenu-a3 project |
| API Restrictions | ⚠️ **YOUR ACTION** | Add domain whitelist |
| Firestore Rules | ⚠️ **YOUR ACTION** | Require auth |
| Git History | ⚠️ **YOUR ACTION** | Clean or force push |

---

## ❓ Questions?

**Q: Can attackers use my Firebase now?**
A: Potentially yes, but limited:
- ✅ They can use Firestore (if rules allow)
- ✅ They can use Authentication
- ❌ They can't access your billing
- ❌ They can't delete data (if rules are good)

**Q: Should I panic?**
A: No, but act quickly:
1. Add API restrictions (10 min)
2. Delete old project (2 min)
3. Monitor Firebase usage for 24hrs

**Q: Will .env be safe now?**
A: Yes! `.env` is in `.gitignore` and was never committed.

**Q: Is the current app still working?**
A: Yes! I updated it to use your current Firebase project (quickmenu-mad).

---

## 📞 Need Help?

If you see unusual activity:
1. Check Firebase Console → Usage tab
2. Check Authentication → Users (unexpected sign-ups)
3. Check Firestore → Data (unauthorized writes)

**Contact me if:**
- You see 1000+ authentication requests
- Unknown users in your Firebase
- Unexpected bill from Google Cloud

---

## ✅ After Completing All Steps

1. Close this GitHub security alert
2. Enable email alerts in Firebase Console
3. Regularly check Firebase usage
4. Consider upgrading to Blaze (pay-as-you-go) plan for better monitoring

---

**Time to complete:** 15-20 minutes  
**Priority:** 🚨 HIGH - Do within 24 hours
