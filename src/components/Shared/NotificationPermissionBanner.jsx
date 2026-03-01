/**
 * Notification Permission Banner Component
 * One-time banner to request notification permission
 * 
 * LEARNING OBJECTIVES:
 * ✅ Request browser notification permission
 * ✅ LocalStorage to track if banner was shown
 * ✅ Conditional rendering based on permission state
 * ✅ User-friendly permission UI
 */

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationPermissionBanner = () => {
  const { permission, requestPermission } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if banner should be shown
  useEffect(() => {
    // Don't show if already granted or denied
    if (permission !== 'default') {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed banner before
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    // Show banner after 2 seconds delay (better UX)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [permission]);

  // Handle "Allow" button click
  const handleAllow = async () => {
    setIsRequesting(true);
    
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        // Permission granted - hide banner
        setIsVisible(false);
      } else if (result === 'denied') {
        // Permission denied - hide banner permanently
        localStorage.setItem('notification-banner-dismissed', 'true');
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle "Maybe Later" button click
  const handleDismiss = () => {
    localStorage.setItem('notification-banner-dismissed', 'true');
    setIsVisible(false);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl animate-slide-down">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Bell className="text-white" size={24} />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight mb-0.5">
              Enable Notifications
            </h3>
            <p className="text-sm text-white/90 leading-tight">
              Get notified when you add items, update menus, and more!
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAllow}
              disabled={isRequesting}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isRequesting ? 'Please wait...' : 'Allow'}
            </button>
            
            <button
              onClick={handleDismiss}
              disabled={isRequesting}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-lg transition-all disabled:opacity-50"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
