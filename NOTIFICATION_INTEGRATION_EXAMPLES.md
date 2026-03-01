/**
 * Example: Integrating Notifications in Your App
 * 
 * This file shows how to use the notification system in your components.
 * Copy these examples into your actual components as needed.
 */

// ============================================================================
// EXAMPLE 1: Setup Permission Banner in App.jsx
// ============================================================================

import { NotificationPermissionBanner } from './components/Shared/NotificationPermissionBanner';

function App() {
  return (
    <>
      {/* Add banner at top of app */}
      <NotificationPermissionBanner />
      
      {/* Rest of your app */}
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}

// ============================================================================
// EXAMPLE 2: Notify When Adding Menu Item (in EditorPageNew.jsx)
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';

export const EditorPageNew = () => {
  const { notifyItemAdded } = useNotifications();
  
  const handleAddItem = (itemName) => {
    // ... save item to database ...
    
    // Notify user
    notifyItemAdded(itemName); // Shows: "✨ {itemName} added to your menu!"
  };
  
  return (
    // ... your component JSX ...
  );
};

// ============================================================================
// EXAMPLE 3: Notify When Saving Menu (in MenuEditor.jsx)
// ============================================================================

import { useNotifications } from '../../hooks/useNotifications';

export const MenuEditor = () => {
  const { notifyMenuUpdated } = useNotifications();
  
  const handleSaveMenu = async () => {
    // ... save menu to database ...
    
    // Notify user
    notifyMenuUpdated(); // Shows: "✅ Menu saved successfully!"
  };
  
  return (
    // ... your component JSX ...
  );
};

// ============================================================================
// EXAMPLE 4: Notify When Generating QR Code (in QRPage.jsx)
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';

export const QRPage = () => {
  const { notifyQRGenerated } = useNotifications();
  
  const handleGenerateQR = () => {
    // ... generate QR code ...
    
    // Notify user
    notifyQRGenerated(); // Shows: "🎉 QR Code generated! Ready to share."
  };
  
  return (
    // ... your component JSX ...
  );
};

// ============================================================================
// EXAMPLE 5: Custom Notification with Click Action
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';

export const MyComponent = () => {
  const { notify } = useNotifications();
  
  const handleSomething = () => {
    notify({
      title: '🎊 Special Offer!',
      body: 'Check out our new recipes',
      action: '/dashboard/recipes', // Clicking notification navigates here
      tag: 'special-offer', // Unique ID
      type: 'promotion' // Custom type for filtering
    });
  };
  
  return (
    // ... your component JSX ...
  );
};

// ============================================================================
// EXAMPLE 6: Schedule Delayed Notification
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';

export const MyComponent = () => {
  const { scheduleNotification } = useNotifications();
  
  const handleStartTask = () => {
    // Start a task that takes 5 minutes
    startLongRunningTask();
    
    // Remind user in 5 minutes
    scheduleNotification({
      title: '⏰ Task Complete',
      body: 'Your task has finished processing',
      action: '/dashboard/results',
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  };
  
  return (
    // ... your component JSX ...
  );
};

// ============================================================================
// EXAMPLE 7: Daily Reminder (Setup Once)
// ============================================================================

import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const App = () => {
  const { scheduleDailyReminder } = useNotifications();
  
  useEffect(() => {
    // Setup daily reminder at 9 AM
    scheduleDailyReminder();
    
    // Or with custom time:
    // scheduleDailyReminder({
    //   title: 'Good Morning! ☀️',
    //   body: 'Time to update your menu for today',
    //   action: '/dashboard/editor'
    // }, 9, 0); // 9:00 AM
  }, []); // Run once on mount
  
  return (
    // ... your app JSX ...
  );
};

// ============================================================================
// EXAMPLE 8: Setup FCM Push Notifications (in App.jsx or AccountPage.jsx)
// ============================================================================

import { useEffect } from 'react';
import { useFCM } from '../hooks/useFCM';

export const App = () => {
  const { requestToken, subscribeToTopic, fcmToken } = useFCM();
  
  useEffect(() => {
    const setupPushNotifications = async () => {
      // Request FCM token
      const token = await requestToken();
      
      if (token) {
        console.log('✅ FCM Token:', token);
        
        // Subscribe to topics (broadcast channels)
        await subscribeToTopic('all-users');
        await subscribeToTopic('menu-updates');
        await subscribeToTopic('promotions');
        
        // Optional: Send token to your backend
        // await sendTokenToServer(token);
      }
    };
    
    setupPushNotifications();
  }, []);
  
  return (
    // ... your app JSX ...
  );
};

// ============================================================================
// EXAMPLE 9: Handle FCM Messages When App is Open
// ============================================================================

import { useEffect } from 'react';
import { useFCM } from '../hooks/useFCM';
import { useNotifications } from '../hooks/useNotifications';

export const App = () => {
  const { latestMessage } = useFCM();
  const { notify } = useNotifications();
  
  // Listen for new FCM messages
  useEffect(() => {
    if (latestMessage) {
      console.log('📩 New FCM message:', latestMessage);
      
      // Show as local notification (already handled by fcmService)
      // Or trigger custom action:
      if (latestMessage.data?.action === 'refresh-menu') {
        // Refresh menu data
        refreshMenuData();
      }
    }
  }, [latestMessage]);
  
  return (
    // ... your app JSX ...
  );
};

// ============================================================================
// EXAMPLE 10: Clean Up Notifications on Logout
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';
import { useFCM } from '../hooks/useFCM';

export const AccountPage = () => {
  const { clearAll } = useNotifications();
  const { deleteToken } = useFCM();
  
  const handleLogout = async () => {
    // Clear notification history
    clearAll();
    
    // Delete FCM token
    await deleteToken();
    
    // ... rest of logout logic ...
  };
  
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

// ============================================================================
// EXAMPLE 11: Display Notification Badge on Custom Button
// ============================================================================

import { NotificationBadge } from '../components/Shared/NotificationBadge';
import { Bell } from 'lucide-react';

export const MyComponent = () => {
  return (
    <button className="relative">
      <Bell size={24} />
      <NotificationBadge />
    </button>
  );
};

// ============================================================================
// EXAMPLE 12: Check Permission Status Before Showing Features
// ============================================================================

import { useNotifications } from '../hooks/useNotifications';

export const MyComponent = () => {
  const { permission, requestPermission } = useNotifications();
  
  return (
    <div>
      {permission === 'granted' ? (
        <p>✅ Notifications enabled</p>
      ) : permission === 'denied' ? (
        <p>❌ Notifications blocked. Enable in browser settings.</p>
      ) : (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 13: Notification Center Link in Navigation
// ============================================================================

import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export const Header = () => {
  const { unreadCount } = useNotifications();
  
  return (
    <nav>
      <Link to="/dashboard/notifications" className="relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Link>
    </nav>
  );
};

// ============================================================================
// EXAMPLE 14: Weekly Reminder (Custom Schedule)
// ============================================================================

import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const App = () => {
  const { scheduleNotification } = useNotifications();
  
  useEffect(() => {
    // Schedule weekly reminder (every Monday at 10 AM)
    const scheduleWeeklyReminder = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
      
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(10, 0, 0, 0);
      
      const delayMs = nextMonday - now;
      
      scheduleNotification({
        title: '📅 Weekly Reminder',
        body: 'Time to review your weekly menu!',
        action: '/dashboard/preview',
      }, delayMs);
      
      // Re-schedule for next week (7 days later)
      setTimeout(scheduleWeeklyReminder, delayMs + 7 * 24 * 60 * 60 * 1000);
    };
    
    scheduleWeeklyReminder();
  }, []);
  
  return (
    // ... your app JSX ...
  );
};

// ============================================================================
// EXAMPLE 15: Notification on Network Status Change
// ============================================================================

import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const App = () => {
  const { notify } = useNotifications();
  
  useEffect(() => {
    const handleOnline = () => {
      notify({
        title: '🌐 Back Online',
        body: 'Your internet connection is restored',
        tag: 'network-status',
      });
    };
    
    const handleOffline = () => {
      notify({
        title: '📡 Offline Mode',
        body: 'Working in offline mode. Changes will sync when online.',
        tag: 'network-status',
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    // ... your app JSX ...
  );
};

// ============================================================================
// COMPLETE INTEGRATION EXAMPLE: EditorPageNew.jsx
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { useFCM } from '../hooks/useFCM';
import { MenuEditor } from '../components/MenuEditor/MenuEditor';
import { NotificationPermissionBanner } from '../components/Shared/NotificationPermissionBanner';

export const EditorPageNew = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const { showToast } = useToast();
  
  // Notification hooks
  const {
    notifyItemAdded,
    notifyMenuUpdated,
    scheduleDailyReminder,
  } = useNotifications();
  
  const { requestToken, subscribeToTopic } = useFCM();
  
  // Setup notifications on mount
  useEffect(() => {
    // Setup FCM
    const setupFCM = async () => {
      const token = await requestToken();
      if (token) {
        await subscribeToTopic('menu-updates');
      }
    };
    setupFCM();
    
    // Setup daily reminder
    scheduleDailyReminder();
  }, []);
  
  // Handle adding item
  const handleAddItem = (item) => {
    // ... save item logic ...
    
    // Notify user
    notifyItemAdded(item.name);
    showToast(`${item.name} added!`, 'success');
  };
  
  // Handle saving menu
  const handleSaveMenu = async () => {
    // ... save menu logic ...
    
    // Notify user
    notifyMenuUpdated();
    showToast('Menu saved!', 'success');
  };
  
  return (
    <div>
      {/* Permission banner (shows once) */}
      <NotificationPermissionBanner />
      
      {/* Menu editor */}
      <MenuEditor
        onAddItem={handleAddItem}
        onSaveMenu={handleSaveMenu}
      />
    </div>
  );
};

// ============================================================================
// NOTES:
// ============================================================================
// 
// 1. Always request permission before showing notifications
// 2. Use descriptive titles and bodies
// 3. Include click actions to navigate to relevant pages
// 4. Use unique tags to avoid duplicate notifications
// 5. Schedule daily reminders only once (not on every render)
// 6. Clean up scheduled notifications on component unmount if needed
// 7. Test notifications in multiple browsers (Chrome, Firefox, Edge)
// 8. Background notifications require service worker registration
// 9. FCM tokens should be sent to your backend for targeted push
// 10. Always check permission status before attempting to notify
// 
// ============================================================================
