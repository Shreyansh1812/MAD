/**
 * UserContext - Global State Management
 * Practical 08: Multi-Screen Navigation & State Management
 * 
 * This Context Provider manages:
 * - User authentication state
 * - Menu items and stall data (global app state)
 * - CRUD operations with real-time state updates
 * 
 * ARCHITECTURE COMPARISON:
 * React Context ≈ Android Jetpack ViewModel + LiveData
 * - Context API: Provides global state accessible from any component
 * - useState/useReducer: Similar to ViewModel's MutableLiveData
 * - Custom hooks: Similar to Repository pattern in Android
 * 
 * Flutter equivalent: Provider package with ChangeNotifier
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  getMenuData, 
  addMenuItem, 
  removeMenuItem,
  initializeMenu 
} from '../services/menuCRUDService';
import { validateMenuItem } from '../utils/validation';

// Create Context
const UserContext = createContext(null);

/**
 * Custom Hook to access UserContext
 * Similar to: 
 * - Android: viewModel() or by viewModels() delegate
 * - Flutter: Provider.of<T>(context) or context.watch<T>()
 */
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

/**
 * UserProvider Component
 * Wraps the entire app to provide global state
 * Similar to:
 * - Android: ViewModelProvider with Fragment/Activity scope
 * - Flutter: MultiProvider or ChangeNotifierProvider at root
 */
