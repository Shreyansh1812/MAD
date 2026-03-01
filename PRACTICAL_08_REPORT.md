# Practical 08: Multi-Screen Navigation & Global State Management

## 📚 Lab Report - QuickMenu PWA

**Student Name:** [Your Name]  
**Course:** Mobile Application Development (MAD)  
**Practical:** 08 - Multi-Screen Navigation & State Management  
**Date:** February 19, 2026

---

## 🎯 Objectives Achieved

✅ **Objective 1:** Implement global state management using React Context API  
✅ **Objective 2:** Create multi-screen navigation with React Router  
✅ **Objective 3:** Demonstrate data passing via route parameters  
✅ **Objective 4:** Handle CRUD operations with immediate state updates  
✅ **Objective 5:** Implement mobile-friendly navigation UI  
✅ **Objective 6:** Compare with Android/Flutter architecture patterns

---

## 🏗️ Architecture Overview

### System Architecture

```
QuickMenu PWA (React + Firebase)
│
├── Global State Layer (UserContext)
│   ├── Authentication State (currentUser, authLoading)
│   ├── Menu State (menuItems, stallData)
│   └── CRUD Operations (addItem, updateItem, deleteItem)
│
├── Navigation Layer (React Router)
│   ├── Public Routes (/view - QR code menu viewer)
│   ├── Auth Routes (/login - authentication)
│   └── Protected Routes (/dashboard/* - vendor dashboard)
│
└── UI Layer
    ├── DashboardLayout (Bottom Navigation wrapper)
    ├── Editor Screen
    ├── Preview Screen
    ├── QR Code Screen
    ├── Account Screen
    └── Item Edit Screen
```

---

## 🔑 Key Implementation Details

### 1. Global State Management - UserContext

**File:** `src/contexts/UserContext.jsx`

**Purpose:** Centralized state container for user authentication and menu data

**Key Features:**
- Single source of truth for app-wide state
- Automatic UI updates when state changes
- Similar to Android ViewModel + LiveData pattern
- Equivalent to Flutter Provider pattern

**State Structure:**
```javascript
{
  // Authentication
  currentUser: User | null,
  authLoading: boolean,
  
  // Menu Data
  menuItems: MenuItem[],
  stallData: { stallName: string, waitTime: number },
  isLoading: boolean,
  error: string | null,
  
  // Operations
  loadMenu: () => Promise<void>,
  addItem: (item) => Promise<Result>,
  updateItem: (id, updates) => Promise<Result>,
  deleteItem: (id) => Promise<boolean>,
  updateStallData: (data) => void,
  logout: () => Promise<void>
}
```

**Usage in Components:**
```javascript
import { useUserContext } from '../contexts/UserContext';

function MyComponent() {
  const { menuItems, addItem, currentUser } = useUserContext();
  // Access global state and operations
}
```

---

### 2. Multi-Screen Navigation - React Router

**File:** `src/App.jsx`

**Route Structure:**

| Route | Type | Component | Description |
|-------|------|-----------|-------------|
| `/` | Redirect | - | Redirects to /dashboard or /login |
| `/login` | Public | LoginScreen | Authentication |
| `/view?m=...` | Public | MenuViewPage | QR code menu viewer (no auth) |
| `/dashboard` | Protected | DashboardLayout | Root dashboard with bottom nav |
| `/dashboard/editor` | Protected | EditorPageNew | Menu editing screen |
| `/dashboard/preview` | Protected | PreviewPage | Live preview of menu |
| `/dashboard/qr` | Protected | QRPage | QR code generation |
| `/dashboard/account` | Protected | AccountPage | User profile & logout |
| `/dashboard/edit/:itemId` | Protected | ItemEditScreen | Edit specific item |

**Protected Route Implementation:**
```javascript
const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useUserContext();
  
  if (authLoading) return <LoadingScreen />;
  return currentUser ? children : <Navigate to="/login" />;
};
```

---

### 3. Data Passing - Route Parameters

**File:** `src/pages/ItemEditScreen.jsx`

**Demonstration:** Passing `itemId` from Editor to Edit Screen

**Method 1: URL Parameters (Preferred)**
```javascript
// Navigation
navigate(`/dashboard/edit/${item.id}`);

// Access in ItemEditScreen
const { itemId } = useParams();
const item = menuItems.find(m => m.id === itemId);
```

**Method 2: Navigation State (Alternative)**
```javascript
// Navigation with state
navigate(`/dashboard/edit/${item.id}`, {
  state: { item: selectedItem }
});

// Access in ItemEditScreen
const location = useLocation();
const item = location.state?.item;
```

---

### 4. CRUD State Handling - Immediate Updates

**Scenario:** User adds item in Editor → Preview auto-refreshes

