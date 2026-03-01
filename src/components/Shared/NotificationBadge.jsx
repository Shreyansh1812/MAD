/**
 * Notification Badge Component
 * Displays unread notification count as a red badge
 * 
 * LEARNING OBJECTIVES:
 * ✅ Real-time badge updates based on state
 * ✅ Conditional rendering (hide when count is 0)
 * ✅ Absolute positioning for badge overlay
 * ✅ Custom hook integration
 */

import { useNotifications } from '../../hooks/useNotifications';

export const NotificationBadge = () => {
  const { unreadCount } = useNotifications();

  // Don't render badge if no unread notifications
  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
};
