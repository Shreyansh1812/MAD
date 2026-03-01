# QuickMenu - Component Structure Diagram

## 📊 Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            App.jsx                                  │
│                    (Main Application Root)                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                     UserProvider                              │ │
│  │              (Global State Management)                        │ │
│  │                                                               │ │
│  │  State:                                                       │ │
│  │  • currentUser, authLoading                                   │ │
│  │  • menuItems, stallData                                       │ │
│  │  • isLoading, error                                           │ │
│  │                                                               │ │
│  │  Operations:                                                  │ │
│  │  • loadMenu(), addItem(), updateItem()                        │ │
│  │  • deleteItem(), updateStallData(), logout()                  │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │               BrowserRouter                             │ │ │
│  │  │          (React Router Provider)                        │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌───────────────────────────────────────────────────┐ │ │ │
│  │  │  │              AppRoutes                            │ │ │ │
│  │  │  │          (Route Configuration)                    │ │ │ │
│  │  │  │                                                   │ │ │ │
│  │  │  │  Public Routes:                                   │ │ │ │
│  │  │  │  ├─ /login → LoginScreen / RegisterScreen        │ │ │ │
│  │  │  │  └─ /view → PublicMenuView                       │ │ │ │
│  │  │  │                                                   │ │ │ │
│  │  │  │  Protected Routes (requires auth):                │ │ │ │
│  │  │  │  └─ /dashboard → DashboardLayout                 │ │ │ │
│  │  │  │       │                                           │ │ │ │
│  │  │  │       ├─ /editor → EditorPageNew                 │ │ │ │
│  │  │  │       ├─ /preview → PreviewPage                  │ │ │ │
│  │  │  │       ├─ /qr → QRPage                            │ │ │ │
│  │  │  │       ├─ /account → AccountPage                  │ │ │ │
│  │  │  │       └─ /edit/:itemId → ItemEditScreen          │ │ │ │
│  │  │  └───────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       USER INTERACTION                           │
│                  (Add/Edit/Delete Menu Item)                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      COMPONENT LAYER                             │
│        (EditorPageNew, ItemEditScreen, etc.)                     │
│                                                                  │
│        Calls: addItem(), updateItem(), deleteItem()              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      USERCONTEXT LAYER                           │
│                 (Global State Manager)                           │
│                                                                  │
│  1. Validates input                                              │
│  2. Calls Firebase service                                       │
│  3. Updates local state: setMenuItems()                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│                 (menuCRUDService.js)                             │
│                                                                  │
│        Firebase Firestore operations                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FIREBASE BACKEND                            │
│            (Firestore Database + Authentication)                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      STATE UPDATE                                │
│         setMenuItems(prev => [...prev, newItem])                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      REACT RE-RENDER                             │
│                                                                  │
│  All components consuming menuItems automatically update:        │
│                                                                  │
│  ✅ EditorPageNew → Shows updated list                           │
│  ✅ PreviewPage → Displays new menu                              │
│  ✅ QRPage → Regenerates QR code                                 │
│  ✅ AccountPage → Updates statistics                             │
│  ✅ ItemEditScreen → Has latest data                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Hierarchy

```
App
└── UserProvider (Context)
    └── BrowserRouter (Routing)
        └── Routes
            │
            ├── /login
            │   ├── LoginScreen
            │   └── RegisterScreen
            │
            ├── /view (Public Menu View)
            │   └── PublicMenuView
            │       └── MenuViewPage
            │
            └── /dashboard (Protected)
                └── DashboardLayout
                    │
                    ├── Outlet (Child Routes)
                    │   │
                    │   ├── EditorPageNew
                    │   │   ├── StallSettings
                    │   │   └── MenuEditor
                    │   │       └── MenuItemCard[]
                    │   │
                    │   ├── PreviewPage
                    │   │   └── MenuPreview
                    │   │       └── CategorySection[]
                    │   │           └── MenuItem[]
                    │   │
                    │   ├── QRPage
                    │   │   └── QRGenerator
                    │   │       └── QRCodeCanvas
                    │   │
                    │   ├── AccountPage
                    │   │   ├── UserInfo
                    │   │   ├── Statistics
                    │   │   └── LogoutButton
                    │   │
                    │   └── ItemEditScreen
                    │       ├── ItemForm
                    │       ├── SaveButton
                    │       └── DeleteButton
                    │
                    └── BottomNavigation
                        ├── NavItem (Editor)
                        ├── NavItem (Preview)
                        ├── NavItem (QR)
                        └── NavItem (Account)
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│  App Start  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Firebase Auth Listener     │
│  onAuthStateChanged()       │
└──────┬──────────────────────┘
       │
       ├─── User Authenticated? ─── No ──► LoginScreen
       │                                      │
       │                                      ├─► Login Success
       │                                      │       │
       │                                      │       ▼
       │                                      │   Set currentUser
       │                                      │       │
       │                                      └─► Register ──► RegisterScreen
       │                                                              │
       │                                                              ▼
       │                                                      Registration Success
       │                                                              │
       Yes                                                            │
       │                                                              │
       ▼                                                              │
┌─────────────────────────────┐                                      │
│  Load User Menu Data        │ ◄────────────────────────────────────┘
│  loadMenu()                 │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Render Dashboard           │
│  with BottomNavigation      │
└─────────────────────────────┘
```

