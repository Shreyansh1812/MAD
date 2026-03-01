/**
 * Notification Center Page
 * Displays notification history and allows management
 * 
 * LEARNING OBJECTIVES DEMONSTRATED:
 * ✅ Display notification history in card/list format
 * ✅ Mark notifications as read/unread
 * ✅ Click actions to navigate to specific screens
 * ✅ Clear notifications
 * ✅ Show loading and empty states
 */

import { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, CheckCheck, Clock, ChefHat, QrCode, Edit, Eye, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';
import { Alert } from '../components/Shared/Alert';

export const NotificationCenterPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filter notifications
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  /**
   * Handle notification click - navigate and mark as read
   */
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id || notification.tag);
    }

    // Navigate to action if available
    if (notification.action) {
      navigate(notification.action);
    }
  };

  /**
   * Get icon based on notification type
   */
  const getNotificationIcon = (notification) => {
    if (notification.action?.includes('/editor')) return Edit;
    if (notification.action?.includes('/preview')) return Eye;
    if (notification.action?.includes('/qr')) return QrCode;
    if (notification.action?.includes('/recipes')) return ChefHat;
    return Bell;
  };

  /**
   * Format timestamp as relative time
   */
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b-4 border-blue-500">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                <Bell className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600 font-medium">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearAll}
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>Notification Lab Feature:</strong> Click any notification to navigate to the relevant screen.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Demonstrates local notifications, scheduling, and click actions.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <EmptyState
              icon={filter === 'unread' ? BellOff : Bell}
              title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
              description={
                filter === 'unread'
                  ? 'All caught up! Check back later.'
                  : 'Notifications will appear here when you receive them'
              }
            />
          </div>
        )}

        {/* Notification List */}
        {filteredNotifications.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification);
              const isUnread = !notification.read;

              return (
                <div
                  key={notification.id || notification.tag || index}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 cursor-pointer border-2 ${
                    isUnread
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-blue-200'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      isUnread
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                        : 'bg-gray-200'
                    }`}>
                      <Icon className={isUnread ? 'text-white' : 'text-gray-500'} size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-base font-bold leading-tight ${
                          isUnread ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        {/* Unread Badge */}
                        {isUnread && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed mb-2 ${
                        isUnread ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.body}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {notification.type && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                            {notification.type}
                          </span>
                        )}

                        {notification.action && (
                          <span className="text-blue-600 font-medium">
                            Tap to open →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center space-y-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="w-full max-w-md"
            >
              <CheckCheck size={20} className="mr-2" />
              Mark All as Read
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={clearAll}
              className="w-full max-w-md"
            >
              <Trash2 size={20} className="mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white px-6 py-4">
              <p className="text-sm text-gray-600 font-medium">
                Total <span className="font-black text-blue-600">{notifications.length}</span> notification{notifications.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last 100 notifications are kept
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