**Flow:**
1. **User Action:** Click "Add Item" in MenuEditor component
2. **Global Operation:** Calls `addItem()` from UserContext
3. **Firebase Update:** Item saved to Firestore
4. **State Update:** `setMenuItems(prev => [...prev, newItem])`
5. **UI Refresh:** All components using `menuItems` re-render automatically
6. **Result:** Preview screen shows new item without manual refresh!

**Code Example:**
```javascript
// In UserContext
const addItem = async (item) => {
  const result = await addMenuItem(item); // Firebase
  
  if (result.success) {
    // IMMEDIATE GLOBAL UPDATE
    setMenuItems(prev => [...prev, result.data]);
  }
  
  return result;
};

// In Preview Screen (automatically receives updates)
const PreviewPage = () => {
  const { menuItems } = useUserContext(); // Auto-updates!
  return <MenuPreview menuItems={menuItems} />;
};
```

---

### 5. Navigation UI - Bottom Navigation Bar

**File:** `src/components/Navigation/BottomNavigation.jsx`

**Features:**
- ✅ Fixed bottom position (mobile-friendly)
- ✅ Active tab indicator with smooth animation
- ✅ Haptic feedback on tap
- ✅ Safe area support for iOS notch
- ✅ Icon + label design (Material Design)

**Navigation Items:**
- **Editor** (Edit3 icon) → `/dashboard/editor`
- **Preview** (Eye icon) → `/dashboard/preview`
- **QR Code** (QrCode icon) → `/dashboard/qr`
- **Account** (User icon) → `/dashboard/account`

**Implementation Highlights:**
```javascript
const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavClick = (path) => {
    lightTap(); // Haptic feedback
    navigate(path);
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      {/* Navigation items with active indicator */}
    </nav>
  );
};
```

---

## 🆚 Cross-Platform Architecture Comparison

### State Management Patterns

| Concept | React Context | Android ViewModel | Flutter Provider |
|---------|---------------|-------------------|------------------|
| **State Container** | Context + useState | ViewModel + LiveData | ChangeNotifier |
| **State Update** | `setState()` | `liveData.postValue()` | `notifyListeners()` |
| **State Access** | `useContext()` hook | `observe()` / `collectAsState()` | `Provider.of()` / `watch()` |
| **Lifecycle** | Component tree scope | Fragment/Activity scope | Widget tree scope |
| **Persistence** | Lost on unmount | Survives config changes | Lost on disposal |
| **Testing** | Easy (inject mock context) | Easy (test ViewModel) | Easy (test Provider) |

**Example Comparison:**

**React Context:**
```javascript
const UserContext = createContext();
const [items, setItems] = useState([]);

// Update
setItems(prev => [...prev, newItem]);

// Access
const { items } = useContext(UserContext);
```

**Android ViewModel:**
```kotlin
class MenuViewModel : ViewModel() {
    private val _items = MutableLiveData<List<MenuItem>>()
    val items: LiveData<List<MenuItem>> = _items
    
    fun addItem(item: MenuItem) {
        _items.postValue(_items.value + item)
    }
}

// Access
viewModel.items.observe(viewLifecycleOwner) { items ->
    updateUI(items)
}
```

**Flutter Provider:**
```dart
class MenuProvider extends ChangeNotifier {
  List<MenuItem> _items = [];
  List<MenuItem> get items => _items;
  
  void addItem(MenuItem item) {
    _items.add(item);
    notifyListeners();
  }
}

// Access
final items = Provider.of<MenuProvider>(context).items;
// or
final items = context.watch<MenuProvider>().items;
```

---

### Navigation Patterns

| Feature | React Router | Android Navigation | Flutter Navigator |
|---------|--------------|-------------------|-------------------|
| **Declaration** | `<Routes>` JSX | XML NavGraph | `routes` Map |
| **Navigation** | `useNavigate()` | `navController.navigate()` | `Navigator.pushNamed()` |
| **Parameters** | `useParams()` | Safe Args / Bundle | Route arguments |
| **Back Stack** | Automatic | Automatic | Automatic |
| **Deep Links** | Supported | Supported | Supported |
| **Nested Routes** | `<Outlet>` | Nested graphs | Nested navigators |

**Navigation Comparison:**

**React Router:**
```javascript
// Define routes
<Route path="/edit/:id" element={<EditScreen />} />

// Navigate
navigate('/edit/123');

// Access params
const { id } = useParams();
```

**Android Navigation:**
```kotlin
// NavGraph XML
<fragment android:id="@+id/editFragment">
    <argument android:name="itemId" />
</fragment>

// Navigate
findNavController().navigate(
    EditFragmentDirections.actionToEdit(itemId = "123")
)

// Access params
val args: EditFragmentArgs by navArgs()
val id = args.itemId
```

