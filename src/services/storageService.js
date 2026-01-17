/**
 * Storage Service
 * Handles all browser storage operations with abstraction layer
 * Supports graceful degradation and error handling
 */

const STORAGE_KEY = 'quickmenu_data';
const STORAGE_VERSION = '1.0';

/**
 * Storage adapter interface for LocalStorage
 * Can be extended to support IndexedDB for larger datasets
 */
class StorageService {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available and functional
   * @returns {boolean}
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('LocalStorage not available:', e);
      return false;
    }
  }

  /**
   * Save menu data to storage
   * @param {Array} menuItems - Array of menu item objects
   * @returns {boolean} Success status
   */
  saveMenu(menuItems) {
    if (!this.isAvailable) {
      console.warn('Storage not available, data will not persist');
      return false;
    }

    try {
      const data = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        items: menuItems,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save menu:', e);
      return false;
    }
  }

  /**
   * Load menu data from storage
   * @returns {Array} Array of menu items (empty if none found)
   */
  loadMenu() {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const data = JSON.parse(stored);
      
      // Version compatibility check
      if (data.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, migrating data');
        // Could implement migration logic here
      }

      return Array.isArray(data.items) ? data.items : [];
    } catch (e) {
      console.error('Failed to load menu:', e);
      return [];
    }
  }

  /**
   * Clear all stored menu data
   * @returns {boolean} Success status
   */
  clearMenu() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear menu:', e);
      return false;
    }
  }

  /**
   * Get storage usage info
   * @returns {Object} Storage metadata
   */
  getStorageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return {
      available: true,
      hasData: !!stored,
      dataSize: stored ? new Blob([stored]).size : 0,
      timestamp: stored ? JSON.parse(stored).timestamp : null,
    };
  }
}

// Export singleton instance
export default new StorageService();
