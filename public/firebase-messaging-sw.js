/**
 * Firebase Cloud Messaging Service Worker
 * Handles push notifications when app is in background
 * 
 * TEACHING POINT: Service Workers run in background, separate from main app
 * They can receive FCM messages even when the browser/app is closed
 * 
 * LEARNING OBJECTIVES:
 * ✅ Handle background push notifications
 * ✅ Display notification with custom actions
 * ✅ Navigate to specific screen when notification is clicked
 * ✅ Understand service worker lifecycle
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Build Firebase config from service worker registration URL query params.
// This keeps repository code free of hardcoded keys.
const swUrl = new URL(self.location.href);
const swParams = swUrl.searchParams;

const firebaseConfig = {
  apiKey: swParams.get('apiKey') || '',
  authDomain: swParams.get('authDomain') || '',
  projectId: swParams.get('projectId') || '',
  storageBucket: swParams.get('storageBucket') || '',
  messagingSenderId: swParams.get('messagingSenderId') || '',
  appId: swParams.get('appId') || '',
};

/**
 * Initialize Firebase in service worker context
 * 
 * TEACHING POINT: Service workers need their own Firebase initialization
 * Cannot access the main app's Firebase instance
 * 
 * SECURITY NOTE: These credentials are from your .env file
 * For production, consider:
 * - Firebase App Check for additional security
 * - API key restrictions in Google Cloud Console
 * - Firestore security rules
 */
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) {
  console.error('[firebase-messaging-sw.js] Missing Firebase config in service worker URL params.');
} else {
  firebase.initializeApp(firebaseConfig);
}

// Get Firebase Messaging instance
const messaging = firebase.apps.length ? firebase.messaging() : null;

/**
 * Handle background messages
 * 
 * TEACHING POINT: onBackgroundMessage fires when:
 * 1. App is closed completely
 * 2. App is in background (minimized)
 * 3. Browser tab is not focused
 * 
 * When app is in foreground, use onMessage in fcmService.js instead
 */
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'QuickMenu';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification',
    icon: '/icon-192x192.png', // App icon
    badge: '/icon-192x192.png', // Small badge icon
    tag: payload.data?.tag || 'quickmenu-notification',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/dashboard',
      clickAction: payload.data?.clickAction || 'OPEN_APP',
      timestamp: Date.now(),
      ...payload.data // Include all custom data
    },
    // Action buttons (optional)
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: false, // Auto-dismiss after a few seconds
    vibrate: [200, 100, 200], // Vibration pattern
    sound: 'default'
  };

  /**
   * Show notification
   * 
   * TEACHING POINT: self.registration.showNotification() is the service worker
   * equivalent of new Notification() in the main thread
   */
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

/**
 * Handle notification click
 * 
 * TEACHING POINT: notificationclick event fires when user clicks the notification
 * Use this to navigate to specific screens in your app
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);

  // Close the notification
  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/dashboard';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  /**
   * Handle action button clicks
   * 
   * TEACHING POINT: event.action contains the action ID ('open' or 'dismiss')
   * Use this to handle different button clicks
   */
  if (event.action === 'dismiss') {
    // User clicked "Dismiss" - just close the notification
    return;
  }

  /**
   * Focus existing window or open new one
   * 
   * TEACHING POINT: clients.matchAll() finds all open windows/tabs of your app
   * This prevents opening multiple tabs and instead focuses the existing one
   */
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if any window is already open
        for (const client of clientList) {
          if (client.url === fullUrl && 'focus' in client) {
            // Found a window with the target URL - focus it
            return client.focus();
          }
        }

        // If there's any open window, navigate it to the target URL
        if (clientList.length > 0) {
          return clientList[0].focus().then(client => {
            return client.navigate(fullUrl);
          });
        }

        // No window open - open a new one
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

/**
 * Handle notification close
 * 
 * TEACHING POINT: Track when users dismiss notifications without clicking
 * Useful for analytics
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification);
  // Can send analytics event here if needed
});

/**
 * Service Worker Install Event
 * 
 * TEACHING POINT: Install event fires when SW is first registered
 * Use this to cache assets for offline support
 */
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Service Worker Activate Event
 * 
 * TEACHING POINT: Activate event fires after install
 * Use this to clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

console.log('[firebase-messaging-sw.js] Service worker loaded successfully');
