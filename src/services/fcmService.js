/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notifications from server
 * 
 * LEARNING OBJECTIVES:
 * 1. Configure Firebase Cloud Messaging
 * 2. Receive push notifications (foreground & background)
 * 3. Handle notification payloads
 * 4. Subscribe to topics
 * 5. Manage FCM tokens
 * 
 * NOTE: FCM requires VAPID keys from Firebase Console.
 * Setup instructions in NOTIFICATION_SYSTEM_GUIDE.md
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../lib/firebase';
import notificationStorage from './notificationStorage';

/**
 * FCM Service Class
 * Manages Firebase Cloud Messaging functionality
 */
class FCMService {
  constructor() {
    this.messaging = null;
    this.serviceWorkerRegistration = null;
    this.fcmToken = null;
    this.isSupported = false;
    this.initialized = false;
  }

  /**
   * Build Firebase config map from env variables.
   */
  getFirebaseConfigFromEnv() {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  /**
   * Register service worker with Firebase config in query params.
   */
  async registerMessagingServiceWorker() {
    const config = this.getFirebaseConfigFromEnv();

    if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
      console.error('❌ [FCM] Missing Firebase config for service worker registration');
      return null;
    }

    const params = new URLSearchParams();
    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString().trim());
      }
    });

    const swUrl = `/firebase-messaging-sw.js?${params.toString()}`;
    const registration = await navigator.serviceWorker.register(swUrl);
    this.serviceWorkerRegistration = registration;

    return registration;
  }

  /**
   * Initialize Firebase Cloud Messaging
   * TEACHING POINT: Check browser support and initialize messaging
   * 
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Check if messaging is supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('⚠️ [FCM] Push notifications not supported in this browser');
        this.isSupported = false;
        return false;
      }

      console.log('🚀 [FCM] Initializing Firebase Cloud Messaging...');

      // Initialize messaging
      this.messaging = getMessaging(app);
      this.isSupported = true;
      this.initialized = true;

      // Ensure the SW used by FCM is registered with runtime config.
      await this.registerMessagingServiceWorker();

      // Set up foreground message handler
      this.setupForegroundHandler();

      console.log('✅ [FCM] Firebase Cloud Messaging initialized');

      return true;
      
    } catch (error) {
      console.error('❌ [FCM] Initialization error:', error);
      this.isSupported = false;
      return false;
    }
  }

  /**
   * Get FCM token for this device
   * TEACHING POINT: Token is unique identifier for sending push notifications
   * 
   * @returns {Promise<string|null>} FCM token
   */
  async getToken() {
    try {
      if (!this.isSupported || !this.messaging) {
        console.warn('⚠️ [FCM] Messaging not supported or initialized');
        return null;
      }

      // Check if we already have a token
      const storedToken = localStorage.getItem('fcmToken');
      if (storedToken) {
        console.log('ℹ️ [FCM] Using stored token');
        this.fcmToken = storedToken;
        return storedToken;
      }

      console.log('🔑 [FCM] Requesting FCM token...');

      // Get VAPID key from environment variables
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.warn('⚠️ [FCM] VAPID key not found in environment variables');
        console.log('ℹ️ [FCM] Add VITE_FIREBASE_VAPID_KEY to .env file');
        return null;
      }

      // Request token
      const token = await getToken(this.messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: this.serviceWorkerRegistration || undefined,
      });

      if (token) {
        console.log('✅ [FCM] Token obtained:', token.substring(0, 20) + '...');
        this.fcmToken = token;

        // Store token
        localStorage.setItem('fcmToken', token);
        localStorage.setItem('fcmTokenTimestamp', new Date().toISOString());

        // Send token to server (if you have backend)
        // await this.sendTokenToServer(token);

        return token;
      } else {
        console.warn('⚠️ [FCM] No registration token available');
        return null;
      }
      
    } catch (error) {
      console.error('❌ [FCM] Error getting token:', error);
      
      if (error.code === 'messaging/permission-blocked') {
        console.log('🚫 [FCM] Notification permission denied by user');
      }
      
      return null;
    }
  }

  /**
   * Set up handler for foreground messages
   * TEACHING POINT: onMessage receives push notifications when app is open
   */
  setupForegroundHandler() {
    if (!this.messaging) return;

    // TEACHING POINT: onMessage handles notifications while app is in foreground
    onMessage(this.messaging, (payload) => {
      console.log('📬 [FCM] Foreground message received:', payload);

      const notificationData = {
        title: payload.notification?.title || 'QuickMenu',
        body: payload.notification?.body || 'New notification',
        icon: payload.notification?.icon || '/icon-192.png',
        tag: payload.data?.tag || `fcm-${Date.now()}`,
        action: payload.data?.action || null,
        data: payload.data || {},
        type: 'push',
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Store in history
      notificationStorage.addNotification(notificationData);

      // Show browser notification
      this.showForegroundNotification(notificationData);

      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('fcmMessage', { detail: payload }));
    });

    console.log('✅ [FCM] Foreground message handler set up');
  }

  /**
   * Show notification in foreground
   * 
   * @param {Object} data - Notification data
   */
  showForegroundNotification(data) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon,
        tag: data.tag,
        data: data.data,
      });

      notification.onclick = () => {
        notification.close();
        if (data.action) {
          window.location.href = data.action;
        }
      };
    }
  }

  /**
   * Subscribe to notification topic
   * TEACHING POINT: Topics allow broadcasting to multiple devices
   * 
   * @param {string} topic - Topic name (e.g., 'menu_updates', 'promotions')
   * @returns {Promise<boolean>} Success status
   */
  async subscribeToTopic(topic) {
    try {
      if (!this.fcmToken) {
        console.warn('⚠️ [FCM] No token available, get token first');
        return false;
      }

      console.log(`📢 [FCM] Subscribing to topic: ${topic}`);

      // Store subscription locally
      const subscriptions = JSON.parse(localStorage.getItem('fcmTopics') || '[]');
      if (!subscriptions.includes(topic)) {
        subscriptions.push(topic);
        localStorage.setItem('fcmTopics', JSON.stringify(subscriptions));
      }

      console.log(`✅ [FCM] Subscribed to topic: ${topic}`);

      // If you have a backend, call API to subscribe:
      // await fetch('/api/subscribe-to-topic', {
      //   method: 'POST',
      //   body: JSON.stringify({ token: this.fcmToken, topic }),
      // });

      return true;
      
    } catch (error) {
      console.error(`❌ [FCM] Error subscribing to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe from notification topic
   * 
   * @param {string} topic - Topic name
   * @returns {Promise<boolean>} Success status
   */
  async unsubscribeFromTopic(topic) {
    try {
      console.log(`📢 [FCM] Unsubscribing from topic: ${topic}`);

      // Remove from local storage
      const subscriptions = JSON.parse(localStorage.getItem('fcmTopics') || '[]');
      const filtered = subscriptions.filter(t => t !== topic);
      localStorage.setItem('fcmTopics', JSON.stringify(filtered));

      console.log(`✅ [FCM] Unsubscribed from topic: ${topic}`);

      return true;
      
    } catch (error) {
      console.error(`❌ [FCM] Error unsubscribing from topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Get list of subscribed topics
   * 
   * @returns {Array} Array of topic names
   */
  getSubscribedTopics() {
    return JSON.parse(localStorage.getItem('fcmTopics') || '[]');
  }

  /**
   * Delete FCM token (logout)
   * 
   * @returns {Promise<boolean>} Success status
   */
  async deleteToken() {
    try {
      if (this.fcmToken) {
        // Note: deleteToken() requires Firebase Messaging v9.0+
        console.log('🗑️ [FCM] Deleting token...');
        
        // Clear local storage
        localStorage.removeItem('fcmToken');
        localStorage.removeItem('fcmTokenTimestamp');
        this.fcmToken = null;

        console.log('✅ [FCM] Token deleted');
        return true;
      }

      return false;
      
    } catch (error) {
      console.error('❌ [FCM] Error deleting token:', error);
      return false;
    }
  }

  /**
   * Check if FCM is supported and initialized
   * 
   * @returns {boolean}
   */
  isAvailable() {
    return this.isSupported && this.initialized;
  }

  /**
   * Get token info
   * 
   * @returns {Object} Token information
   */
  getTokenInfo() {
    return {
      token: this.fcmToken,
      timestamp: localStorage.getItem('fcmTokenTimestamp'),
      topics: this.getSubscribedTopics(),
      supported: this.isSupported,
      initialized: this.initialized,
    };
  }
}

// Export singleton instance
export default new FCMService();