export const UserProvider = ({ children }) => {
  // ============================================
  // AUTHENTICATION STATE
  // Similar to: Android LiveData<User?> in ViewModel
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ============================================
  // MENU STATE (Global App Data)
  // Similar to: Android LiveData<List<MenuItem>> + LiveData<StallData>
  // ============================================
  const [menuItems, setMenuItems] = useState([]);
  const [stallData, setStallData] = useState({ stallName: '', waitTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // AUTHENTICATION LISTENER
  // Similar to: Android observeForever() or collectAsState()
  // ============================================
  useEffect(() => {
    console.log('🔐 [UserContext] Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('✅ [UserContext] User authenticated:', user.email);
        setCurrentUser(user);
        // Auto-load menu when user logs in
        await loadMenu();
      } else {
        console.log('❌ [UserContext] No user authenticated');
        setCurrentUser(null);
        setMenuItems([]);
        setStallData({ stallName: '', waitTime: 0 });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // LOAD MENU FROM FIREBASE
  // Similar to: Android Repository.fetchData() with LiveData update
  // ============================================
  const loadMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📖 [UserContext] Loading menu from Firebase...');
      
      const menuData = await getMenuData();
      
      if (menuData) {
        console.log('✅ [UserContext] Menu loaded:', menuData.items?.length || 0, 'items');
        setMenuItems(menuData.items || []);
        setStallData({
          stallName: menuData.stallName || '',
          waitTime: menuData.waitTime || 0
        });
      } else {
        console.log('ℹ️ [UserContext] No menu found - initializing...');
        await initializeMenu();
        setMenuItems([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ [UserContext] Error loading menu:', err);
      setError('Failed to load menu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // ADD MENU ITEM (CRUD - Create)
  // Similar to: Android ViewModel.insert() with LiveData update
  // ============================================
  const addItem = useCallback(async (item) => {
    try {
      const validation = validateMenuItem(item);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.name || validation.errors.price,
          item: null,
        };
      }

      console.log('➕ [UserContext] Adding item:', item.name);

      const itemToAdd = {
        name: item.name.trim(),
        price: parseFloat(item.price),
        description: item.description ? item.description.trim() : '',
        category: item.category || 'Other',
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      };

      const result = await addMenuItem(itemToAdd);
      
      if (result.success) {
        // IMMEDIATE STATE UPDATE - Preview Screen will auto-refresh!
        setMenuItems(prev => [...prev, result.data]);
        
        console.log('✅ [UserContext] Item added & state updated globally');
        
        return {
          success: true,
          error: null,
          item: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to add item',
          item: null,
        };
      }
    } catch (err) {
      console.error('❌ [UserContext] Error adding item:', err);
      return {
        success: false,
        error: err.message || 'Failed to add item',
        item: null,
      };
    }
  }, []);

  // ============================================
  // UPDATE MENU ITEM (CRUD - Update)
  // Similar to: Android ViewModel.update() with LiveData postValue
  // ============================================
  const updateItem = useCallback(async (id, updates) => {
    try {
      console.log('✏️ [UserContext] Updating item:', id);

      const currentItem = menuItems.find(item => item.id === id);
      if (!currentItem) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      const updatedItem = {
        ...currentItem,
        name: updates.name ? updates.name.trim() : currentItem.name,
        price: updates.price ? parseFloat(updates.price) : currentItem.price,
        description: updates.description !== undefined ? updates.description.trim() : currentItem.description,
        category: updates.category || currentItem.category,
        isVeg: updates.isVeg !== undefined ? updates.isVeg : currentItem.isVeg,
        isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : currentItem.isAvailable,
      };

      await removeMenuItem(currentItem);
      const result = await addMenuItem(updatedItem);

      if (result.success) {
        // IMMEDIATE STATE UPDATE - All screens refresh automatically!
        setMenuItems(prev => prev.map(item => 
          item.id === id ? result.data : item
        ));
        
        console.log('✅ [UserContext] Item updated & state synced globally');
        
        return { success: true, error: null };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to update item',
        };
      }
    } catch (err) {
      console.error('❌ [UserContext] Error updating item:', err);
      return {
        success: false,
        error: err.message || 'Failed to update item',
      };
    }
  }, [menuItems]);

  // ============================================
  // DELETE MENU ITEM (CRUD - Delete)
  // Similar to: Android ViewModel.delete() with LiveData update
  // ============================================
  const deleteItem = useCallback(async (id) => {
    try {
      console.log('🗑️ [UserContext] Deleting item:', id);

      const itemToDelete = menuItems.find(item => item.id === id);
      if (!itemToDelete) {
        console.error('Item not found');
        return false;
      }

      const result = await removeMenuItem(itemToDelete);
      
      if (result.success) {
        // IMMEDIATE STATE UPDATE - Preview refreshes instantly!
        setMenuItems(prev => prev.filter(item => item.id !== id));
        
        console.log('✅ [UserContext] Item deleted & state updated globally');
        return true;
      } else {
        console.error('Failed to delete:', result.message);
        return false;
      }
    } catch (err) {
      console.error('❌ [UserContext] Error deleting item:', err);
      return false;
    }
  }, [menuItems]);

  // ============================================
  // UPDATE STALL SETTINGS
  // Similar to: Android ViewModel.updateSettings() with LiveData
  // ============================================
  const updateStallData = useCallback((newData) => {
    console.log('🏪 [UserContext] Updating stall data:', newData);
    setStallData(newData);
  }, []);

  // ============================================
  // LOGOUT FUNCTION
  // Similar to: Android ViewModel.logout() with clearing LiveData
  // ============================================
  const logout = useCallback(async () => {
    try {
      console.log('🚪 [UserContext] Logging out...');
      await signOut(auth);
      setCurrentUser(null);
      setMenuItems([]);
      setStallData({ stallName: '', waitTime: 0 });
      console.log('✅ [UserContext] Logged out successfully');
    } catch (err) {
      console.error('❌ [UserContext] Error logging out:', err);
      throw err;
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // All state and operations available to child components
  // ============================================
  const value = {
    // Auth State
    currentUser,
    authLoading,
    
    // Menu State
    menuItems,
    stallData,
    isLoading,
    error,
    
    // Operations
    loadMenu,
    addItem,
    updateItem,
    deleteItem,
    updateStallData,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * ARCHITECTURE NOTES:
 * 
 * 1. REACT CONTEXT vs ANDROID VIEWMODEL:
 *    - Context: Global state container, accessible anywhere
 *    - ViewModel: Survives config changes, lifecycle-aware
 *    - Both: Centralized state management, reactive updates
 * 
 * 2. REACT CONTEXT vs FLUTTER PROVIDER:
 *    - Context: Built-in React API
 *    - Provider: Package for Flutter (provider, riverpod)
 *    - Both: Dependency injection + state management
 * 
 * 3. STATE UPDATE FLOW:
 *    React: addItem() → setMenuItems() → Components re-render
 *    Android: insert() → postValue() → LiveData observers notified
 *    Flutter: add() → notifyListeners() → Consumer rebuilds
 * 
 * 4. BENEFITS:
 *    ✅ No prop drilling (pass data through many components)
 *    ✅ Single source of truth
 *    ✅ Automatic UI updates on state change
 *    ✅ Easy to test and maintain
 */
