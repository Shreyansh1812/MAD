/**
 * useWakeLock Hook
 * Prevents screen dimming on Android devices using the Screen Wake Lock API
 */

import { useEffect, useRef, useState } from 'react';

export const useWakeLock = () => {
  const wakeLockRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  /**
   * Request wake lock to prevent screen from dimming
   * @returns {Promise<boolean>} Success status
   */
  const requestWakeLock = async () => {
    if (!isSupported) {
      console.log('Wake Lock API not supported');
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      
      console.log('Wake Lock activated - screen will stay on');

      // Handle wake lock release (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake Lock released');
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.error('Failed to request wake lock:', err);
      setIsActive(false);
      return false;
    }
  };

  /**
   * Release wake lock to allow screen dimming
   */
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        console.log('Wake Lock manually released');
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    }
  };

  /**
   * Re-request wake lock when page becomes visible
   * (wake lock is automatically released when page is hidden)
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /**
   * Clean up wake lock on unmount
   */
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
};
