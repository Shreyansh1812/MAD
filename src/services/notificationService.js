/**
 * Notification Service
 * Handles local notifications using Browser Notification API
 * 
 * LEARNING OBJECTIVES:
 * 1. Implement local notifications (triggered within app)
 * 2. Request and manage notification permissions
 * 3. Schedule notifications with timing
 * 4. Add click actions to navigate to specific screens
 * 5. Handle notification lifecycle
 * 
 * USE CASE: Remind QuickMenu vendors about menu updates,
 * daily prep, and important tasks
 */

/**
 * Notification Service Class
 * Manages all local notification functionality
 */
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.scheduledTimers = new Map(); // Track scheduled notifications
    this.checkPermission();
  }

  /**
   * Check current notification permission status
   * TEACHING POINT: Notification.permission can be 'granted', 'denied', or 'default'
   */
  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      console.log('🔔 [NotificationService] Permission status:', this.permission);
      return this.permission;
    } else {
      console.warn('⚠️ [NotificationService] Browser does not support notifications');
      return 'unsupported';
    }
  }

  /**
   * Request notification permission from user
   * TEACHING POINT: This is the key step - must have user interaction to request permission
   * 
   * @returns {Promise<string>} Permission result ('granted', 'denied', or 'default')
   */
  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        console.error('❌ [NotificationService] Notifications not supported');
        return 'unsupported';
      }

      if (this.permission === 'granted') {
        console.log('✅ [NotificationService] Permission already granted');
        return 'granted';
      }

      console.log('🔔 [NotificationService] Requesting notification permission...');

      // TEACHING POINT: This shows browser permission dialog
      const permission = await Notification.requestPermission();
      this.permission = permission;

      console.log('📢 [NotificationService] Permission result:', permission);

      // Store permission preference
      localStorage.setItem('notificationPermission', permission);
      localStorage.setItem('notificationPermissionTimestamp', new Date().toISOString());

      return permission;
      
    } catch (error) {
      console.error('❌ [NotificationService] Error requesting permission:', error);
      return 'denied';
    }
  }

  /**
   * Show an immediate notification
   * TEACHING POINT: Creates and displays notification right away
   * 
   * @param {Object} options - Notification options
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification message
   * @param {string} options.icon - Icon URL
   * @param {string} options.tag - Unique identifier
   * @param {string} options.action - Navigation path on click
   * @param {Object} options.data - Additional data
   * @returns {Promise<Notification|null>}
   */
  async showNotification({
    title,
    body,
    icon = '/icon-192.png',
    badge = '/icon-192.png',
    tag = `notification-${Date.now()}`,
    action = null,
    data = {},
    requireInteraction = false,
  }) {
    try {
      // Check permission first
      if (this.permission !== 'granted') {
        console.warn('⚠️ [NotificationService] Permission not granted, cannot show notification');
        return null;
      }

      console.log('📢 [NotificationService] Showing notification:', title);

      // TEACHING POINT: Create notification with options
      const notification = new Notification(title, {
        body,
        icon,
        badge,
        tag,
        requireInteraction,
        data: {
          ...data,
          action,
          timestamp: new Date().toISOString(),
        },
      });

      // TEACHING POINT: Handle notification click event
      notification.onclick = (event) => {
        event.preventDefault();
        console.log('👆 [NotificationService] Notification clicked:', tag);

        // Close notification
        notification.close();

        // Focus window
        window.focus();

        // Navigate if action path provided
        if (action) {
          this.handleNavigationAction(action);
        }

        // Store click event
        this.storeNotificationInteraction(tag, 'clicked');
      };

      // Handle notification close
      notification.onclose = () => {
        console.log('❌ [NotificationService] Notification closed:', tag);
        this.storeNotificationInteraction(tag, 'closed');
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error('❌ [NotificationService] Notification error:', error);
      };

      // Store in history
      this.storeNotificationInHistory({
        title,
        body,
        icon,
        tag,
        action,
        timestamp: new Date().toISOString(),
        read: false,
      });

      return notification;
      
    } catch (error) {
      console.error('❌ [NotificationService] Error showing notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for later
   * TEACHING POINT: Use setTimeout to delay notification
   * 
   * @param {Object} options - Notification options (same as showNotification)
   * @param {number} delayMs - Delay in milliseconds
   * @returns {string} Timer ID for cancellation
   */
  scheduleNotification(options, delayMs) {
    try {
      console.log(`⏰ [NotificationService] Scheduling notification for ${delayMs}ms:`, options.title);

      const timerId = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // TEACHING POINT: setTimeout for delayed execution
      const timer = setTimeout(() => {
        this.showNotification(options);
        this.scheduledTimers.delete(timerId);
      }, delayMs);

      // Store timer reference for cancellation
      this.scheduledTimers.set(timerId, {
        timer,
        options,
        scheduledFor: new Date(Date.now() + delayMs).toISOString(),
      });

      console.log('✅ [NotificationService] Notification scheduled:', timerId);

      return timerId;
      
    } catch (error) {
      console.error('❌ [NotificationService] Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a daily recurring notification
   * TEACHING POINT: Calculate time until next occurrence, then repeat daily
   * 
   * @param {Object} options - Notification options
   * @param {number} hour - Hour of day (0-23)
   * @param {number} minute - Minute of hour (0-59)
   * @returns {string} Timer ID
   */
  scheduleDailyNotification(options, hour, minute) {
    try {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delayMs = scheduledTime - now;

      console.log(`📅 [NotificationService] Scheduling daily notification at ${hour}:${minute}`);
      console.log(`⏰ Next occurrence: ${scheduledTime.toLocaleString()}`);

      const timerId = `daily-${Date.now()}`;

      // Schedule first occurrence
      const timer = setTimeout(() => {
        this.showNotification(options);

        // Schedule recurring daily
        const recurringTimer = setInterval(() => {
          this.showNotification(options);
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Update stored timer
        this.scheduledTimers.set(timerId, {
          timer: recurringTimer,
          options,
          recurring: true,
          time: `${hour}:${minute}`,
        });
      }, delayMs);

      this.scheduledTimers.set(timerId, {
        timer,
        options,
        scheduledFor: scheduledTime.toISOString(),
        recurring: true,
        time: `${hour}:${minute}`,
      });

      console.log('✅ [NotificationService] Daily notification scheduled:', timerId);

      return timerId;
      
    } catch (error) {
      console.error('❌ [NotificationService] Error scheduling daily notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   * 
   * @param {string} timerId - Timer ID from scheduleNotification
   * @returns {boolean} Success status
   */
  cancelScheduledNotification(timerId) {
    try {
      const scheduled = this.scheduledTimers.get(timerId);

      if (!scheduled) {
        console.warn('⚠️ [NotificationService] Timer not found:', timerId);
        return false;
      }

      clearTimeout(scheduled.timer);
      clearInterval(scheduled.timer);
      this.scheduledTimers.delete(timerId);

      console.log('✅ [NotificationService] Notification cancelled:', timerId);

      return true;
      
    } catch (error) {
      console.error('❌ [NotificationService] Error cancelling notification:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   * 
   * @returns {Array} Array of scheduled notification info
   */
  getScheduledNotifications() {
    return Array.from(this.scheduledTimers.entries()).map(([id, data]) => ({
      id,
      title: data.options.title,
      scheduledFor: data.scheduledFor,
      recurring: data.recurring || false,
      time: data.time,
    }));
  }

  /**
   * Handle navigation action when notification is clicked
   * TEACHING POINT: Navigate to specific screen based on action path
   * 
   * @param {string} action - Path to navigate to
   */
  handleNavigationAction(action) {
    try {
      console.log('🧭 [NotificationService] Navigating to:', action);

      // Use react-router navigation if available
      if (window.location.pathname !== action) {
        window.location.href = action;
      }
      
    } catch (error) {
      console.error('❌ [NotificationService] Navigation error:', error);
    }
  }

  /**
   * Store notification in history (localStorage)
   * 
   * @param {Object} notification - Notification data
   */
  storeNotificationInHistory(notification) {
    try {
      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      history.unshift(notification); // Add to beginning

      // Keep last 50 notifications
      const trimmedHistory = history.slice(0, 50);

      localStorage.setItem('notificationHistory', JSON.stringify(trimmedHistory));
      
    } catch (error) {
      console.error('❌ [NotificationService] Error storing notification:', error);
    }
  }

  /**
   * Store notification interaction (clicked/closed)
   * 
   * @param {string} tag - Notification tag
   * @param {string} action - 'clicked' or 'closed'
   */
  storeNotificationInteraction(tag, action) {
    try {
      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      const notification = history.find(n => n.tag === tag);

      if (notification) {
        notification.interaction = action;
        notification.interactionTime = new Date().toISOString();
        if (action === 'clicked') {
          notification.read = true;
        }
      }

      localStorage.setItem('notificationHistory', JSON.stringify(history));
      
    } catch (error) {
      console.error('❌ [NotificationService] Error storing interaction:', error);
    }
  }

  /**
   * Predefined notification templates for QuickMenu
   */
  templates = {
    itemAdded: (itemName) => ({
      title: '✅ Item Added Successfully',
      body: `"${itemName}" has been added to your menu`,
      icon: '/icon-192.png',
      tag: `item-added-${Date.now()}`,
      action: '/dashboard/preview',
    }),

    menuUpdated: () => ({
      title: '🔄 Menu Updated',
      body: 'Your menu changes have been saved',
      icon: '/icon-192.png',
      tag: `menu-updated-${Date.now()}`,
      action: '/dashboard/preview',
    }),

    qrGenerated: () => ({
      title: '📱 QR Code Ready',
      body: 'Your QR code is ready! Display it at your stall',
      icon: '/icon-192.png',
      tag: `qr-generated-${Date.now()}`,
      action: '/dashboard/qr',
    }),

    dailyReminder: () => ({
      title: '🌅 Good Morning!',
      body: "Don't forget to update today's specials",
      icon: '/icon-192.png',
      tag: `daily-reminder-${new Date().toDateString()}`,
      action: '/dashboard/editor',
    }),

    weeklyReview: () => ({
      title: '📊 Weekly Menu Review',
      body: 'Time to review and update your menu items',
      icon: '/icon-192.png',
      tag: `weekly-review-${Date.now()}`,
      action: '/dashboard/preview',
    }),

    inactiveReminder: (days) => ({
      title: '⚠️ Menu Update Reminder',
      body: `Your menu hasn't been updated in ${days} days. Keep it fresh!`,
      icon: '/icon-192.png',
      tag: `inactive-reminder-${Date.now()}`,
      action: '/dashboard/editor',
    }),
  };
}

// Export singleton instance
export default new NotificationService();