**Flutter Navigator:**
```dart
// Define routes
routes: {
  '/edit': (context) => EditScreen(),
}

// Navigate
Navigator.pushNamed(
  context, 
  '/edit', 
  arguments: {'id': '123'}
);

// Access params
final args = ModalRoute.of(context)!.settings.arguments;
final id = args['id'];
```

---

### Bottom Navigation Patterns

| Platform | Component | Implementation |
|----------|-----------|----------------|
| **React** | Custom component + Router | Manually managed with `useLocation()` |
| **Android** | `BottomNavigationView` | Auto-syncs with NavController |
| **Flutter** | `BottomNavigationBar` | Manually managed with `currentIndex` |

**Android BottomNavigationView:**
```xml
<com.google.android.material.bottomnavigation.BottomNavigationView
    app:menu="@menu/bottom_nav_menu" />
```

```kotlin
bottomNav.setupWithNavController(navController)
```

**Flutter BottomNavigationBar:**
```dart
Scaffold(
  bottomNavigationBar: BottomNavigationBar(
    currentIndex: _selectedIndex,
    onTap: (index) => setState(() => _selectedIndex = index),
    items: [
      BottomNavigationBarItem(icon: Icon(Icons.edit), label: 'Editor'),
      BottomNavigationBarItem(icon: Icon(Icons.visibility), label: 'Preview'),
    ],
  ),
)
```

---

## 📊 State Update Flow Visualization

### Scenario: Adding a Menu Item

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTION                              │
│              Click "Add Item" in MenuEditor                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                              │
│        MenuEditor calls: addItem(newItem)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXT LAYER                                │
│       UserContext.addItem() → validates & processes             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│         menuCRUDService.addMenuItem() → Firebase                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                           │
│              Document created in Firestore                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATE UPDATE                                 │
│      setMenuItems(prev => [...prev, newItem])                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT RE-RENDER                              │
│    All components using menuItems re-render automatically      │
│                                                                 │
│    ✅ MenuEditor → Shows new item in list                      │
│    ✅ PreviewPage → Displays updated menu                      │
│    ✅ QRPage → Regenerates QR with new data                    │
│    ✅ AccountPage → Updates item count                         │
└─────────────────────────────────────────────────────────────────┘
```

**Android Equivalent (ViewModel + LiveData):**
```
User Action → Fragment calls ViewModel.insert() → 
Repository saves to Room DB → 
ViewModel updates LiveData.postValue() →
LiveData observers notified → 
UI updates automatically
```

**Flutter Equivalent (Provider):**
```
User Action → Widget calls Provider.addItem() → 
Provider updates internal state → 
notifyListeners() called →
Consumer widgets rebuild →
UI updates automatically
```

---

## 🔄 Data Flow Architecture

### Read Flow (Loading Menu)

```
App Start
    │
    ▼
UserContext mounted
    │
    ▼
onAuthStateChanged listener
    │
    ▼
User authenticated?
    │
    ├─ No → Show Login Screen
    │
    └─ Yes → loadMenu()
              │
              ▼
        getMenuData() (Firebase)
              │
              ▼
        setMenuItems(data.items)
        setStallData(data.stallData)
              │
              ▼
        All screens render with data
```

### Write Flow (CRUD Operations)

```
User edits item
    │
    ▼
Component calls updateItem(id, changes)
    │
    ▼
Context validates changes
    │
    ▼
Firebase update (removeMenuItem + addMenuItem)
    │
    ▼
Update local state immediately
    │
    ▼
All subscribed components re-render
    │
    ▼
User sees changes across all screens instantly!
```

---

## 🎨 UI/UX Design Decisions

### Mobile-First Approach

1. **Bottom Navigation:** 
   - Positioned at bottom for easy thumb access
   - Fixed position for always-visible navigation
   - Safe area support for iPhone notch

2. **Haptic Feedback:**
   - Light tap on navigation (15ms vibration)
   - Success pulse on CRUD operations (30ms)
   - Error pulse on validation failure (50ms double tap)

3. **Animations:**
   - Smooth page transitions (Framer Motion)
   - Spring animations for natural feel
   - Active tab indicator slide effect

4. **Responsive Design:**
   - Mobile-optimized layouts
   - Touch-friendly button sizes (min 44px)
   - Gradient backgrounds for visual appeal

---

## 🧪 Testing Strategy

### State Management Testing
```javascript
// Mock UserContext for component testing
const mockContext = {
  menuItems: [],
  addItem: jest.fn(),
  currentUser: { uid: 'test123', email: 'test@test.com' }
};

<UserContext.Provider value={mockContext}>
  <ComponentToTest />
