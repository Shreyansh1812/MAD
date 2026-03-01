/**
 * Custom Hook: useNotifications
 * Manages local notifications in React components
 * 
 * LEARNING OBJECTIVES:
 * 1. Request notification permissions
 * 2. Show immediate notifications
 * 3. Schedule delayed/recurring notifications
 * 4. Manage notification state
 * 5. Track notification history
 * 
 * USAGE:
 * const { notify, scheduleDaily, permission, requestPermission } = useNotifications();
 */

import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import notificationStorage from '../services/notificationStorage';

export const useNotifications = () => {
  // Permission state
  const [permission, setPermission] = useState('default');
  
  // Loading state for permission request
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  // Notification history
  const [notifications, setNotifications] = useState([]);
  
  // Unread count
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Initialize: Check permission and load notifications
   */
  useEffect(() => {
    // Check current permission
    const currentPermission = notificationService.checkPermission();
    setPermission(currentPermission);

    //Load notification history
    loadNotifications();

    console.log('🔔 [useNotifications] Hook initialized, permission:', currentPermission);
  }, []);

  /**
   * Load notifications from storage
   */
  const loadNotifications = useCallback(() => {
    const allNotifications = notificationStorage.getAllNotifications();
    const unread = notificationStorage.getUnreadCount();
    
    setNotifications(allNotifications);
    setUnreadCount(unread);
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    try {
      setIsRequestingPermission(true);
      
      const result = await notificationService.requestPermission();
      setPermission(result);
      
      console.log('✅ [useNotifications] Permission result:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ [useNotifications] Error requesting permission:', error);
      return 'denied';
      
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  /**
   * Show immediate notification
   * 
   * @param {Object} options - Notification options
   * @returns {Promise<Notification|null>}
   */
  const notify = useCallback(async (options) => {
    const notification = await notificationService.showNotification(options);
    
    // Reload notifications to include new one
    loadNotifications();
    
    return notification;
  }, [loadNotifications]);

  /**
   * Schedule notification for later
   * 
   * @param {Object} options - Notification options
   * @param {number} delayMs - Delay in milliseconds
   * @returns {string} Timer ID
   */
  const scheduleNotification = useCallback((options, delayMs) => {
    return notificationService.scheduleNotification(options, delayMs);
  }, []);

  /**
   * Schedule daily recurring notification
   * 
   * @param {Object} options - Notification options
   * @param {number} hour - Hour (0-23)
   * @param {number} minute - Minute (0-59)
   * @returns {string} Timer ID
   */
  const scheduleDailyNotification = useCallback((options, hour, minute) => {
    return notificationService.scheduleDailyNotification(options, hour, minute);
  }, []);

  /**
   * Cancel scheduled notification
   * 
   * @param {string} timerId - Timer ID
   * @returns {boolean} Success status
   */
  const cancelNotification = useCallback((timerId) => {
    return notificationService.cancelScheduledNotification(timerId);
  }, []);

  /**
   * Get all scheduled notifications
   */
  const getScheduled = useCallback(() => {
    return notificationService.getScheduledNotifications();
  }, []);

  /**
   * Mark notification as read
   * 
   * @param {string} notificationId - Notification ID
   */
  const markAsRead = useCallback((notificationId) => {
    const success = notificationStorage.markAsRead(notificationId);
    if (success) {
      loadNotifications();
    }
    return success;
  }, [loadNotifications]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    const success = notificationStorage.markAllAsRead();
    if (success) {
      loadNotifications();
    }
    return success;
  }, [loadNotifications]);

  /**
   * Delete notification
   * 
   * @param {string} notificationId - Notification ID
   */
  const deleteNotification = useCallback((notificationId) => {
    const success = notificationStorage.deleteNotification(notificationId);
    if (success) {
      loadNotifications();
    }
    return success;
  }, [loadNotifications]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    const success = notificationStorage.clearAll();
    if (success) {
      loadNotifications();
    }
    return success;
  }, [loadNotifications]);

  /**
   * Predefined notification helpers for QuickMenu
   */
  const notifyItemAdded = useCallback((itemName) => {
    return notify(notificationService.templates.itemAdded(itemName));
  }, [notify]);

  const notifyMenuUpdated = useCallback(() => {
    return notify(notificationService.templates.menuUpdated());
  }, [notify]);

  const notifyQRGenerated = useCallback(() => {
    return notify(notificationService.templates.qrGenerated());
  }, [notify]);

  const notifySettingsSaved = useCallback((stallName) => {
    return notify(notificationService.templates.settingsSaved(stallName));
  }, [notify]);

  const scheduleDailyReminder = useCallback((hour = 8, minute = 0) => {
    return scheduleDailyNotification(
      notificationService.templates.dailyReminder(),
      hour,
      minute
    );
  }, [scheduleDailyNotification]);

  const scheduleWeeklyReview = useCallback(() => {
    // Schedule for 7 days from now
    const delayMs = 7 * 24 * 60 * 60 * 1000;
    return scheduleNotification(
      notificationService.templates.weeklyReview(),
      delayMs
    );
  }, [scheduleNotification]);

  // Return API
  return {
    // State
    permission,
    isRequestingPermission,
    notifications,
    unreadCount,
    hasPermission: permission === 'granted',
    canRequest: permission === 'default',
    
    // Actions
    requestPermission,
    notify,
    scheduleNotification,
    scheduleDailyNotification,
    cancelNotification,
    getScheduled,
    
    // History management
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    
    // QuickMenu helpers
    notifyItemAdded,
    notifyMenuUpdated,
    notifyQRGenerated,
    notifySettingsSaved,
    scheduleDailyReminder,
    scheduleWeeklyReview,
  };
};
