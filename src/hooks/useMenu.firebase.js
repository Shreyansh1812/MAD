/**
 * Custom Hook: useMenu (Firebase Version)
 * Manages menu state with Firebase Firestore
 * Practical 06: Database CRUD Operations
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getMenuData, 
  addMenuItem, 
  removeMenuItem, 
  saveSettings,
  initializeMenu 
} from '../services/menuCRUDService';
import { auth } from '../lib/firebase';
import { validateMenuItem } from '../utils/validation';

/**
 * Menu management hook with Firebase Firestore
 * @returns {Object} Menu state and operations
 */
export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [stallData, setStallData] = useState({ stallName: '', waitTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load menu from Firebase on mount
  useEffect(() => {
    const loadMenuFromFirebase = async () => {
      try {
        setIsLoading(true);
        
        // Wait for auth to be ready
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('⏳ Waiting for authentication...');
          setIsLoading(false);
          return;
        }

        console.log('📖 Loading menu from Firebase for user:', currentUser.uid);
        
        // Fetch menu data from Firestore
        const menuData = await getMenuData();
        
        if (menuData) {
          console.log('✅ Menu data loaded:', menuData);
          setMenuItems(menuData.items || []);
          setStallData({
            stallName: menuData.stallName || '',
            waitTime: menuData.waitTime || 0
          });
        } else {
          console.log('ℹ️ No menu data found - initializing new menu');
          // Initialize empty menu for new users
          await initializeMenu();
          setMenuItems([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Error loading menu:', err);
        setError('Failed to load menu: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 User authenticated, loading menu...');
        loadMenuFromFirebase();
      } else {
        console.log('❌ No user authenticated');
        setIsLoading(false);
        setMenuItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Add new menu item to Firebase
   * @param {Object} item - Item to add { name, price, description, category, isVeg, isAvailable }
   * @returns {Object} Result { success: boolean, error: string, item: Object }
   */
  const addItem = useCallback(async (item) => {
    try {
      // Validate input
      const validation = validateMenuItem(item);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.name || validation.errors.price,
          item: null,
        };
      }

      console.log('➕ Adding item to Firebase:', item);

      // Prepare item for Firebase
      const itemToAdd = {
        name: item.name.trim(),
        price: parseFloat(item.price),
        description: item.description ? item.description.trim() : '',
        category: item.category || 'Other',
        isVeg: item.isVeg !== undefined ? item.isVeg : true,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      };

      // Add to Firebase using CRUD service
      const result = await addMenuItem(itemToAdd);
      
      if (result.success) {
        // Update local state
        setMenuItems(prev => [...prev, result.data]);
        
        console.log('✅ Item added successfully:', result.data);
        
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
      console.error('❌ Error adding item:', err);
      return {
        success: false,
        error: err.message || 'Failed to add item',
        item: null,
      };
    }
  }, []);

  /**
   * Update existing menu item
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result { success: boolean, error: string }
   */
  const updateItem = useCallback(async (id, updates) => {
    try {
      console.log('✏️ Updating item:', id, updates);

      // Find the item to update
      const currentItem = menuItems.find(item => item.id === id);
      if (!currentItem) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      // Create updated item
      const updatedItem = {
        ...currentItem,
        name: updates.name ? updates.name.trim() : currentItem.name,
        price: updates.price ? parseFloat(updates.price) : currentItem.price,
        description: updates.description !== undefined ? updates.description.trim() : currentItem.description,
        category: updates.category || currentItem.category,
        isVeg: updates.isVeg !== undefined ? updates.isVeg : currentItem.isVeg,
        isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : currentItem.isAvailable,
      };

      // Remove old item and add updated one
      await removeMenuItem(currentItem);
      const result = await addMenuItem(updatedItem);

      if (result.success) {
        // Update local state
        setMenuItems(prev => prev.map(item => 
          item.id === id ? result.data : item
        ));
        
        console.log('✅ Item updated successfully');
        
        return {
          success: true,
          error: null,
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to update item',
        };
      }
    } catch (err) {
      console.error('❌ Error updating item:', err);
      return {
        success: false,
        error: err.message || 'Failed to update item',
      };
    }
  }, [menuItems]);

  /**
   * Delete menu item from Firebase
   * @param {string} id - Item ID to delete
   * @returns {boolean} Success status
   */
  const deleteItem = useCallback(async (id) => {
    try {
      console.log('🗑️ Deleting item:', id);

      // Find the item to delete
      const itemToDelete = menuItems.find(item => item.id === id);
      if (!itemToDelete) {
        console.error('Item not found');
        return false;
      }

      // Delete from Firebase using CRUD service
      const result = await removeMenuItem(itemToDelete);
      
      if (result.success) {
        // Update local state
        setMenuItems(prev => prev.filter(item => item.id !== id));
        
        console.log('✅ Item deleted successfully');
        return true;
      } else {
        console.error('Failed to delete:', result.message);
        return false;
      }
    } catch (err) {
      console.error('❌ Error deleting item:', err);
      return false;
    }
  }, [menuItems]);

  /**
   * Reload menu from Firebase
   */
  const reloadMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      const menuData = await getMenuData();
      
      if (menuData) {
        setMenuItems(menuData.items || []);
        setStallData({
          stallName: menuData.stallName || '',
          waitTime: menuData.waitTime || 0
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error reloading menu:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    menuItems,
    stallData,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    reloadMenu,
  };
};
