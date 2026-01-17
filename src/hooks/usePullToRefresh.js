/**
 * usePullToRefresh Hook
 * Disables default browser pull-to-refresh to prevent accidental reloads
 * Essential for PWA to feel like a native Android app
 */

import { useEffect } from 'react';

export const usePullToRefresh = (disable = true) => {
  useEffect(() => {
    if (!disable) return;

    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].pageY;
      isScrolling = window.scrollY > 0;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].pageY;
      const deltaY = currentY - startY;

      // Prevent pull-to-refresh when at top of page and pulling down
      if (!isScrolling && deltaY > 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    // Prevent overscroll behavior (bouncing effect)
    const preventOverscroll = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Prevent overscroll on the body
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [disable]);
};
