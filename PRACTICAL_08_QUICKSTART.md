# Practical 08 - Quick Reference Guide

## 🚀 Getting Started

### Installation
```bash
npm install react-router-dom
```

### Running the App
```bash
npm run dev
```

---

## 📁 New File Structure

```
src/
├── contexts/
│   └── UserContext.jsx          ← Global state provider
├── components/
│   └── Navigation/
│       └── BottomNavigation.jsx ← Bottom nav bar
├── pages/
│   ├── DashboardLayout.jsx      ← Layout wrapper
│   ├── EditorPageNew.jsx        ← Editor screen
│   ├── PreviewPage.jsx          ← Preview screen
│   ├── QRPage.jsx               ← QR code screen
│   ├── AccountPage.jsx          ← Account/profile screen
│   └── ItemEditScreen.jsx       ← Item edit detail screen
└── App.jsx                      ← Main app with routing
```

---

## 🔑 Key Concepts

### 1. Using Global State (UserContext)

```javascript
import { useUserContext } from '../contexts/UserContext';

function MyComponent() {
  const { 
    menuItems,     // Array of menu items
    currentUser,   // Authenticated user
    addItem,       // Add item function
    updateItem,    // Update item function
    deleteItem     // Delete item function
  } = useUserContext();
  
  // Use state and operations
}
```

### 2. Navigation Between Screens

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  // Navigate to different screens
  navigate('/dashboard/editor');
  navigate('/dashboard/preview');
  navigate('/dashboard/qr');
  navigate('/dashboard/account');
  
  // Navigate with item ID (for editing)
  navigate(`/dashboard/edit/${itemId}`);
  
  // Navigate back
  navigate(-1);
}
```

### 3. Getting Route Parameters

```javascript
import { useParams } from 'react-router-dom';

function ItemEditScreen() {
  const { itemId } = useParams();
  
  // Use itemId to find the item
  const item = menuItems.find(m => m.id === itemId);
}
```

### 4. Checking Current Route

```javascript
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  
  console.log(location.pathname); // "/dashboard/editor"
  
  if (location.pathname === '/dashboard/editor') {
    // Do something
  }
}
```

---

## 📱 Available Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home (redirects) | No |
| `/login` | Login/Register | No |
| `/view?m=...` | Public menu view | No |
| `/dashboard` | Dashboard home | Yes |
| `/dashboard/editor` | Menu editor | Yes |
| `/dashboard/preview` | Live preview | Yes |
| `/dashboard/qr` | QR code generator | Yes |
| `/dashboard/account` | User account | Yes |
| `/dashboard/edit/:itemId` | Edit specific item | Yes |

---

## 🔄 State Update Flow

```javascript
// Adding a new item
const addNewItem = async () => {
  const result = await addItem({
    name: 'Pizza',
    price: 120,
    category: 'Main Course',
    isVeg: true,
    isAvailable: true
  });
  
  if (result.success) {
    // State automatically updated!
    // Preview screen auto-refreshes
    // No manual refresh needed
  }
};
```

---

## 🎯 Common Tasks

### Task 1: Navigate to Edit Screen from Editor

```javascript
// In MenuEditor.jsx
const handleEditClick = (item) => {
  navigate(`/dashboard/edit/${item.id}`);
};

return (
  <button onClick={() => handleEditClick(item)}>
    Edit Item
  </button>
);
```

### Task 2: Access Global State in Any Component

```javascript
import { useUserContext } from '../contexts/UserContext';

function AnyComponent() {
  const { menuItems, stallData } = useUserContext();
  
  return (
    <div>
      <h1>{stallData.stallName}</h1>
      <p>{menuItems.length} items</p>
    </div>
  );
}
```

### Task 3: Protect a Route (Require Auth)

```javascript
// Already implemented in App.jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  {/* Child routes */}
</Route>
```

### Task 4: Logout User

```javascript
import { useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useUserContext();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 🆚 Architecture Comparison Cheat Sheet

### State Management

| Concept | React | Android | Flutter |
|---------|-------|---------|---------|
| State Container | Context | ViewModel | Provider |
| State Variable | `useState()` | `LiveData` | `ChangeNotifier` |
| Update State | `setState()` | `postValue()` | `notifyListeners()` |
| Access State | `useContext()` | `observe()` | `watch()` |

### Navigation

| Action | React | Android | Flutter |
|--------|-------|---------|---------|
| Navigate | `navigate(path)` | `navController.navigate()` | `Navigator.pushNamed()` |
| Go Back | `navigate(-1)` | `navController.popBackStack()` | `Navigator.pop()` |
| Get Params | `useParams()` | `navArgs()` | `ModalRoute.settings.arguments` |
| Current Route | `useLocation()` | `currentDestination` | `ModalRoute.settings.name` |

---

## 🐛 Troubleshooting

### Issue: "Cannot use useContext outside Provider"
**Solution:** Ensure `<UserProvider>` wraps your components in App.jsx

### Issue: "Navigate not working"
**Solution:** Component must be inside `<BrowserRouter>`

### Issue: "State not updating"
**Solution:** Use functional setState: `setItems(prev => [...prev, newItem])`

### Issue: "Protected route redirecting to login"
**Solution:** Check if `currentUser` is properly set in UserContext

---

## ✅ Testing Checklist

- [ ] Can login successfully
- [ ] Can add menu item
- [ ] Preview updates when item added
- [ ] Can navigate between screens using bottom nav
- [ ] Can edit specific item using route parameter
- [ ] Changes in edit screen reflect globally
- [ ] Can delete item
- [ ] Can logout
- [ ] Public menu view works without auth

---

## 🎓 Lab Submission Checklist

- [ ] UserContext implemented
- [ ] React Router configured
- [ ] Bottom Navigation working
- [ ] ItemEditScreen with route params
- [ ] CRUD operations update global state
- [ ] Screenshots of all screens
- [ ] Architecture comparison written
- [ ] Code committed to Git

---

## 📚 Learning Resources

- **React Context:** https://react.dev/reference/react/useContext
- **React Router:** https://reactrouter.com/en/main
- **State Management Patterns:** https://kentcdodds.com/blog/application-state-management-with-react

---

## 💡 Next Steps (Future Enhancements)

1. **Add Search:** Search menu items by name/category
2. **Add Filters:** Filter by category, veg/non-veg
3. **Add Sorting:** Sort by name, price
4. **Add Pagination:** For large menus (100+ items)
5. **Add Offline Queue:** Queue edits when offline, sync when online
6. **Add Analytics:** Track most viewed items
7. **Add Themes:** Dark mode support
8. **Add Internationalization:** Multi-language support

---

**Happy Coding! 🚀**