---

## 🗺️ Navigation Map

```
                        ┌──────────────┐
                        │     App      │
                        │      /       │
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────┐            ┌──────────────────┐
        │   /login     │            │   /dashboard     │
        │ (LoginScreen)│            │ (DashboardLayout)│
        └──────────────┘            └─────────┬────────┘
                                              │
                ┌────────────┬────────────────┼────────────┬────────────┐
                │            │                │            │            │
                ▼            ▼                ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │ /editor  │  │ /preview │  │   /qr    │  │ /account │  │ /edit/:itemId│
        │(EditorNew)  │(Preview) │  │  (QR)    │  │(Account) │  │ (ItemEdit)   │
        └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘
             │                                                           ▲
             │                                                           │
             └─────────────────── Click Edit Item ──────────────────────┘
```

---

## 🎯 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        UserContext                              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Auth     │  │    Menu     │  │      Operations         │ │
│  │   State     │  │   State     │  │                         │ │
│  │             │  │             │  │  • loadMenu()           │ │
│  │ • currentUser  │ • menuItems │  │  • addItem()            │ │
│  │ • authLoading  │ • stallData │  │  • updateItem()         │ │
│  │             │  │ • isLoading │  │  • deleteItem()         │ │
│  │             │  │ • error     │  │  • updateStallData()    │ │
│  │             │  │             │  │  • logout()             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Provides state via useContext()
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  EditorPage   │ │  PreviewPage  │ │   QRPage      │
│               │ │               │ │               │
│ useUserContext│ │ useUserContext│ │ useUserContext│
│  ↓           │ │  ↓           │ │  ↓           │
│ menuItems    │ │ menuItems    │ │ menuItems    │
│ addItem()    │ │              │ │              │
│ updateItem() │ │              │ │              │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 📱 Screen Navigation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Editor     │────►│   Preview    │────►│   QR Code    │
│              │     │              │     │              │
│ • Add Item   │     │ • View Menu  │     │ • Generate   │
│ • Edit Item  │     │ • Categories │     │ • Download   │
│ • Delete Item│     │ • Search     │     │ • Share      │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │                     ▲                     ▲
       │                     │                     │
       │                     ├─────────────────────┤
       │                     │                     │
       │              ┌──────┴──────┐              │
       │              │   Account   │              │
       │              │             │              │
       │              │ • Profile   │              │
       │              │ • Stats     │              │
       │              │ • Logout    │              │
       │              └─────────────┘              │
       │                                           │
       │                                           │
       └───► Click Edit ───► ItemEditScreen ──────┘
                              │
                              • Edit Name
                              • Edit Price
                              • Toggle Veg
                              • Save/Delete
```

---

## 🔧 Hook Dependencies

```
UserContext
    │
    ├── useState (menuItems)
    ├── useState (stallData)
    ├── useState (currentUser)
    ├── useState (authLoading)
    │
    ├── useEffect (auth listener)
    │
    └── useCallback
        ├── loadMenu()
        ├── addItem()
        ├── updateItem()
        ├── deleteItem()
        └── logout()

Components
    │
    ├── useUserContext()  ←─── Custom hook to access UserContext
    ├── useNavigate()     ←─── React Router navigation
    ├── useParams()       ←─── React Router params
    ├── useLocation()     ←─── React Router location
    ├── useToast()        ←─── Custom toast notifications
    ├── useHaptics()      ←─── Custom haptic feedback
    └── usePWAInstall()   ←─── Custom PWA install prompt
```

---

## 🚀 Build & Deploy Flow

```
┌──────────────┐
│ Source Code  │
│  (src/*)     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Vite Build   │
│ npm run build│
└──────┬───────┘
       │
       ├─► Transpile JSX → JS
       ├─► Bundle modules
       ├─► Optimize assets
       ├─► Generate service worker
       └─► Create manifest
       │
       ▼
┌──────────────┐
│ dist/ folder │
│              │
│ • index.html │
│ • assets/    │
│ • sw.js      │
│ • manifest   │
└──────┬───────┘
       │
       ├─► Deploy to Vercel
       ├─► Deploy to Netlify
       └─► Deploy to Firebase Hosting
       │
       ▼
┌──────────────┐
│ Live PWA App │
│ quickmenu.app│
└──────────────┘
```

---

## 📊 Performance Optimization

```
App Level:
├── Code Splitting (React.lazy)
├── Tree Shaking (Vite)
├── Minification (Rollup)
└── Compression (gzip)

Component Level:
├── useMemo (expensive calculations)
├── useCallback (function memoization)
├── React.memo (component memoization)
└── Virtual scrolling (long lists)

State Management:
├── Context splitting (separate contexts)
├── Selector pattern (pick specific state)
└── Local state when possible

Network:
├── Service Worker caching
├── Firebase offline persistence
├── Optimistic UI updates
└── Background sync
```

---

This diagram represents the complete structure of your Practical 08 implementation! 🎉
