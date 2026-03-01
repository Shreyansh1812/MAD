/**
 * Custom Hook: useFCM
 * Manages Firebase Cloud Messaging (Push Notifications)
 * 
 * LEARNING OBJECTIVES:
 * 1. Initialize Firebase Cloud Messaging
 * 2. Get FCM token for device
 * 3. Handle incoming push messages
 * 4. Subscribe/unsubscribe to topics
 * 5. Track FCM state
 * 
 * USAGE:
 * const { fcmToken, initialize, subscribe } = useFCM();
 */

import { useState, useEffect, useCallback } from 'react';
import fcmService from '../services/fcmService';
import notificationStorage from '../services/notificationStorage';

export const useFCM = () => {
  // FCM token
  const [fcmToken, setFcmToken] = useState(null);
  
  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Support status
  const [isSupported, setIsSupported] = useState(false);
  
  // Subscribed topics
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  
  // Latest message
  const [latestMessage, setLatestMessage] = useState(null);

  /**
   * Initialize FCM on mount
   */
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      
      const initialized = await fcmService.initialize();
      setIsInitialized(initialized);
      setIsSupported(fcmService.isSupported);
      
      if (initialized) {
        // Load existing token if available
        const token = localStorage.getItem('fcmToken');
        if (token) {
          setFcmToken(token);
        }
        
        // Load subscribed topics
        const topics = fcmService.getSubscribedTopics();
        setSubscribedTopics(topics);
        
        // Set up message listener
        setupMessageListener();
      }
      
      setIsInitializing(false);
      
      console.log('🚀 [useFCM] Hook initialized, supported:', initialized);
    };

    init();
  }, []);

  /**
   * Set up listener for FCM messages
   */
  const setupMessageListener = useCallback(() => {
    // Listen for custom FCM message events
    const handleMessage = (event) => {
      console.log('📬 [useFCM] Message received:', event.detail);
      setLatestMessage(event.detail);
      
      // Reload notifications to show new one
      // This happens automatically via notificationStorage in fcmService
    };

    window.addEventListener('fcmMessage', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('fcmMessage', handleMessage);
    };
  }, []);

  /**
   * Request FCM token
   */
  const requestToken = useCallback(async () => {
    try {
      if (!isInitialized) {
        console.warn('⚠️ [useFCM] FCM not initialized');
        return null;
      }

      const token = await fcmService.getToken();
      setFcmToken(token);
      
      console.log('✅ [useFCM] Token obtained');
      
      return token;
      
    } catch (error) {
      console.error('❌ [useFCM] Error getting token:', error);
      return null;
    }
  }, [isInitialized]);

  /**
   * Subscribe to notification topic
   * 
   * @param {string} topic - Topic name
   * @returns {Promise<boolean>} Success status
   */
  const subscribeToTopic = useCallback(async (topic) => {
    const success = await fcmService.subscribeToTopic(topic);
    
    if (success) {
      const topics = fcmService.getSubscribedTopics();
      setSubscribedTopics(topics);
    }
    
    return success;
  }, []);

  /**
   * Unsubscribe from notification topic
   * 
   * @param {string} topic - Topic name
   * @returns {Promise<boolean>} Success status
   */
  const unsubscribeFromTopic = useCallback(async (topic) => {
    const success = await fcmService.unsubscribeFromTopic(topic);
    
    if (success) {
      const topics = fcmService.getSubscribedTopics();
      setSubscribedTopics(topics);
    }
    
    return success;
  }, []);

  /**
   * Delete FCM token (logout)
   */
  const deleteToken = useCallback(async () => {
    const success = await fcmService.deleteToken();
    
    if (success) {
      setFcmToken(null);
      setSubscribedTopics([]);
    }
    
    return success;
  }, []);

  /**
   * Get token info
   */
  const getTokenInfo = useCallback(() => {
    return fcmService.getTokenInfo();
  }, []);

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    // Delete old token
    await deleteToken();
    
    // Get new token
    return await requestToken();
  }, [deleteToken, requestToken]);

  // Return API
  return {
    // State
    fcmToken,
    isInitialized,
    isInitializing,
    isSupported,
    subscribedTopics,
    latestMessage,
    hasToken: !!fcmToken,
    
    // Actions
    requestToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    deleteToken,
    refreshToken,
    getTokenInfo,
    
    // Computed state
    isAvailable: isSupported && isInitialized,
  };
};