</UserContext.Provider>
```

### Navigation Testing
```javascript
// Test route protection
test('redirects to login when not authenticated', () => {
  render(<ProtectedRoute><Dashboard /></ProtectedRoute>);
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

### Integration Testing
```javascript
// Test end-to-end flow
test('adding item updates all screens', async () => {
  // 1. Add item in editor
  await addItem({ name: 'Dosa', price: 60 });
  
  // 2. Navigate to preview
  navigate('/dashboard/preview');
  
  // 3. Verify item appears
  expect(screen.getByText('Dosa')).toBeInTheDocument();
});
```

---

## 📈 Performance Considerations

### Optimization Strategies

1. **Memoization:**
   ```javascript
   const menuItems = useMemo(() => items.filter(i => i.isAvailable), [items]);
   ```

2. **Lazy Loading:**
   ```javascript
   const ItemEditScreen = lazy(() => import('./pages/ItemEditScreen'));
   ```

3. **Debouncing:**
   ```javascript
   const debouncedSearch = useDebounce(searchTerm, 300);
   ```

4. **Virtual Scrolling:**
   - For long menu lists (100+ items)
   - Use react-window or react-virtualized

---

## 🔒 Security Best Practices

1. **Protected Routes:** Require authentication for dashboard
2. **Firebase Rules:** Server-side data validation
3. **Input Sanitization:** Validate all user inputs
4. **Public View Route:** No authentication required for `/view` (QR code sharing)

---

## 🚀 Deployment & PWA Features

### Progressive Web App (PWA)
- ✅ Offline-first architecture
- ✅ Service Worker for caching
- ✅ Add to Home Screen
- ✅ Push notifications (future)
- ✅ Background sync (future)

### Deployment Platforms
- **Vercel:** `vercel deploy`
- **Netlify:** `netlify deploy`
- **Firebase Hosting:** `firebase deploy`

---

## 📝 Learning Outcomes

### Skills Demonstrated

1. ✅ **Global State Management:** Implemented React Context API
2. ✅ **Navigation System:** React Router with nested routes
3. ✅ **Data Passing:** URL params and navigation state
4. ✅ **CRUD with Real-time Updates:** Immediate UI refresh on state change
5. ✅ **Mobile UI Patterns:** Bottom navigation with animations
6. ✅ **Cross-Platform Thinking:** Compared React, Android, Flutter architectures

### Challenges Overcome

1. **Challenge:** How to share state between disconnected screens?
   - **Solution:** UserContext provider wrapping entire app

2. **Challenge:** How to protect routes requiring authentication?
   - **Solution:** ProtectedRoute wrapper component

3. **Challenge:** How to pass item ID to edit screen?
   - **Solution:** URL parameters with useParams() hook

4. **Challenge:** How to ensure Preview updates when Editor changes data?
   - **Solution:** Global state updates trigger automatic re-renders

---

## 🎓 Comparison with Native Platforms

### Advantages of React Context + Router

**Pros:**
- ✅ Simple setup (no additional libraries needed)
- ✅ Lightweight (built-in React features)
- ✅ Type-safe with TypeScript
- ✅ Easy to test
- ✅ Works across all platforms (web, mobile via React Native)

**Cons:**
- ❌ No persistence by default (unlike Android ViewModel)
- ❌ Manual optimization needed (unlike Flutter's smart rebuilds)
- ❌ Can re-render unnecessarily without optimization

### When to Use Each Approach

| Use Case | Best Choice | Reason |
|----------|-------------|--------|
| **Web App** | React Context + Router | Native browser support |
| **Android Native** | ViewModel + Navigation Component | Lifecycle-aware, config change handling |
| **iOS Native** | SwiftUI + StateObject | Optimal performance |
| **Cross-Platform** | Flutter Provider | Single codebase |
| **PWA** | React Context | Web-first, offline support |

---

## 🏁 Conclusion

This practical successfully demonstrates modern state management and navigation patterns in a React PWA, with clear parallels to native Android (ViewModel/Navigation) and Flutter (Provider/Navigator) architectures.

The implementation showcases:
- **Centralized state management** for predictable data flow
- **Declarative routing** for clean navigation logic
- **Real-time updates** for responsive UX
- **Mobile-first design** for optimal user experience

These patterns are fundamental to building scalable, maintainable mobile applications across all platforms.

---

## 📚 References

1. React Context API: https://react.dev/reference/react/useContext
2. React Router v6: https://reactrouter.com/
3. Android Navigation Component: https://developer.android.com/guide/navigation
4. Android ViewModel: https://developer.android.com/topic/libraries/architecture/viewmodel
5. Flutter Provider: https://pub.dev/packages/provider
6. Flutter Navigator 2.0: https://docs.flutter.dev/development/ui/navigation

---

**End of Lab Report**
