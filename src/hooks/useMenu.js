/**
 * Custom Hook: useMenu
 * Manages menu state with automatic persistence
 * Handles CRUD operations and storage synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';
import { generateId, validateMenuItem } from '../utils/validation';

/**
 * Menu management hook with persistence
 * @returns {Object} Menu state and operations
 */
export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load menu from storage on mount
  useEffect(() => {
    try {
      const loadedItems = storageService.loadMenu();
      setMenuItems(loadedItems);
      setError(null);
    } catch (err) {
      setError('Failed to load menu data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save menu whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saved = storageService.saveMenu(menuItems);
      if (!saved) {
        console.warn('Menu not saved - storage unavailable');
      }
    }
  }, [menuItems, isLoading]);

  /**
   * Add new menu item
   * @param {Object} item - Item to add { name, price }
   * @returns {Object} Result { success: boolean, error: string, item: Object }
   */
  const addItem = useCallback((item) => {
    const validation = validateMenuItem(item);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.name || validation.errors.price,
        item: null,
      };
    }

    const newItem = {
      id: generateId(),
      name: item.name.trim(),
      price: parseFloat(item.price),
      createdAt: new Date().toISOString(),
    };

    setMenuItems(prev => [...prev, newItem]);
    
    return {
      success: true,
      error: null,
      item: newItem,
    };
  }, []);

  /**
   * Update existing menu item
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result { success: boolean, error: string }
   */
  const updateItem = useCallback((id, updates) => {
    const item = menuItems.find(i => i.id === id);
    
    if (!item) {
      return {
        success: false,
        error: 'Item not found',
      };
    }

    const updatedItem = { ...item, ...updates };
    const validation = validateMenuItem(updatedItem);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.name || validation.errors.price,
      };
    }

    setMenuItems(prev =>
      prev.map(i =>
        i.id === id
          ? {
              ...i,
              name: updates.name !== undefined ? updates.name.trim() : i.name,
              price: updates.price !== undefined ? parseFloat(updates.price) : i.price,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    return {
      success: true,
      error: null,
    };
  }, [menuItems]);

  /**
   * Delete menu item
   * @param {string} id - Item ID to delete
   * @returns {boolean} Success status
   */
  const deleteItem = useCallback((id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    return true;
  }, []);

  /**
   * Clear all menu items
   * @returns {boolean} Success status
   */
  const clearMenu = useCallback(() => {
    setMenuItems([]);
    storageService.clearMenu();
    return true;
  }, []);

  /**
   * Reorder menu items
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   */
  const reorderItems = useCallback((fromIndex, toIndex) => {
    setMenuItems(prev => {
      const items = [...prev];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      return items;
    });
  }, []);

  return {
    menuItems,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    clearMenu,
    reorderItems,
    hasItems: menuItems.length > 0,
    itemCount: menuItems.length,
  };
};
