/**
 * Practical 06: Database CRUD Operations Service
 * QuickMenu - Firebase Firestore CRUD Operations
 * Uses Firebase v9+ Modular SDK
 */

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { auth, app } from '../lib/firebase';

// Initialize Firestore database instance
const db = getFirestore(app);

/**
 * Get the current authenticated user's ID
 * @returns {string|null} User ID or null if not authenticated
 */
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently authenticated');
  }
  return user.uid;
};

/**
 * CREATE/UPDATE: Save or update stall settings
 * Uses setDoc with { merge: true } to save or update settings
 * 
 * @param {Object} settingsData - The stall settings object
 * @param {string} settingsData.stallName - Name of the stall
 * @param {number} settingsData.waitTime - Wait time in minutes
 * @param {string} [userId] - Optional user ID (defaults to current user)
 * @returns {Promise<Object>} Success message and saved data
 */
export const saveSettings = async (settingsData, userId = null) => {
  try {
    // Get user ID (use provided or current authenticated user)
    const uid = userId || getCurrentUserId();
    
    // Validate input data
    if (!settingsData.stallName || settingsData.stallName.trim() === '') {
      throw new Error('Stall name is required');
    }
    
    if (typeof settingsData.waitTime !== 'number' || settingsData.waitTime < 0) {
      throw new Error('Wait time must be a positive number');
    }

    // Reference to the user's document in 'menus' collection
    const menuDocRef = doc(db, 'menus', uid);

    // Save/update the settings using setDoc with merge option
    await setDoc(
      menuDocRef,
      {
        stallName: settingsData.stallName.trim(),
        waitTime: settingsData.waitTime,
        updatedAt: new Date().toISOString()
      },
      { merge: true } // This will create the document if it doesn't exist, or merge with existing data
    );

    console.log('Settings saved successfully for user:', uid);
    
    return {
      success: true,
      message: 'Settings saved successfully',
      data: {
        stallName: settingsData.stallName.trim(),
        waitTime: settingsData.waitTime
      }
    };
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error(`Failed to save settings: ${error.message}`);
  }
};

/**
 * READ: Fetch menu data for a specific user
 * 
 * @param {string} [userId] - Optional user ID (defaults to current user)
 * @returns {Promise<Object|null>} Menu data object or null if not found
 */
export const getMenuData = async (userId = null) => {
  try {
    // Get user ID (use provided or current authenticated user)
    const uid = userId || getCurrentUserId();

    // Reference to the user's document
    const menuDocRef = doc(db, 'menus', uid);

    // Fetch the document
    const docSnap = await getDoc(menuDocRef);

    if (docSnap.exists()) {
      console.log('Menu data retrieved successfully for user:', uid);
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log('No menu data found for user:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw new Error(`Failed to fetch menu data: ${error.message}`);
  }
};

/**
 * UPDATE: Add a new menu item to the items array
 * 
 * @param {Object} menuItem - The menu item to add
 * @param {string} menuItem.name - Name of the menu item
 * @param {number} menuItem.price - Price of the menu item
 * @param {string} [menuItem.id] - Optional unique ID (auto-generated if not provided)
 * @param {string} [userId] - Optional user ID (defaults to current user)
 * @returns {Promise<Object>} Success message and added item
 */
export const addMenuItem = async (menuItem, userId = null) => {
  try {
    // Get user ID (use provided or current authenticated user)
    const uid = userId || getCurrentUserId();

    // Validate input data
    if (!menuItem.name || menuItem.name.trim() === '') {
      throw new Error('Menu item name is required');
    }

    if (typeof menuItem.price !== 'number' || menuItem.price < 0) {
      throw new Error('Price must be a positive number');
    }

    // Create the item object with a unique ID if not provided
    const itemToAdd = {
      id: menuItem.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: menuItem.name.trim(),
      price: menuItem.price,
      addedAt: new Date().toISOString()
    };

    // Reference to the user's document
    const menuDocRef = doc(db, 'menus', uid);

    // Add the item to the items array using arrayUnion
    // arrayUnion prevents duplicate entries
    await updateDoc(menuDocRef, {
      items: arrayUnion(itemToAdd),
      updatedAt: new Date().toISOString()
    });

    console.log('Menu item added successfully:', itemToAdd.name);

    return {
      success: true,
      message: 'Menu item added successfully',
      data: itemToAdd
    };
  } catch (error) {
    console.error('Error adding menu item:', error);
    
    // Handle case where document doesn't exist
    if (error.code === 'not-found') {
      throw new Error('Menu document not found. Please save settings first.');
    }
    
    throw new Error(`Failed to add menu item: ${error.message}`);
  }
};

/**
 * DELETE: Remove a menu item from the items array
 * 
 * @param {string|Object} itemIdentifier - Item ID (string) or item object to remove
 * @param {string} [userId] - Optional user ID (defaults to current user)
 * @returns {Promise<Object>} Success message
 */
export const removeMenuItem = async (itemIdentifier, userId = null) => {
  try {
    // Get user ID (use provided or current authenticated user)
    const uid = userId || getCurrentUserId();

    // Validate input
    if (!itemIdentifier) {
      throw new Error('Item identifier is required');
    }

    // Reference to the user's document
    const menuDocRef = doc(db, 'menus', uid);

    // If itemIdentifier is a string (ID), we need to fetch the full item first
    let itemToRemove;
    
    if (typeof itemIdentifier === 'string') {
      // Fetch current menu data to find the item by ID
      const menuData = await getMenuData(uid);
      
      if (!menuData || !menuData.items) {
        throw new Error('No menu items found');
      }

      // Find the item by ID or name
      itemToRemove = menuData.items.find(
        item => item.id === itemIdentifier || item.name === itemIdentifier
      );

      if (!itemToRemove) {
        throw new Error('Menu item not found');
      }
    } else if (typeof itemIdentifier === 'object') {
      // If it's already an object, use it directly
      itemToRemove = itemIdentifier;
    } else {
      throw new Error('Invalid item identifier type');
    }

    // Remove the item from the items array using arrayRemove
    // arrayRemove requires the exact object to be removed
    await updateDoc(menuDocRef, {
      items: arrayRemove(itemToRemove),
      updatedAt: new Date().toISOString()
    });

    console.log('Menu item removed successfully:', itemToRemove.name || itemToRemove.id);

    return {
      success: true,
      message: 'Menu item removed successfully',
      data: itemToRemove
    };
  } catch (error) {
    console.error('Error removing menu item:', error);
    
    // Handle case where document doesn't exist
    if (error.code === 'not-found') {
      throw new Error('Menu document not found');
    }
    
    throw new Error(`Failed to remove menu item: ${error.message}`);
  }
};

/**
 * UTILITY: Initialize a new menu document with default settings
 * Useful for first-time users
 * 
 * @param {string} [userId] - Optional user ID (defaults to current user)
 * @returns {Promise<Object>} Success message
 */
export const initializeMenu = async (userId = null) => {
  try {
    const uid = userId || getCurrentUserId();

    const menuDocRef = doc(db, 'menus', uid);

    // Check if document already exists
    const docSnap = await getDoc(menuDocRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        message: 'Menu already initialized',
        data: docSnap.data()
      };
    }

    // Create a new document with default values
    await setDoc(menuDocRef, {
      stallName: 'My Stall',
      waitTime: 10,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Menu initialized successfully for user:', uid);

    return {
      success: true,
      message: 'Menu initialized successfully'
    };
  } catch (error) {
    console.error('Error initializing menu:', error);
    throw new Error(`Failed to initialize menu: ${error.message}`);
  }
};

// Export the Firestore instance for advanced use cases
export { db };
