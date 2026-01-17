/**
 * useWebShare Hook
 * Provides native Android/iOS Share Sheet integration using Web Share API
 */

import { useState, useCallback } from 'react';

export const useWebShare = () => {
  const [isSupported] = useState(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  });
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Share content using native share sheet
   * @param {Object} shareData - { title, text, url }
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const share = useCallback(async (shareData) => {
    if (!isSupported) {
      return { 
        success: false, 
        error: 'Web Share API not supported on this device' 
      };
    }

    // Validate share data
    if (!shareData || (!shareData.title && !shareData.text && !shareData.url)) {
      return { 
        success: false, 
        error: 'Share data must include title, text, or url' 
      };
    }

    setIsSharing(true);

    try {
      await navigator.share(shareData);
      setIsSharing(false);
      return { success: true };
    } catch (err) {
      setIsSharing(false);
      
      // User cancelled the share - not an error
      if (err.name === 'AbortError') {
        console.log('Share cancelled by user');
        return { success: false, error: 'cancelled' };
      }
      
      console.error('Share failed:', err);
      return { 
        success: false, 
        error: err.message || 'Share failed' 
      };
    }
  }, [isSupported]);

  /**
   * Share menu URL with native share sheet
   * @param {string} menuUrl - The menu URL to share
   * @param {string} stallName - Optional stall name for context
   */
  const shareMenuUrl = useCallback(async (menuUrl, stallName = '') => {
    const shareData = {
      title: stallName ? `${stallName} - QuickMenu` : 'QuickMenu',
      text: stallName 
        ? `Check out ${stallName}'s menu! 🍽️` 
        : 'Check out this menu! 🍽️',
      url: menuUrl,
    };

    return await share(shareData);
  }, [share]);

  /**
   * Fallback: Copy to clipboard if share is not supported
   * @param {string} text - Text to copy
   */
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return { 
        success: false, 
        error: 'Failed to copy to clipboard' 
      };
    }
  }, []);

  return {
    isSupported,
    isSharing,
    share,
    shareMenuUrl,
    copyToClipboard,
  };
};
