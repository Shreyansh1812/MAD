/**
 * BottomNavigation Component
 * Practical 08: Multi-Screen Navigation UI
 * 
 * Mobile-first navigation bar for switching between main app screens
 * Similar to:
 * - Android: BottomNavigationView (Material Design)
 * - Flutter: BottomNavigationBar
 * - iOS: UITabBarController
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Edit3, Eye, User, QrCode as QrCodeIcon, ChefHat, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';
import { NotificationBadge } from '../Shared/NotificationBadge';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lightTap } = useHaptics();

  // Navigation items configuration
  const navItems = [
    {
      id: 'editor',
      label: 'Editor',
      icon: Edit3,
      path: '/dashboard/editor',
      color: 'text-blue-500',
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: Eye,
      path: '/dashboard/preview',
      color: 'text-green-500',
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: ChefHat,
      path: '/dashboard/recipes',
      color: 'text-orange-500',
    },
    {
      id: 'qr',
      label: 'QR Code',
      icon: QrCodeIcon,
      path: '/dashboard/qr',
      color: 'text-purple-500',
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      path: '/dashboard/notifications',
      color: 'text-red-500',
      badge: true, // Show badge for unread count
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      path: '/dashboard/account',
      color: 'text-pink-500',
    },
  ];

  const handleNavClick = (path) => {
    lightTap(); // Haptic feedback for mobile feel
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      {/* Safe area for iOS notch */}
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              aria-label={item.label}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-b-full"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
                className="relative"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    active ? item.color : 'text-gray-400'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {/* Notification Badge */}
                {item.badge && <NotificationBadge />}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  active ? item.color : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * ARCHITECTURE COMPARISON:
 * 
 * 1. REACT ROUTER vs ANDROID NAVIGATION:
 *    React: useNavigate() hook for programmatic navigation
 *    Android: navController.navigate(R.id.destination)
 *    Both: Declarative navigation with back stack management
 * 
 * 2. BOTTOM NAVIGATION PATTERNS:
 *    React: Custom component with react-router-dom
 *    Android: BottomNavigationView + Navigation Component
 *    Flutter: Scaffold with bottomNavigationBar property
 * 
 * 3. ACTIVE STATE TRACKING:
 *    React: useLocation() hook from react-router
 *    Android: setupWithNavController() for auto-highlighting
 *    Flutter: currentIndex property on BottomNavigationBar
 * 
 * 4. MOBILE UX FEATURES:
 *    ✅ Haptic feedback on tap (like native apps)
 *    ✅ Smooth animations (Framer Motion)
 *    ✅ Safe area support for iOS notch
 *    ✅ Active tab indicator with spring animation
 */
