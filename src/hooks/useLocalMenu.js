/**
 * Custom Hook: useLocalMenu
 * Handles menu viewing from QR code hash
 */

import { useState, useEffect } from 'react';
import qrService from '../services/qrService';

/**
 * Hook for viewing menu from URL hash
 * @returns {Object} Menu view state
 */
export const useLocalMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMenuFromHash = () => {
      try {
        const hash = window.location.hash;
        
        if (!hash || !hash.includes('menu=')) {
          setMenuItems([]);
          setError('No menu data found in URL');
          return;
        }

        const decodedMenu = qrService.decodeMenuFromHash(hash);
        
        if (!decodedMenu || decodedMenu.length === 0) {
          setMenuItems([]);
          setError('Invalid menu data');
          return;
        }

        setMenuItems(decodedMenu);
        setError(null);
      } catch (err) {
        console.error('Failed to load menu from hash:', err);
        setError('Failed to load menu');
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuFromHash();

    // Listen for hash changes
    const handleHashChange = () => {
      setIsLoading(true);
      loadMenuFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return {
    menuItems,
    isLoading,
    error,
    hasMenu: menuItems.length > 0,
  };
};
