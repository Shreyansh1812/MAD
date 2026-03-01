/**
 * Notification Storage Service
 * Manages notification history in localStorage
 * 
 * TEACHING POINT: Persist notification data locally, so users can:
 * - View notification history
 * - Mark as read/unread
 * - Clear old notifications
 * - Track notification interactions
 */

class NotificationStorageService {
  constructor() {
    this.storageKey = 'notificationHistory';
    this.maxNotifications = 100; // Keep last 100 notifications
  }

  /**
   * Get all notifications from storage
   * 
   * @returns {Array} Array of notification objects
   */
  getAllNotifications() {
    try {
      const notifications = localStorage.getItem(this.storageKey);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('❌ [NotificationStorage] Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notifications
   * 
   * @returns {Array} Array of unread notifications
   */
  getUnreadNotifications() {
    return this.getAllNotifications().filter(n => !n.read);
  }

  /**
   * Get unread count
   * 
   * @returns {number} Number of unread notifications
   */
  getUnreadCount() {
    return this.getUnreadNotifications().length;
  }

  /**
   * Add notification to storage
   * 
   * @param {Object} notification - Notification data
   * @returns {boolean} Success status
   */
  addNotification(notification) {
    try {
      const notifications = this.getAllNotifications();
      
      // Add to beginning of array
      notifications.unshift({
        ...notification,
        id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: notification.timestamp || new Date().toISOString(),
        read: notification.read || false,
      });

      // Trim to max notifications
      const trimmed = notifications.slice(0, this.maxNotifications);

      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      
      console.log('✅ [NotificationStorage] Notification added');
      return true;
      
    } catch (error) {
      console.error('❌ [NotificationStorage] Error adding notification:', error);
      return false;
    }
  }

  /**
   * Mark notification as read
   * 
   * @param {string} notificationId - Notification ID or tag
   * @returns {boolean} Success status
   */
  markAsRead(notificationId) {
    try {
      const notifications = this.getAllNotifications();
      const notification = notifications.find(n => n.id === notificationId || n.tag === notificationId);

      if (notification) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(notifications));
        console.log('✅ [NotificationStorage] Marked as read:', notificationId);
        return true;
      }

      return false;
      
    } catch (error) {
      console.error('❌ [NotificationStorage] Error marking as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   * 
   * @returns {boolean} Success status
   */
  markAllAsRead() {
    try {
      const notifications = this.getAllNotifications();
      const now = new Date().toISOString();

      notifications.forEach(n => {
        n.read = true;
        n.readAt = now;
      });

      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
      
      console.log('✅ [NotificationStorage] All notifications marked as read');
      return true;
      
    } catch (error) {
      console.error('❌ [NotificationStorage] Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   * 
   * @param {string} notificationId - Notification ID
   * @returns {boolean} Success status
   */
  deleteNotification(notificationId) {
    try {
      const notifications = this.getAllNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId && n.tag !== notificationId);

      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      console.log('✅ [NotificationStorage] Notification deleted:', notificationId);
      return true;
      
    } catch (error) {
      console.error('❌ [NotificationStorage] Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Clear all notifications
   * 
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      console.log('✅ [NotificationStorage] All notifications cleared');
      return true;
      
    } catch (error) {
      console.error('❌ [NotificationStorage] Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Get notifications by type/category
   * 
   * @param {string} type - Notification type
   * @returns {Array} Filtered notifications
   */
  getNotificationsByType(type) {
    return this.getAllNotifications().filter(n => n.type === type);
  }

  /**
   * Get notifications from last N days
   * 
   * @param {number} days - Number of days
   * @returns {Array} Recent notifications
   */
  getRecentNotifications(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.getAllNotifications().filter(n => {
      const notifDate = new Date(n.timestamp);
      return notifDate >= cutoffDate;
    });
  }

  /**
   * Get notification statistics
   * 
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const all = this.getAllNotifications();
    const unread = this.getUnreadNotifications();
    const recent = this.getRecentNotifications(7);

    return {
      total: all.length,
      unread: unread.length,
      read: all.length - unread.length,
      last7Days: recent.length,
      clicked: all.filter(n => n.interaction === 'clicked').length,
    };
  }
}

// Export singleton instance
export default new NotificationStorageService();
