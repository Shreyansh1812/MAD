/**
 * usePWAInstall Hook
 * Manages PWA installation prompt and state
 */

import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(standalone);
      
      if (standalone) {
        console.log('✅ Running in standalone mode (installed PWA)');
      } else {
        console.log('🌐 Running in browser mode');
      }
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('💾 beforeinstallprompt event fired');
      
      // Prevent the default mini-infobar from appearing
      e.preventDefault();
      
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      console.log('✅ Install prompt saved - ready to show custom UI');
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      console.log('🎉 PWA was installed successfully');
      setDeferredPrompt(null);
      setIsInstallable(false);
      setHasInstalled(true);
      setIsStandalone(true);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the install prompt
   * @returns {Promise<{outcome: string}>} Result of installation
   */
  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ No install prompt available');
      return { outcome: 'not_available' };
    }

    console.log('📱 Showing install prompt...');

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`👤 User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    return { outcome };
  };

  /**
   * Dismiss the install prompt (hide the banner)
   */
  const dismissPrompt = () => {
    console.log('🙈 Install prompt dismissed by user');
    setIsInstallable(false);
  };

  return {
    isInstallable,        // Can the app be installed?
    isStandalone,         // Is app running as installed PWA?
    hasInstalled,         // Did user just install?
    promptInstall,        // Trigger install dialog
    dismissPrompt,        // Hide install banner
    canInstall: isInstallable && !isStandalone, // Should we show install UI?
  };
};
